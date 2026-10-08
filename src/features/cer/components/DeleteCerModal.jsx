import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";

import { deleteCerQuiz } from "../services/cerService";

function DeleteCerModal({ activity, onClose, onUpdated }) {
  const [error, setError] = useState("");

  const deleteMutation = useMutation({
    mutationFn: () => deleteCerQuiz(activity.id),
    onSuccess: async () => {
      await onUpdated?.();
      onClose();
    },
    onError: (err) => {
      setError(
        err.response?.data?.message || "Gagal menghapus aktivitas CER."
      );
    },
  });

  const loading = deleteMutation.isPending;

  return createPortal(
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <AlertTriangle size={22} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-bold text-dark">Hapus aktivitas?</h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Apakah Anda yakin ingin menghapus aktivitas{" "}
            <span className="font-semibold text-dark">
              "{activity.title}"
            </span>
            ?
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            Data aktivitas yang telah dihapus tidak dapat dikembalikan.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-cream-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-cream-border px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-cream-light"
          >
            Kembali
          </button>

          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <LoaderCircle size={16} className="animate-spin" />
            )}
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteCerModal;