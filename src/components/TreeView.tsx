"use client";

import { useState, useMemo, useCallback } from "react";
import { buildTree, JsonNodeInfo } from "@/lib/jsonUtils";
import { useLocale } from "@/lib/locales/LocaleContext";

interface TreeViewProps {
  json: unknown;
}

function collectPaths(node: JsonNodeInfo, result: string[] = []): string[] {
  if ((node.type === "object" || node.type === "array") && node.children && node.children.length > 0) {
    result.push(node.path);
    for (const child of node.children) {
      collectPaths(child, result);
    }
  }
  return result;
}

function expandUpToDepth(tree: JsonNodeInfo, maxDepth: number): Set<string> {
  const expanded = new Set<string>();
  function walk(node: JsonNodeInfo, depth: number) {
    if (depth >= maxDepth) return;
    if ((node.type === "object" || node.type === "array") && node.children?.length) {
      expanded.add(node.path);
      for (const child of node.children) walk(child, depth + 1);
    }
  }
  walk(tree, 0);
  return expanded;
}

const colorMap: Record<string, string> = {
  string: "text-emerald-400",
  number: "text-blue-400",
  boolean: "text-amber-400",
  null: "text-slate-500",
  object: "text-slate-300",
  array: "text-slate-300",
};

function TreeNode({
  node,
  depth,
  expandedPaths,
  onToggle,
  selectedPath,
  onSelect,
}: {
  node: JsonNodeInfo;
  depth: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const isExpandable = node.type === "object" || node.type === "array";
  const hasChildren = node.children && node.children.length > 0;
  const isEmpty = isExpandable && (!node.children || node.children.length === 0);
  const expanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;

  let bracketOpen = "";
  let bracketClose = "";
  if (node.type === "object") { bracketOpen = "{"; bracketClose = "}"; }
  else if (node.type === "array") { bracketOpen = "["; bracketClose = "]"; }

  const handleClick = () => {
    onSelect(node.path);
    if (isExpandable && !isEmpty) onToggle(node.path);
  };

  return (
    <div>
      <div
        className={`flex items-start py-0.5 rounded-sm group cursor-pointer ${
          isSelected
            ? "bg-blue-600/20 text-blue-200"
            : "hover:bg-slate-800/60"
        }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={handleClick}
      >
        {isExpandable && !isEmpty && (
          <span className="w-4 flex-shrink-0 text-slate-500 text-xs mt-0.5">
            {expanded ? "▼" : "▶"}
          </span>
        )}
        {isExpandable && isEmpty && (
          <span className="w-4 flex-shrink-0 text-slate-600 text-xs mt-0.5">•</span>
        )}
        {!isExpandable && <span className="w-4 flex-shrink-0" />}
        <span className={`font-medium mr-1 truncate ${isSelected ? "text-blue-200" : "text-slate-300"}`}>{node.key}:</span>
        {!isExpandable && (
          <span className={`${colorMap[node.type]} truncate`}>
            {node.type === "string" ? `"${node.value}"` : String(node.value)}
          </span>
        )}
        {isEmpty && <span className="text-slate-500">{bracketOpen}{bracketClose}</span>}
        {isExpandable && !isEmpty && !expanded && (
          <span className="text-slate-500 ml-1">
            {bracketOpen} {node.size} {node.type === "object" ? "keys" : "items"} {bracketClose}
          </span>
        )}
        {isExpandable && !isEmpty && expanded && (
          <span className="text-slate-600 ml-1">{bracketOpen}</span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
          <div
            className="text-slate-600"
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
          >
            {bracketClose}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TreeView({ json }: TreeViewProps) {
  const { t } = useLocale();
  const tree = useMemo(() => buildTree(json), [json]);

  const allPaths = useMemo(() => collectPaths(tree), [tree]);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    return expandUpToDepth(tree, 2);
  });

  const firstChildPath = useMemo(() => {
    return tree.children?.[0]?.path ?? null;
  }, [tree]);

  const [selectedPath, setSelectedPath] = useState<string | null>(firstChildPath);

  const toggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const select = useCallback((path: string) => {
    setSelectedPath(path);
  }, []);

  const expandAll = useCallback(() => {
    setExpandedPaths(new Set(allPaths));
  }, [allPaths]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set<string>());
  }, []);

  const expandLevel = useCallback(() => {
    const input = window.prompt("Expand to level (1, 2, 3...):", "2");
    if (input === null) return;
    const level = parseInt(input, 10);
    if (isNaN(level) || level < 1) return;
    setExpandedPaths(expandUpToDepth(tree, level));
  }, [tree]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-slate-700/50 flex-shrink-0 flex-wrap">
        <button
          onClick={expandAll}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 13 12 18 17 13" />
            <polyline points="7 6 12 11 17 6" />
          </svg>
          {t.tree.expandAll}
        </button>
        <button
          onClick={collapseAll}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 11 12 6 7 11" />
            <polyline points="17 18 12 13 7 18" />
          </svg>
          {t.tree.collapseAll}
        </button>
        <button
          onClick={expandLevel}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="6" rx="1" />
            <rect x="2" y="10" width="20" height="6" rx="1" />
            <rect x="2" y="17" width="20" height="6" rx="1" />
          </svg>
          {t.tree.expandLevel}
        </button>
      </div>
      <div className="flex-1 p-2 overflow-auto font-mono text-sm">
        <TreeNode
          node={tree}
          depth={0}
          expandedPaths={expandedPaths}
          onToggle={toggle}
          selectedPath={selectedPath}
          onSelect={select}
        />
      </div>
    </div>
  );
}
