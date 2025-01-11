import * as vscode from "vscode";
import * as fs from "fs";
import { WebSocketHandler } from "./websocket/handler";
import { CursorPos, SelectionPos, TextContent } from "./types/messages";
import { generateRandomString, getCursorPosition } from "./utils/editor";

let wsHandler: WebSocketHandler;
let outputChannel: vscode.OutputChannel;

async function createDirectoryWithMessage() {
  const directoryPath = `/tmp/${generateRandomString()}`;
  fs.mkdirSync(directoryPath);
  vscode.window.showInformationMessage(`Directory created: ${directoryPath}`);
  await vscode.env.clipboard.writeText(directoryPath);
}

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("vim-share");
  wsHandler = new WebSocketHandler(outputChannel);

  const connCmd = vscode.commands.registerCommand("shareedit.connect", () =>
    wsHandler.connect(),
  );

  vscode.window.onDidChangeTextEditorSelection((event) => {
    const document = event.textEditor.document;
    const selection = event.selections[0]; // Get the primary selection
    const isEmpty = selection.isEmpty;

    // TODO
    // if (isEmpty) {
    //   const cursorPosition = getCursorPosition();
    //   const cursorPos: CursorPos = {
    //     type: "CursorPos",
    //     sender: "vscode",
    //     path: document.uri.fsPath,
    //     line: cursorPosition.line,
    //     col: cursorPosition.col,
    //   };
    //
    //   wsHandler.sendMessage(cursorPos);
    // } else {
    //   const selectionPos: SelectionPos = {
    //     type: "SelectionPos",
    //     startCol: selection.start.character,
    //     startLine: selection.start.line,
    //     endCol: selection.end.character,
    //     endLine: selection.end.line,
    //     path: document.uri.fsPath,
    //   };
    //
    //   wsHandler.sendMessage(selectionPos);
    // }
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    const document = event.document;
    const cursorPosition = getCursorPosition();

    const textContent: TextContent = {
      type: "TextContent",
      sender: "vscode",
      text: document.getText(),
      path: document.uri.fsPath,
      cursorCol: cursorPosition.col,
      cursorLine: cursorPosition.line,
    };

    wsHandler.sendMessage(textContent);
  });

  context.subscriptions.push(connCmd);
}

export function deactivate() {
  wsHandler?.close();
}
