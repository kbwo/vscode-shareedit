import * as vscode from "vscode";
import * as fs from "fs";
import { WebSocketHandler } from "./websocket/handler";
import { CursorPos, SelectionPos, TextContent } from "./types/messages";
import { generateRandomString, getCursorPosition } from "./utils/editor";
import debounce from "debounce";
import {
  lastCursorPosition,
  updateLastCursorPosition,
} from "./utils/sharedState";

let wsHandler: WebSocketHandler;
let outputChannel: vscode.OutputChannel;

async function createDirectoryWithMessage() {
  const directoryPath = `/tmp/${generateRandomString()}`;
  fs.mkdirSync(directoryPath);
  vscode.window.showInformationMessage(`Directory created: ${directoryPath}`);
  await vscode.env.clipboard.writeText(directoryPath);
}

// Create a debounced version of the cursor position sender
const debouncedSendCursorPos = debounce(
  (
    document: vscode.TextDocument,
    cursorPosition: { line: number; col: number },
  ) => {
    if (
      lastCursorPosition &&
      lastCursorPosition.line === cursorPosition.line &&
      lastCursorPosition.col === cursorPosition.col
    ) {
      return; // Do not send if the position hasn't changed
    }

    updateLastCursorPosition(cursorPosition.line, cursorPosition.col); // Update last position

    const cursorPos: CursorPos = {
      type: "CursorPos",
      sender: "vscode",
      path: document.uri.fsPath,
      line: cursorPosition.line,
      col: cursorPosition.col,
    };
    wsHandler.sendMessage(cursorPos);
  },
  100,
);

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("shareedit");
  wsHandler = new WebSocketHandler(outputChannel);

  const connCmd = vscode.commands.registerCommand("shareedit.connect", () =>
    wsHandler.connect(),
  );

  const disconnCmd = vscode.commands.registerCommand(
    "shareedit.disconnect",
    () => wsHandler.disconnect(),
  );

  vscode.window.onDidChangeTextEditorSelection((event) => {
    const document = event.textEditor.document;
    const selection = event.selections[0]; // Get the primary selection
    const isEmpty = selection.isEmpty;

    // TODO
    if (isEmpty) {
      const cursorPosition = getCursorPosition();
      debouncedSendCursorPos(document, cursorPosition);
    } else {
      // TODO
      // const selectionPos: SelectionPos = {
      //   type: "SelectionPos",
      //   startCol: selection.start.character,
      //   startLine: selection.start.line,
      //   endCol: selection.end.character,
      //   endLine: selection.end.line,
      //   path: document.uri.fsPath,
      // };
      //
      // wsHandler.sendMessage(selectionPos);
    }
  });

  // vscode.workspace.onDidChangeTextDocument((event) => {
  //   const document = event.document;
  //   const cursorPosition = getCursorPosition();
  //
  //   const textContent: TextContent = {
  //     type: "TextContent",
  //     sender: "vscode",
  //     text: document.getText(),
  //     path: document.uri.fsPath,
  //     cursorCol: cursorPosition.col,
  //     cursorLine: cursorPosition.line,
  //   };
  //
  //   wsHandler.sendMessage(textContent);
  // });

  context.subscriptions.push(connCmd, disconnCmd);
}

export function deactivate() {
  wsHandler?.close();
}
