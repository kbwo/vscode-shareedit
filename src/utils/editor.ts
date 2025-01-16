import * as vscode from "vscode";

export function generateRandomString(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function setCursorPosition(vimLine: number, vimCol: number): void {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const newPosition = new vscode.Position(vimLine - 1, vimCol - 1);
    const newSelection = new vscode.Selection(newPosition, newPosition);
    editor.selection = newSelection;
    editor.revealRange(newSelection);
  }
}

export function selectRange(
  startLine: number,
  startCharacter: number,
  endLine: number,
  endCharacter: number,
): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const startPosition = new vscode.Position(startLine, startCharacter);
  const endPosition = new vscode.Position(endLine, endCharacter);
  const selection = new vscode.Selection(startPosition, endPosition);
  editor.selection = selection;
  editor.revealRange(selection);
}

export function getCursorPosition(): {
  path: string;
  line: number;
  col: number;
} {
  const editor = vscode.window.activeTextEditor;
  const filePath = editor ? editor.document.uri.fsPath : "";
  if (!editor) {
    return {
      path: filePath,
      line: 1,
      col: 1,
    };
  }
  const position = editor.selection.active;
  return {
    path: filePath,
    line: position.line + 1,
    col: position.character + 1,
  };
}

export function getFilePath(): string {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return "";
  }
  return editor.document.uri.fsPath;
}

export function replaceFileContent(newContent: string): void {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length),
    );

    editor.edit((editBuilder) => {
      editBuilder.replace(fullRange, newContent);
    });
  }
}
