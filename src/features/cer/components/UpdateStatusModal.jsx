import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  X,
} from "lucide-react";

function UpdateStatusModal({
  targetStatus,
  loading = false,
  onClose,
  onConfirm,
}) {
  const isPublishing = targetStatus === "published";

  return (
    <div
      className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* =========================================
            CONTENT
        ========================================== */}
        <div className="px-6 py-6 sm:px-7">
          {/* Icon + Close */}
          <div className="flex items-start justify-between">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                isPublishing
                  ? "bg-lime-brand/15 text-green-600"
                  : "bg-yellow-50 text-yellow-600"
              }`}
            >
              {isPublishing ? (
                <CheckCircle2 size={21} />
              ) : (
                <AlertTriangle size={21} />
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Tutup"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Title */}
          <h2 className="mt-5 text-lg font-bold text-dark">
            {isPublishing
              ? "Publikasikan aktivitas?"
              : "Kembalikan ke draft?"}
          </h2>

          {/* Description */}
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {isPublishing
              ? "Aktivitas akan dapat diakses oleh mahasiswa setelah dipublikasikan. Komponen CER juga tidak dapat ditambah, diubah, atau dihapus selama aktivitas berstatus published."
              : "Aktivitas tidak dapat diakses oleh mahasiswa selama berstatus draft. Setelah dikembalikan ke draft, komponen CER dapat ditambah, diubah, atau dihapus kembali."}
          </p>
        </div>

        {/* =========================================
            FOOTER
        ========================================== */}
        <div className="flex gap-3 border-t border-cream-border px-6 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-cream-border bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-cream-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kembali
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isPublishing
                ? "bg-dark hover:bg-dark/90"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {loading && (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            )}

            {loading
              ? "Memproses..."
              : isPublishing
                ? "Publikasikan"
                : "Kembali ke Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateStatusModal;