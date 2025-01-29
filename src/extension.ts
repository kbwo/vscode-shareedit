import * as vscode from "vscode";
import { WebSocketHandler } from "./websocket/handler";
import { CursorPos, SelectionPos } from "./types/messages";
import { getCursorPosition, isFocused } from "./utils/editor";
import debounce from "debounce";
import {
  lastCursorPosition,
  updateLastCursorPosition,
} from "./utils/sharedState";

let wsHandler: WebSocketHandler;
let outputChannel: vscode.OutputChannel;

// Create a debounced version of the cursor position sender
const debouncedSendCursorPos = debounce(
  (
    document: vscode.TextDocument,
    cursorPosition: ReturnType<typeof getCursorPosition>,
  ) => {
    if (
      lastCursorPosition &&
      lastCursorPosition.path === cursorPosition.path &&
      lastCursorPosition.line === cursorPosition.line &&
      lastCursorPosition.col === cursorPosition.col
    ) {
      return; // Do not send if the position hasn't changed
    }

    updateLastCursorPosition(
      cursorPosition.path,
      cursorPosition.line,
      cursorPosition.col,
    );

    const cursorPos: CursorPos = {
      type: "CursorPos",
      sender: "vscode",
      path: document.uri.fsPath,
      line: cursorPosition.line,
      col: cursorPosition.col,
    };
    wsHandler.sendMessage(cursorPos);
  },
  50,
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
    const isActive =
      isFocused() && vscode.window.activeTextEditor === event.textEditor;

    if (!isActive) {
      return;
    }

    if (isEmpty) {
      const cursorPosition = getCursorPosition();
      debouncedSendCursorPos(document, cursorPosition);
    } else {
      // TODO
      const selectionPos: SelectionPos = {
        type: "SelectionPos",
        startCol: selection.start.character,
        startLine: selection.start.line,
        endCol: selection.end.character,
        endLine: selection.end.line,
        path: document.uri.fsPath,
      };

      wsHandler.sendMessage(selectionPos);
    }
  });

  context.subscriptions.push(connCmd, disconnCmd);
}

export function deactivate() {
  wsHandler?.close();
}
