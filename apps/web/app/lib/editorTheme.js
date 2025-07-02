export const customEditorTheme = {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6A737D", fontStyle: "italic" }, // gray-500
    { token: "keyword", foreground: "D73A49", fontStyle: "bold" }, // red-600
    { token: "identifier", foreground: "005CC5" }, // blue-600
    { token: "string", foreground: "032F62" }, // blue-800
    { token: "number", foreground: "E36209" }, // orange-600
    { token: "delimiter", foreground: "24292E" }, // gray-800
    { token: "type", foreground: "E36209" }, // orange-600
    { token: "function", foreground: "6F42C1", fontStyle: "bold" }, // purple-700
    { token: "variable", foreground: "E36209" }, // orange-600
    { token: "class", foreground: "D73A49", fontStyle: "bold" }, // red-600
    { token: "interface", foreground: "D73A49", fontStyle: "bold" }, // red-600
    { token: "namespace", foreground: "D73A49", fontStyle: "bold" }, // red-600
    { token: "parameter", foreground: "24292E" }, // gray-800
    { token: "property", foreground: "005CC5" }, // blue-600
    { token: "punctuation", foreground: "24292E" }, // gray-800
    { token: "operator", foreground: "D73A49" }, // red-600
    { token: "regexp", foreground: "032F62" }, // blue-800
    { token: "decorator", foreground: "6F42C1", fontStyle: "bold" }, // purple-700
    { token: "tag", foreground: "22863A" }, // green-600
    { token: "attribute.name", foreground: "6F42C1" }, // purple-700
    { token: "attribute.value", foreground: "032F62" }, // blue-800
  ],
  colors: {
    "editor.background": "#ffffff", // white
    "editor.foreground": "#24292E", // gray-800
    "editor.selectionBackground": "#FDBA74", // orange-300
    "editor.lineHighlightBackground": "#F3F4F6", // gray-100
    "editorCursor.foreground": "#000000", // black
    "editorWhitespace.foreground": "#D1D5DB", // gray-300
    "editorIndentGuide.background": "#D1D5DB", // gray-300
    "editorIndentGuide.activeBackground": "#9CA3AF", // gray-400
  },
};
