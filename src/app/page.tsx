"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import TextView from "@/components/TextView";
import TreeView from "@/components/TreeView";
import TableView from "@/components/TableView";
import ConfirmModal from "@/components/ConfirmModal";
import { parseJson } from "@/lib/jsonUtils";
import { useLocale } from "@/lib/locales/LocaleContext";

type ViewMode = "text" | "tree" | "table";

const sampleJson = `{
  "name": "JSON Explorer",
  "version": "1.0.0",
  "features": ["text", "tree", "table"],
  "config": {
    "theme": "dark",
    "indent": 2,
    "options": {
      "validate": true,
      "format": true,
      "copy": true
    }
  },
  "active": true
}`;

export default function Home() {
  const { t, lang, toggleLang } = useLocale();
  const [json, setJson] = useState<unknown | null>(null);
  const [view, setView] = useState<ViewMode>("text");

  const [dragOver, setDragOver] = useState(false);
  const [dropCandidate, setDropCandidate] = useState<File | null>(null);
  const [droppedContent, setDroppedContent] = useState<string | null>(null);
  const [textKey, setTextKey] = useState(0);

  const tabs: { key: ViewMode; label: string; disabled?: boolean }[] = [
    { key: "text", label: t.tabs.text },
    { key: "tree", label: t.tabs.tree, disabled: !json },
    { key: "table", label: t.tabs.table, disabled: !json },
  ];

  const setParsedJson = useCallback((parsed: unknown) => {
    setJson(parsed);
  }, []);

  const handleJsonParsed = useCallback((parsed: unknown) => {
    setJson(parsed);
    setView("tree");
  }, []);

  useEffect(() => {
    setParsedJson(parseJson(sampleJson));
  }, [setParsedJson]);

  const activeTab = useMemo(() => {
    if (json === null) return "text";
    return view;
  }, [json, view]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const isJson = file.name.endsWith(".json") || file.name.endsWith(".jsonc");
    if (!isJson) return;

    setDropCandidate(file);
  }, []);

  const confirmDrop = useCallback(() => {
    const file = dropCandidate;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setDroppedContent(content);
      setTextKey((k) => k + 1);
      setView("text");
      try {
        setParsedJson(parseJson(content));
      } catch { /* invalid JSON, show error in TextView */ }
    };
    reader.readAsText(file);
    setDropCandidate(null);
  }, [dropCandidate, setParsedJson]);

  const cancelDrop = useCallback(() => {
    setDropCandidate(null);
  }, []);

  const renderView = () => {
    switch (view) {
      case "text":
        return (
          <TextView
            key={`text-view-${textKey}`}
            onJsonParsed={setParsedJson}
            onParseAndView={handleJsonParsed}
            initialValue={droppedContent ?? sampleJson}
          />
        );
      case "tree":
        return json ? <TreeView key="tree-view" json={json} /> : null;
      case "table":
        return json ? <TableView key="table-view" json={json} /> : null;
    }
  };

  return (
    <div
      className="flex flex-col h-screen bg-slate-900 relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 flex-shrink-0">
        <h1 className="text-sm sm:text-base font-semibold text-slate-200 mr-2 sm:mr-6 truncate">{t.app.title}</h1>
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && setView(tab.key)}
              disabled={tab.disabled}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : tab.disabled
                    ? "text-slate-600 cursor-not-allowed"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={toggleLang}
          className="ml-auto px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-400 transition-colors"
        >
          {lang === "en" ? "中文" : "EN"}
        </button>
      </header>

      <main className="flex-1 overflow-hidden">{renderView()}</main>

      {dragOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-blue-500/60 rounded-xl bg-blue-500/10 w-[90%] h-[90%] flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2 text-blue-400">📄</div>
              <p className="text-blue-300 text-sm">{t.drop.title}</p>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={dropCandidate !== null}
        title={t.confirm.openFile}
        message={t.confirm.openFileMessage.replace("{name}", dropCandidate?.name ?? "")}
        onConfirm={confirmDrop}
        onCancel={cancelDrop}
        confirmText={t.confirm.yes}
        cancelText={t.confirm.no}
      />
    </div>
  );
}
