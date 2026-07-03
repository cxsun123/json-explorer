export type JsonNodeType = "object" | "array" | "string" | "number" | "boolean" | "null";

export interface JsonNodeInfo {
  type: JsonNodeType;
  key: string;
  value: unknown;
  path: string;
  size: number;
  children?: JsonNodeInfo[];
}

export function parseJson(text: string): unknown {
  return JSON.parse(text);
}

export function validateJson(text: string): { valid: true } | { valid: false; error: string } {
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function formatJson(text: string, indent: number = 2): string {
  const parsed = JSON.parse(text);
  return JSON.stringify(parsed, null, indent);
}

export function getType(value: unknown): JsonNodeType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as JsonNodeType;
}

export function getDisplayValue(value: unknown, maxLen = 80): string {
  const t = getType(value);
  switch (t) {
    case "null":
      return "null";
    case "string":
      return `"${String(value).slice(0, maxLen)}${String(value).length > maxLen ? "…" : ""}"`;
    case "number":
      return String(value);
    case "boolean":
      return String(value);
    case "array":
      return `Array(${(value as unknown[]).length})`;
    case "object":
      return `Object(${Object.keys(value as object).length})`;
  }
}

export function getSize(value: unknown): number {
  const t = getType(value);
  if (t === "array") return (value as unknown[]).length;
  if (t === "object") return Object.keys(value as object).length;
  return 1;
}

export function buildTree(
  value: unknown,
  key: string = "root",
  path: string = "$"
): JsonNodeInfo {
  const type = getType(value);
  const size = getSize(value);
  const node: JsonNodeInfo = { type, key, value, path, size };

  if (type === "object" && value !== null) {
    node.children = Object.entries(value as Record<string, unknown>).map(
      ([k, v], i) => buildTree(v, k, `${path}.${k}`)
    );
  } else if (type === "array") {
    node.children = (value as unknown[]).map((v, i) =>
      buildTree(v, String(i), `${path}[${i}]`)
    );
  }

  return node;
}

export function getLeafValue(value: unknown): unknown {
  const t = getType(value);
  if (t === "object" || t === "array") return value;
  return value;
}

export function isLeaf(value: unknown): boolean {
  const t = getType(value);
  return t !== "object" && t !== "array";
}
