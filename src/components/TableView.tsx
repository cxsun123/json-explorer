"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { buildTree, getType, getDisplayValue, isLeaf, JsonNodeInfo } from "@/lib/jsonUtils";
import { useLocale } from "@/lib/locales/LocaleContext";

interface TableViewProps {
  json: unknown;
}

const DEFAULT_COL_WIDTH = 240;
const MIN_COL_WIDTH = 120;

const typeColor: Record<string, string> = {
  string: "text-emerald-400",
  number: "text-blue-400",
  boolean: "text-amber-400",
  null: "text-slate-500",
};

function ValueTag({ value }: { value: unknown }) {
  const t = getType(value);
  const display = t === "string" ? `"${value}"` : String(value as string);
  return <span className={`${typeColor[t] || "text-slate-300"} font-mono text-sm`}>{display}</span>;
}

function typeBadge(t: string) {
  return t === "array" ? "[]" : t === "object" ? "{}" : t;
}

function ContentPanel({ node }: { node: JsonNodeInfo }) {
  const { t } = useLocale();
  const value = node.value;
  const vtype = getType(value);

  if (vtype === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/50">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{node.key}</span>
          <span className="text-xs text-slate-600">—</span>
          <span className="text-xs text-slate-500">{entries.length} {t.table.keys}</span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left text-xs text-slate-400 font-semibold py-2 px-3 w-[35%] bg-slate-800/60">Key</th>
              <th className="text-left text-xs text-slate-400 font-semibold py-2 px-3 bg-slate-800/60">Value</th>
              <th className="text-left text-xs text-slate-400 font-semibold py-2 px-3 w-[60px] bg-slate-800/60">Type</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([k, v], idx) => (
              <tr key={k} className={`border-b border-slate-700/30 ${idx % 2 === 0 ? "bg-slate-800/20" : "bg-transparent"} hover:bg-blue-900/20 transition-colors`}>
                <td className="py-1.5 px-3 text-slate-300 font-mono text-sm truncate max-w-[200px]">{k}</td>
                <td className="py-1.5 px-3">
                  {isLeaf(v) ? <ValueTag value={v} /> : <span className="text-slate-500 font-mono text-sm">{getDisplayValue(v)}</span>}
                </td>
                <td className="py-1.5 px-3 text-slate-600 text-xs font-mono">{typeBadge(getType(v))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (vtype === "array") {
    const arr = value as unknown[];
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/50">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{node.key}</span>
          <span className="text-xs text-slate-600">—</span>
          <span className="text-xs text-slate-500">{arr.length} {t.table.items}</span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left text-xs text-slate-400 font-semibold py-2 px-3 w-[60px] bg-slate-800/60">#</th>
              <th className="text-left text-xs text-slate-400 font-semibold py-2 px-3 bg-slate-800/60">Value</th>
              <th className="text-left text-xs text-slate-400 font-semibold py-2 px-3 w-[60px] bg-slate-800/60">Type</th>
            </tr>
          </thead>
          <tbody>
            {arr.map((v, i) => (
              <tr key={i} className={`border-b border-slate-700/30 ${i % 2 === 0 ? "bg-slate-800/20" : "bg-transparent"} hover:bg-blue-900/20 transition-colors`}>
                <td className="py-1.5 px-3 text-slate-500 font-mono text-sm">{i}</td>
                <td className="py-1.5 px-3">
                  {isLeaf(v) ? <ValueTag value={v} /> : <span className="text-slate-500 font-mono text-sm">{getDisplayValue(v)}</span>}
                </td>
                <td className="py-1.5 px-3 text-slate-600 text-xs font-mono">{typeBadge(getType(v))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/50">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{node.key}</span>
        <span className="text-xs text-slate-600">—</span>
          <span className="text-xs text-slate-500">{vtype}</span>
      </div>
      <div className="px-2"><ValueTag value={value} /></div>
    </div>
  );
}

function resolvePath(tree: JsonNodeInfo, path: string[]): JsonNodeInfo[] {
  const nodes: JsonNodeInfo[] = [tree];
  let current = tree;
  for (let i = 1; i < path.length; i++) {
    const child = current.children?.find((c) => c.path === path[i]);
    if (!child) break;
    nodes.push(child);
    current = child;
  }
  return nodes;
}

export default function TableView({ json }: TableViewProps) {
  const { t } = useLocale();
  const tree = useMemo(() => buildTree(json), [json]);

  const [path, setPath] = useState<string[]>(() => {
    return tree.children?.[0]
      ? ["root", tree.children[0].path]
      : ["root"];
  });

  useEffect(() => {
    const firstPath = tree.children?.[0]?.path;
    setPath(firstPath ? ["root", firstPath] : ["root"]);
  }, [tree]);

  const resolvedPath = useMemo(() => resolvePath(tree, path), [tree, path]);
  const lastNode = resolvedPath[resolvedPath.length - 1];

  const [colWidths, setColWidths] = useState<number[]>([]);
  const dragRef = useRef<{ index: number; startX: number; startWidth: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const numCols = resolvedPath.length;

  useEffect(() => {
    setColWidths((prev) => {
      if (prev.length === numCols) return prev;
      if (prev.length < numCols) {
        return [...prev, ...Array(numCols - prev.length).fill(DEFAULT_COL_WIDTH)];
      }
      return prev.slice(0, numCols);
    });
  }, [numCols]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const newWidth = Math.max(MIN_COL_WIDTH, drag.startWidth + dx);
      setColWidths((prev) => {
        const next = [...prev];
        next[drag.index] = newWidth;
        return next;
      });
    };
    const upHandler = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", handler);
    document.addEventListener("mouseup", upHandler);
    return () => {
      document.removeEventListener("mousemove", handler);
      document.removeEventListener("mouseup", upHandler);
    };
  }, []);

  const handleSeparatorMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    dragRef.current = {
      index,
      startX: e.clientX,
      startWidth: colWidths[index] ?? DEFAULT_COL_WIDTH,
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [colWidths]);

  const handleSelect = useCallback((depth: number, key: string) => {
    const parentNode = resolvedPath[depth];
    const childNode = parentNode.children?.find((c) => c.path === key || c.key === key);
    if (!childNode) return;
    const newPath = path.slice(0, depth + 1);
    newPath.push(childNode.path);
    setPath(newPath);
  }, [resolvedPath, path]);

  const columns = useMemo(() => {
    const cols: {
      label: string;
      entries: { key: string; display: string; type: string; isLeaf: boolean }[];
      selectedKey: string | null;
    }[] = [];

    for (let i = 0; i < resolvedPath.length; i++) {
      const node = resolvedPath[i];
      const isLast = i === resolvedPath.length - 1;

      const children = node.children ?? [];
      const entries = children.map((child) => ({
        key: child.path,
        display: child.type === "object"
          ? `{ ${child.size} ${t.table.keys} }`
          : child.type === "array"
            ? `[ ${child.size} ${t.table.items} ]`
          : getDisplayValue(child.value),
        type: child.type,
        isLeaf: isLeaf(child.value),
      }));

      const selectedKey = !isLast && i + 1 < resolvedPath.length
        ? resolvedPath[i + 1].path
        : null;

      cols.push({ label: node.key, entries, selectedKey });
    }

    return cols;
  }, [resolvedPath]);

  return (
    <div className="flex flex-col h-full">
      <div ref={containerRef} className="flex overflow-x-auto flex-1">
        {columns.map((col, i) => (
          <div
            key={i}
            className="flex flex-col flex-shrink-0 border-r border-slate-700/50 bg-slate-950 relative"
            style={{ width: colWidths[i] ?? DEFAULT_COL_WIDTH }}
          >
            <div className="px-3 py-2 text-xs text-slate-500 font-medium border-b border-slate-700/50 truncate flex-shrink-0">
              {col.label}
            </div>
            <div className="overflow-y-auto flex-1 py-1">
              {col.entries.map((entry) => {
                const isSelected = col.selectedKey === entry.key;
                return (
                  <div
                    key={entry.key}
                    className={`flex items-center h-8 px-3 cursor-pointer text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-600/25 text-blue-200"
                        : "hover:bg-slate-800/60 text-slate-300"
                    }`}
                    onClick={() => handleSelect(i, entry.key)}
                  >
                    <span className="truncate flex-1 font-mono text-[13px]">
                      {entry.key.split(".").pop()?.split("[").join(".")}
                    </span>
                    <span className="text-slate-500 text-xs ml-2 flex-shrink-0 truncate max-w-[100px] text-right">
                      {entry.display}
                    </span>
                    {!entry.isLeaf && <span className="text-slate-600 ml-1 text-xs">›</span>}
                  </div>
                );
              })}
              {col.entries.length === 0 && (
                <div className="px-3 py-4 text-xs text-slate-600 text-center italic">{t.table.empty}</div>
              )}
            </div>
            {i < columns.length && (
              <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize group z-10"
                onMouseDown={(e) => handleSeparatorMouseDown(e, i)}
              >
                <div className="w-full h-full transition-colors group-hover:bg-blue-500/60 group-active:bg-blue-500" />
              </div>
            )}
          </div>
        ))}

        <div className="flex-1 min-w-[400px] overflow-auto bg-slate-800/20 border-l border-blue-500/10">
          {lastNode && <ContentPanel node={lastNode} />}
        </div>
      </div>

      <div className="flex-shrink-0 px-3 py-1.5 bg-slate-950 border-t border-slate-700/50 text-xs text-slate-400 font-mono flex items-center gap-1">
        <span className="truncate flex items-center gap-1">
          {resolvedPath.map((n, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-600 text-[10px]">›</span>}
              <span className={i === resolvedPath.length - 1 ? "text-blue-400" : "text-slate-500"}>
                {n.key}
              </span>
            </span>
          ))}
          <button
            className="inline-flex items-center justify-center px-1 py-0.5 rounded text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition-colors"
            onClick={() => {
              const fullPath = resolvedPath.map((n) => n.key).join(".");
              navigator.clipboard.writeText(fullPath);
            }}
            title="Copy path"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </span>
      </div>
    </div>
  );
}
