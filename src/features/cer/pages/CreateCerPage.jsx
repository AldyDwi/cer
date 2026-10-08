import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  Clock3,
  FilePlus2,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { createCerQuiz } from "../services/cerService";
import { getMaterialOptions } from "../../materials/services/materialService";
import { useCerActivities } from "../../../contexts/CerActivityContext";

function CreateCerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshActivities } = useCerActivities();

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    material_id: "",
    duration_minutes: 15,
  });

  /* =========================================================
     QUERY: FETCH MATERIAL OPTIONS
  ========================================================= */
  const { data: materials = [], isLoading: loadingMaterials } = useQuery({
    queryKey: ["material-options"],
    queryFn: getMaterialOptions,
    staleTime: 1000 * 60 * 10,
    select: (response) => response?.data || [],
  });

  /* =========================================================
     MUTATION: CREATE CER QUIZ
  ========================================================= */
  const createMutation = useMutation({
    mutationFn: createCerQuiz,
    onSuccess: async (response) => {
      const quiz = response?.data ?? response;

      // Invalidate cache list aktivitas
      queryClient.invalidateQueries({ queryKey: ["cer-quizzes"] });

      if (refreshActivities) {
        await refreshActivities();
      }

      navigate(`/teacher/cer/${quiz.id}`);
    },
    onError: (err) => {
      const validationErrors = err.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0];
        setError(firstError || "Data aktivitas belum lengkap.");
      } else {
        setError(
          err.response?.data?.message || "Gagal membuat aktivitas CER."
        );
      }
    },
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      material_id: Number(form.material_id),
      duration_minutes: Number(form.duration_minutes),
    });
  }

  const submitting = createMutation.isPending;

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* PAGE HEADER */}
      <div className="mb-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-brand text-dark">
            <FilePlus2 size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-dark">
              Buat Aktivitas CER
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Buat aktivitas rekonstruksi CER untuk pembelajaran mahasiswa.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-3xl border border-cream-border bg-white shadow-sm">
        {/* Card Header */}
        <div className="border-b border-cream-border px-7 py-5">
          <h2 className="text-base font-bold text-dark">
            Informasi Aktivitas
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Lengkapi informasi berikut sebelum membuat aktivitas CER.
          </p>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-7">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Judul */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Judul
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Masukkan judul aktivitas"
                  className="w-full rounded-xl border border-cream-border bg-white px-4 py-3 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Deskripsi
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Masukkan deskripsi aktivitas"
                  className="w-full resize-none rounded-xl border border-cream-border bg-white px-4 py-3 text-sm leading-6 text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
                />
              </div>

              {/* Materi */}
              <div>
                <label
                  htmlFor="material_id"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Materi
                </label>

                <div className="relative">
                  <select
                    id="material_id"
                    name="material_id"
                    value={form.material_id}
                    onChange={handleChange}
                    disabled={loadingMaterials}
                    className="w-full appearance-none rounded-xl border border-cream-border bg-white px-4 py-3 pr-11 text-sm text-dark outline-none transition focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">
                      {loadingMaterials
                        ? "Memuat materi..."
                        : "Pilih materi"}
                    </option>

                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.title}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Belum punya materi?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/teacher/materials")}
                    className="font-medium text-dark underline underline-offset-2 transition hover:text-lime-hover"
                  >
                    Klik di sini
                  </button>
                </p>
              </div>

              {/* Durasi */}
              <div>
                <label
                  htmlFor="duration_minutes"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Durasi Pengerjaan
                </label>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Clock3
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      min="1"
                      max="180"
                      value={form.duration_minutes}
                      onChange={handleChange}
                      className="w-32 rounded-xl border border-cream-border bg-white py-3 pl-9 pr-3 text-sm text-dark outline-none transition focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
                    />
                  </div>

                  <span className="text-sm text-gray-500">Menit</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8 flex justify-end border-t border-cream-border pt-6">
              <button
                type="submit"
                disabled={submitting || loadingMaterials}
                className="inline-flex items-center gap-2 rounded-xl bg-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}

                {submitting ? "Membuat..." : "Buat Aktivitas"}
              </button>
            </div>
          </form>

          {/* INFORMATION PANEL */}
          <aside className="border-t border-cream-border bg-cream-light/60 p-7 lg:border-l lg:border-t-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-brand text-dark">
              <CircleHelp size={21} />
            </div>

            <h3 className="mt-5 text-base font-bold text-dark">
              Tentang Aktivitas CER
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Aktivitas ini digunakan untuk pembelajaran rekonstruksi Claim,
              Evidence, dan Reasoning (CER).
            </p>

            <div className="my-6 h-px bg-cream-border" />

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-dark shadow-sm">
                  1
                </div>

                <div>
                  <p className="text-sm font-semibold text-dark">
                    Pilih materi
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Materi menjadi dasar pembelajaran dalam aktivitas CER.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-dark shadow-sm">
                  2
                </div>

                <div>
                  <p className="text-sm font-semibold text-dark">
                    Tambahkan triplet CER
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Setelah aktivitas dibuat, kamu dapat menambahkan komponen
                    Claim, Evidence, dan Reasoning.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-dark shadow-sm">
                  3
                </div>

                <div>
                  <p className="text-sm font-semibold text-dark">
                    Publikasikan aktivitas
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Aktivitas dapat dipublikasikan setelah seluruh komponen CER
                    selesai disiapkan.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CreateCerPage;