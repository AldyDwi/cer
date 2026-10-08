import { useEffect, useState } from "react";
import { X, LoaderCircle } from "lucide-react";

function MaterialFormModal({ mode, material, onClose, onSubmit }) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && material) {
      setTitle(material.title || "");
      setContent(material.content || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [isEdit, material]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Judul dan isi materi wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onSubmit({
        title: title.trim(),
        content: content.trim(),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan materi."
      );
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cream-border px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-dark">
              {isEdit ? "Ubah Materi" : "Tambah Materi"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isEdit
                ? "Perbarui informasi materi pembelajaran."
                : "Tambahkan materi pembelajaran baru."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Judul Materi
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Masukkan judul materi"
                maxLength={255}
                className="w-full rounded-xl border border-cream-border bg-white px-4 py-3 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
              />
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Isi Materi
              </label>

              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Masukkan isi materi..."
                rows={10}
                className="w-full resize-y rounded-xl border border-cream-border bg-white px-4 py-3 text-sm leading-6 text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-cream-border px-6 py-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <LoaderCircle size={16} className="animate-spin" />}
              {loading
                ? "Menyimpan..."
                : isEdit
                ? "Update"
                : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaterialFormModal;