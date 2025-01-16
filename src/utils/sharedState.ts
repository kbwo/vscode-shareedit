export let lastCursorPosition: { line: number; col: number } | null = null;

export function updateLastCursorPosition(line: number, col: number): void {
  lastCursorPosition = { line, col };
} 