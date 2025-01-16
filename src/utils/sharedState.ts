export let lastCursorPosition: {
  path: string;
  line: number;
  col: number;
} | null = null;

export function updateLastCursorPosition(
  path: string,
  line: number,
  col: number,
): void {
  lastCursorPosition = { path, line, col };
}
