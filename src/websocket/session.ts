import * as vscode from "vscode";
import * as fs from "fs";

interface SessionInfo {
  port: number;
  directory: string;
  timestamp: number;
}
export async function getConfigPath(): Promise<string> {
  const platform = process.platform;
  if (platform === "win32") {
    const appData = process.env.APPDATA;
    if (!appData) {
      throw new Error("APPDATA environment variable not found");
    }
    return `${appData}\\shareedit\\sessions.json`;
  } else {
    const homeDir = process.env.HOME;
    if (!homeDir) {
      throw new Error("HOME environment variable not found");
    }
    return `${homeDir}/.config/shareedit/sessions.json`;
  }
}

export async function getSessions(): Promise<SessionInfo[]> {
  try {
    const configPath = await getConfigPath();
    const content = await fs.promises.readFile(configPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

/**
 * @returns port number or undefined
 */
export async function showSessionSelector(): Promise<number | undefined> {
  const sessions = await getSessions();

  if (sessions.length === 0) {
    vscode.window.showErrorMessage("No active ShareEdit sessions found");
    return;
  }

  const currentFile = vscode.window.activeTextEditor?.document.uri.fsPath;
  const items = sessions
    .sort((a, b) => {
      // Prioritize sessions whose directory contains the current file
      const aContainsFile = currentFile?.startsWith(a.directory) || false;
      const bContainsFile = currentFile?.startsWith(b.directory) || false;
      if (aContainsFile && !bContainsFile) {
        return -1;
      }
      if (!aContainsFile && bContainsFile) {
        return 1;
      }

      // If priority is the same, compare by timestamp (newest first)
      return b.timestamp - a.timestamp;
    })
    .map((session) => {
      const date = new Date(session.timestamp);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      return {
        label: `Port ${session.port}`,
        description: `${session.directory} (${formattedDate})`,
        port: session.port,
      };
    });

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a ShareEdit session to connect to",
  });
  if (!selected) {
    return;
  }
  return selected.port;
}
