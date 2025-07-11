import type { editor } from 'monaco-editor';

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  lineNumbers: "on",
  minimap: { enabled: false },
  scrollbar: {
    vertical: "auto",
    horizontal: "hidden",
  },
  folding: true,
  lineDecorationsWidth: 2,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: false,
  renderLineHighlight: "none",
  guides: {
    indentation: true,
    highlightActiveIndentation: true,
  },
  renderWhitespace: "none",
  renderControlCharacters: false,
  fontSize: 14,
  fontFamily: "'Fira Code', monospace",
  cursorStyle: "line",
  cursorBlinking: "smooth",
  smoothScrolling: true,
  scrollBeyondLastLine: false,
};
