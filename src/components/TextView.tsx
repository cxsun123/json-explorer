"use client";

import { useState, useRef, useCallback } from "react";
import { validateJson, formatJson } from "@/lib/jsonUtils";
import { useLocale } from "@/lib/locales/LocaleContext";

interface TextViewProps {
  onJsonParsed: (json: unknown) => void;
  onParseAndView?: (json: unknown) => void;
  initialValue?: string;
}

export default function TextView({ onJsonParsed, onParseAndView, initialValue = "" }: TextViewProps) {
  const { t } = useLocale();
  const [text, setText] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const doParse = useCallback((content: string, callback: (json: unknown) => void) => {
    if (!content.trim()) {
      setError(t.text.emptyError);
      return false;
    }
    const result = validateJson(content);
    if (result.valid) {
      setError(null);
      callback(JSON.parse(content));
      return true;
    } else {
      setError(result.error);
      return false;
    }
  }, [t.text.emptyError]);

  const handleParse = useCallback(() => {
    doParse(text, onParseAndView ?? onJsonParsed);
  }, [text, onParseAndView, onJsonParsed, doParse]);

  const handleFormat = useCallback(() => {
    try {
      const formatted = formatJson(text);
      setText(formatted);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [text]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setText(content);
      doParse(content, onJsonParsed);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [onJsonParsed, doParse]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-slate-700/50 flex-shrink-0 flex-wrap">
        <button
          onClick={handleParse}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-emerald-700 hover:bg-emerald-600 text-emerald-200 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {t.text.parseAndView}
        </button>
        <button
          onClick={handleFormat}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            <path d="M21 3v6h-6" />
          </svg>
          {t.text.format}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          {t.text.openFile}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.jsonc,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <span className="ml-3 text-xs text-slate-600 hidden sm:inline">
          {t.drop.hint}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors ml-auto"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? t.text.copied : t.text.copy}
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.text.placeholder}
        className="flex-1 w-full bg-transparent text-slate-200 font-mono text-sm p-4 resize-none outline-none placeholder-slate-500"
        spellCheck={false}
      />
      {error && (
        <div className="px-4 py-3 bg-red-900/40 border-t border-red-800/50 text-red-300 text-sm font-mono flex-shrink-0">
          {error}
        </div>
      )}
    </div>
  );
}
