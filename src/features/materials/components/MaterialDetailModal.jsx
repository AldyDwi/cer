import { X } from "lucide-react";

function MaterialDetailModal({ material, onClose }) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-cream-border px-6 py-5">
          <div className="min-w-0 pr-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Detail Materi
            </p>

            <h2 className="text-xl font-bold text-dark">
              {material.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6">
          <div className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
            {material.content}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialDetailModal;