"use client";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No" }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-[420px] max-w-[90vw] p-5">
        <h3 className="text-base font-semibold text-slate-200 mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-5 break-words">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
