export default {
  app: {
    title: "JSON Viewer",
  },
  tabs: {
    text: "Text",
    tree: "Tree",
    table: "Table",
  },
  tree: {
    expandAll: "Expand All",
    collapseAll: "Collapse All",
    expandLevel: "Expand Level",
  },
  text: {
    parseAndView: "Parse & View",
    format: "Format",
    openFile: "Open File",
    copy: "Copy",
    copied: "Copied!",
    emptyError: "Please enter JSON text",
    placeholder: "Paste your JSON here...",
  },
  confirm: {
    openFile: "Open File",
    openFileMessage: "Will you open the file {name}?",
    yes: "Yes",
    no: "No",
  },
  table: {
    key: "Key",
    value: "Value",
    type: "Type",
    index: "#",
    empty: "empty",
    keys: "keys",
    items: "items",
  },
  drop: {
    title: "Drop JSON file here",
    hint: "Drop a JSON file onto the panel to view it",
  },
};

export type Locale = typeof import("./en").default;
