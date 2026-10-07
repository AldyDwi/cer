import { useEffect, useState } from "react";
import {
  LoaderCircle,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

import {
  createCerItem,
  updateCerItem,
  generateDistractors,
} from "../services/cerService";

function TripletFormModal({
  mode = "create",
  activityId,
  triplet = null,
  onClose,
  onAdded,
  onUpdated,
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    claim: "",
    evidence: "",
    reasoning: "",
    distractor_evidence: "",
    distractor_reasoning: "",
  });

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && triplet) {
      setForm({
        claim: triplet.claim || "",
        evidence: triplet.evidence || "",
        reasoning: triplet.reasoning || "",
        distractor_evidence:
          triplet.distractor_evidence || "",
        distractor_reasoning:
          triplet.distractor_reasoning || "",
      });
    }
  }, [isEdit, triplet]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleGenerateDistractor() {
    // Validasi komponen utama terlebih dahulu
    if (!form.claim.trim()) {
      setError("Claim wajib diisi terlebih dahulu.");
      return;
    }

    if (!form.evidence.trim()) {
      setError("Evidence wajib diisi terlebih dahulu.");
      return;
    }

    if (!form.reasoning.trim()) {
      setError("Reasoning wajib diisi terlebih dahulu.");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const response = await generateDistractors(activityId, {
        claim: form.claim.trim(),
        evidence: form.evidence.trim(),
        reasoning: form.reasoning.trim(),
      });

      const data = response?.data ?? response;

      setForm((prev) => ({
        ...prev,
        distractor_evidence:
          data?.distractor_evidence || "",
        distractor_reasoning:
          data?.distractor_reasoning || "",
      }));
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Gagal menghasilkan distractor. Silakan coba lagi."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const requiredFields = [
      "claim",
      "evidence",
      "reasoning",
      "distractor_evidence",
      "distractor_reasoning",
    ];

    const hasEmptyField = requiredFields.some(
      (field) => !form[field].trim()
    );

    if (hasEmptyField) {
      setError("Semua komponen triplet harus diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isEdit) {
        const response = await updateCerItem(
          triplet.id,
          {
            claim: form.claim.trim(),
            evidence: form.evidence.trim(),
            reasoning: form.reasoning.trim(),
            distractor_evidence:
              form.distractor_evidence.trim(),
            distractor_reasoning:
              form.distractor_reasoning.trim(),
          }
        );

        onUpdated?.(response.data);
      } else {
        const response = await createCerItem(
          activityId,
          {
            claim: form.claim.trim(),
            evidence: form.evidence.trim(),
            reasoning: form.reasoning.trim(),
            distractor_evidence:
              form.distractor_evidence.trim(),
            distractor_reasoning:
              form.distractor_reasoning.trim(),
          }
        );

        onAdded?.(response.data);
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          `Gagal ${
            isEdit ? "memperbarui" : "menambahkan"
          } triplet.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* =========================================
            HEADER
        ========================================== */}
        <div className="flex shrink-0 items-start justify-between border-b border-cream-border px-6 py-5 sm:px-7">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-dark sm:text-xl">
              {isEdit
                ? "Ubah Triplet CER"
                : "Tambah Triplet CER"}
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {isEdit
                ? "Perbarui informasi komponen triplet CER."
                : "Tambahkan komponen Claim, Evidence, Reasoning, dan distractor."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        {/* =========================================
            FORM BODY
        ========================================== */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 overflow-y-auto"
        >
          <div className="p-6 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ====================================
                  KOMPONEN UTAMA
              ===================================== */}
              <section className="rounded-2xl bg-cream-light/70 p-5">
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-dark">
                    Komponen Utama
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Komponen CER yang menjadi jawaban utama.
                  </p>
                </div>

                <div className="space-y-5">
                  <TextAreaField
                    label="Claim"
                    name="claim"
                    value={form.claim}
                    onChange={handleChange}
                    placeholder="Masukkan claim..."
                  />

                  <TextAreaField
                    label="Evidence"
                    name="evidence"
                    value={form.evidence}
                    onChange={handleChange}
                    placeholder="Masukkan evidence..."
                  />

                  <TextAreaField
                    label="Reasoning"
                    name="reasoning"
                    value={form.reasoning}
                    onChange={handleChange}
                    placeholder="Masukkan reasoning..."
                  />
                </div>
              </section>

              {/* ====================================
                  KOMPONEN PENGECOH
              ===================================== */}
              <section className="rounded-2xl bg-red-50/60 p-5">
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-dark">
                    Komponen Pengecoh
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Komponen yang digunakan sebagai distractor.
                  </p>
                </div>

                <div className="space-y-5">
                  <TextAreaField
                    label="Distractor Evidence"
                    name="distractor_evidence"
                    value={form.distractor_evidence}
                    onChange={handleChange}
                    placeholder="Masukkan distractor evidence..."
                  />

                  <TextAreaField
                    label="Distractor Reasoning"
                    name="distractor_reasoning"
                    value={form.distractor_reasoning}
                    onChange={handleChange}
                    placeholder="Masukkan distractor reasoning..."
                  />
                </div>
              </section>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-500">
                {error}
              </div>
            )}
          </div>

          {/* =========================================
              FOOTER
          ========================================== */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-cream-border bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button
              type="button"
              onClick={handleGenerateDistractor}
              disabled={generating || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Sparkles size={17} />
              )}

              {generating
                ? "Menghasilkan..."
                : "Generate Distractor"}
            </button>

            <button
              type="submit"
              disabled={loading || generating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Plus size={17} />
              )}

              {loading
                ? isEdit
                  ? "Memperbarui..."
                  : "Menambahkan..."
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

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-dark"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-cream-border bg-white px-4 py-3 text-sm leading-6 text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
      />
    </div>
  );
}

export default TripletFormModal;