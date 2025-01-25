export let lastCursorPosition: {
  path: string;
  line: number;
  col: number;
  centerLine: number | null;
} | null = null;

export function updateLastCursorPosition(
  path: string,
  line: number,
  col: number,
  centerLine: number | null,
): void {
  lastCursorPosition = { path, line, col, centerLine };
}
