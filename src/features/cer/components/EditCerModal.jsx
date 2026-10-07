import { useEffect, useState } from "react";
import {
  ChevronDown,
  X,
  LoaderCircle,
} from "lucide-react";
import { createPortal } from "react-dom";

import { updateCerQuiz } from "../services/cerService";
import { getMaterialOptions } from "../../materials/services/materialService";

function EditCerModal({
  activity,
  onClose,
  onUpdated,
}) {
  const [materials, setMaterials] = useState([]);

  const [form, setForm] = useState({
    title: activity.title || "",
    description: activity.description || "",
    material_id: activity.material_id || "",
    duration_minutes:
      activity.duration_minutes || "",
  });

  const [loadingMaterials, setLoadingMaterials] =
    useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    try {
      const response =
        await getMaterialOptions();

      setMaterials(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mengambil materi."
      );
    } finally {
      setLoadingMaterials(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await updateCerQuiz(activity.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        material_id: Number(form.material_id),
        duration_minutes: Number(
          form.duration_minutes
        ),
      });

      await onUpdated();

      onClose();
    } catch (err) {
      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)[0]?.[0];

        setError(
          firstError ||
            "Data aktivitas tidak valid."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Gagal mengubah aktivitas CER."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        {/* =========================================
            HEADER
        ========================================== */}
        <div className="flex items-start justify-between border-b border-cream-border px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-dark">
              Ubah Aktivitas CER
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Perbarui informasi aktivitas CER.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        {/* =========================================
            FORM
        ========================================== */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Judul */}
            <div>
              <label
                htmlFor="edit-cer-title"
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Judul
              </label>

              <input
                id="edit-cer-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-cream-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label
                htmlFor="edit-cer-description"
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Deskripsi
              </label>

              <textarea
                id="edit-cer-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="w-full resize-none rounded-xl border border-cream-border bg-white px-4 py-3 text-sm leading-6 text-dark outline-none transition focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
              />
            </div>

            {/* Materi */}
            <div>
              <label
                htmlFor="edit-cer-material"
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Materi
              </label>

              <div className="relative">
                <select
                  id="edit-cer-material"
                  name="material_id"
                  value={form.material_id}
                  onChange={handleChange}
                  disabled={loadingMaterials}
                  className="w-full appearance-none rounded-xl border border-cream-border bg-white py-3 pl-4 pr-10 text-sm text-dark outline-none transition focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {loadingMaterials
                      ? "Memuat materi..."
                      : "Pilih materi"}
                  </option>

                  {materials.map((material) => (
                    <option
                      key={material.id}
                      value={material.id}
                    >
                      {material.title}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Durasi */}
            <div>
              <label
                htmlFor="edit-cer-duration"
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Durasi Pengerjaan
              </label>

              <div className="flex items-center gap-2">
                <input
                  id="edit-cer-duration"
                  type="number"
                  name="duration_minutes"
                  min="1"
                  max="180"
                  value={form.duration_minutes}
                  onChange={handleChange}
                  className="w-28 rounded-xl border border-cream-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
                />

                <span className="text-sm text-gray-500">
                  Menit
                </span>
              </div>
            </div>
          </div>

          {/* =========================================
              FOOTER
          ========================================== */}
          <div className="flex justify-end border-t border-cream-border px-6 py-4">
            <button
              type="submit"
              disabled={
                submitting || loadingMaterials
              }
              className="inline-flex items-center gap-2 rounded-xl bg-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {submitting
                ? "Menyimpan..."
                : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default EditCerModal;