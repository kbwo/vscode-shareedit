import * as vscode from "vscode";
import { WebSocketHandler } from "./websocket/handler";
import { CursorPos } from "./types/messages";
import debounce from "debounce";
import {
  lastCursorPosition,
  updateLastCursorPosition,
} from "./utils/sharedState";
import { getCenterLine, getCursorPosition } from "./utils/editor";

let wsHandler: WebSocketHandler;
let outputChannel: vscode.OutputChannel;

// Create a debounced version of the cursor position sender
const debouncedSendCursorPos = debounce(
  (
    document: vscode.TextDocument,
    cursorPosition: ReturnType<typeof getCursorPosition>,
    centerLine: number | null,
  ) => {
    if (
      lastCursorPosition &&
      lastCursorPosition.path === cursorPosition.path &&
      lastCursorPosition.line === cursorPosition.line &&
      lastCursorPosition.col === cursorPosition.col &&
      lastCursorPosition.centerLine === centerLine
    ) {
      return; // Do not send if the position hasn't changed
    }

    updateLastCursorPosition(
      cursorPosition.path,
      cursorPosition.line,
      cursorPosition.col,
      centerLine,
    );

    const cursorPos: CursorPos = {
      type: "CursorPos",
      sender: "vscode",
      path: document.uri.fsPath,
      line: cursorPosition.line,
      col: cursorPosition.col,
      centerLine,
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

  // Watch changes in visible range
  vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
    if (!event.textEditor.document || !vscode.window.state.focused) {
      return;
    }

    const centerLine = getCenterLine();
    console.warn("DEBUGPRINT[24]: extension.ts:69: centerLine=", centerLine);

    const cursorPosition = getCursorPosition();
    debouncedSendCursorPos(
      event.textEditor.document,
      cursorPosition,
      centerLine,
    );
  });

  vscode.window.onDidChangeTextEditorSelection((event) => {
    const document = event.textEditor.document;
    const selection = event.selections[0]; // Get the primary selection
    const isEmpty = selection.isEmpty;
    const isFocused =
      vscode.window.state.focused === true &&
      vscode.window.activeTextEditor === event.textEditor;

    if (!isFocused) {
      return;
    }
    const centerLine = getCenterLine();

    if (isEmpty) {
      const cursorPosition = getCursorPosition();
      debouncedSendCursorPos(document, cursorPosition, centerLine);
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
