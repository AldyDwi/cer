import { useEffect, useState } from "react";
import {
  AlignLeft,
  BookOpen,
  Clock3,
  ClipboardList,
  Eye,
  X,
  CheckCircle2,
  GripVertical,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import TripletFormModal from "../components/TripletFormModal";
import TripletAccordionItem from "../components/TripletAccordionItem";
import UpdateStatusModal from "../components/UpdateStatusModal";
import CerPageSkeleton from "../components/CerPageSkeleton";
import PreviewCerModal from "../components/PreviewCerModal";

import {
  getCerQuiz,
  getCerItems,
  updateCerQuizStatus,
  updateCerQuiz,
} from "../services/cerService";
import api from "../../../services/api";
import echo from "../../../utils/echo";

const SLOTS = [
  {
    key: "claim",
    label: "Claim",
    description: "Pernyataan utama",
    number: "01",
    accent: "border-violet-300 bg-violet-50/70",
    badge: "bg-violet-600",
  },
  {
    key: "evidence",
    label: "Evidence",
    description: "Data atau fakta pendukung",
    number: "02",
    accent: "border-sky-300 bg-sky-50/70",
    badge: "bg-sky-600",
  },
  {
    key: "reasoning",
    label: "Reasoning",
    description: "Hubungan bukti dan klaim",
    number: "03",
    accent: "border-amber-300 bg-amber-50/70",
    badge: "bg-amber-500",
  },
];

function ManageCerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTripletForm, setShowTripletForm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [openTripletId, setOpenTripletId] = useState(null);

  /* =========================================================
     REACT QUERY DATA FETCHING
  ========================================================= */

  // 1. Fetch Aktivitas CER
  const {
    data: activity,
    isLoading: isActivityLoading,
  } = useQuery({
    queryKey: ["cer-quiz", id],
    queryFn: () => getCerQuiz(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    select: (response) => response?.data ?? response,
  });

  // 2. Fetch Triplet List
  const {
    data: triplets = [],
    isLoading: isTripletsLoading,
  } = useQuery({
    queryKey: ["cer-items", id],
    queryFn: () => getCerItems(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      const data = response?.data ?? response;
      return Array.isArray(data) ? data : [];
    },
  });

  /* =========================================================
     TOGGLE TAMPILAN KUNCI JAWABAN
  ========================================================= */
  const toggleKeysMutation = useMutation({
    mutationFn: (showKeys) => updateCerQuiz(id, { show_keys: showKeys }),
    onSuccess: () => {
      toast.success("Pengaturan penayangan kunci jawaban berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["cer-quiz", id] });
    },
    onError: (error) => {
      console.error("Gagal memperbarui show_keys:", error);
      toast.error(
        error.response?.data?.message || "Gagal memperbarui pengaturan kunci jawaban."
      );
    },
  });

  function handleToggleShowKeys() {
    if (!activity) return;
    const currentVal = activity.show_keys ?? true;
    toggleKeysMutation.mutate(!currentVal);
  }

  /* =========================================================
     WEBSOCKET REAL-TIME LISTENER (LARAVEL REVERB)
  ========================================================= */
  useEffect(() => {
    if (!id) return;

    const channel = echo.channel("cer-activities");

    channel.listen(".activity.updated", () => {
      queryClient.invalidateQueries({ queryKey: ["cer-quiz", id] });
      queryClient.invalidateQueries({ queryKey: ["cer-items", id] });
    });

    return () => {
      echo.leaveChannel("cer-activities");
    };
  }, [id, queryClient]);

  /* =========================================================
     MUTATION UPDATE STATUS
  ========================================================= */

  const statusMutation = useMutation({
    mutationFn: ({ quizId, status }) => updateCerQuizStatus(quizId, status),
    onSuccess: () => {
      toast.success("Status aktivitas berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["cer-quiz", id] });
      setShowStatusModal(false);
    },
    onError: (error) => {
      toast.error("Gagal mengubah status aktivitas.");
      console.error("Gagal mengubah status aktivitas:", error);
    },
  });

  function handleConfirmStatusChange() {
    if (!activity) return;

    const newStatus = activity.status === "draft" ? "published" : "draft";
    statusMutation.mutate({ quizId: activity.id, status: newStatus });
  }

  /* =========================================================
     TRIPLET HANDLERS
  ========================================================= */

  function handleTripletAdded() {
    queryClient.invalidateQueries({ queryKey: ["cer-items", id] });
    setShowTripletForm(false);
  }

  function handleTripletUpdated() {
    queryClient.invalidateQueries({ queryKey: ["cer-items", id] });
  }

  function handleTripletDeleted(tripletId) {
    queryClient.invalidateQueries({ queryKey: ["cer-items", id] });
    setOpenTripletId((current) => (current === tripletId ? null : current));
  }

  /* =========================================================
     RENDER STATES
  ========================================================= */

  const loading = isActivityLoading || isTripletsLoading;

  if (loading) {
    return <CerPageSkeleton />;
  }

  if (!activity) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-2xl border border-cream-border bg-white px-6 py-5 text-sm text-gray-500">
          Aktivitas CER tidak ditemukan.
        </div>
      </div>
    );
  }

  const showKeysValue = activity.show_keys ?? true;

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* INFORMASI AKTIVITAS */}
      <section className="rounded-3xl border border-cream-border bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-dark lg:text-3xl">
            {activity.title}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          {/* LEFT */}
          <div className="space-y-4">
            <InfoRow
              label="Materi"
              value={
                activity.material?.title ||
                activity.material_title ||
                "-"
              }
              icon={<BookOpen size={16} />}
            />

            <InfoRow
              label="Durasi"
              value={`${activity.duration_minutes || 0} Menit`}
              icon={<Clock3 size={16} />}
            />

            <InfoRow
              label="Deskripsi"
              value={activity.description || "-"}
              icon={<AlignLeft size={16} />}
            />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">
                Status
              </span>

              <button
                type="button"
                onClick={() => setShowStatusModal(true)}
                className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
                  activity.status === "published"
                    ? "bg-lime-brand text-dark hover:bg-lime-500"
                    : "bg-orange-200 text-orange-600 hover:bg-orange-300"
                }`}
              >
                {activity.status === "published" ? "Published" : "Draft"}
              </button>
            </div>

            <div className="flex flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/teacher/cer/${activity.id}/grades`)}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-cream-border bg-white px-3 py-2 text-xs font-semibold text-dark transition hover:bg-cream-light sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <ClipboardList size={16} className="shrink-0" />
                <span className="whitespace-nowrap">Rekap Nilai</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-cream-border bg-[#F5FCE9] px-3 py-2 injection-btn text-xs font-semibold text-dark transition hover:bg-[#EAF8D3] sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <Eye size={16} className="shrink-0 text-[#5C8C00]" />
                <span className="whitespace-nowrap">Preview</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TRIPLET SECTION */}
      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-dark">
              Triplet CER
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Kelola komponen Claim, Evidence, Reasoning, dan distractor.
            </p>
          </div>

          {/* HANYA TAMPIL JIKA STATUS AKTIVITAS ADALAH DRAFT */}
          {activity.status === "draft" && (
            <div className="flex flex-wrap items-center gap-3">
              {/* TOGGLE TAMPILAN JAWABAN BENAR UNTUK REVIEW STUDENT */}
              <button
                type="button"
                onClick={handleToggleShowKeys}
                disabled={toggleKeysMutation.isPending}
                className={`inline-flex items-center gap-3 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 shadow-sm ${
                  showKeysValue
                    ? "border-lime-brand bg-[#F5FCE9] text-dark"
                    : "border-cream-border bg-white text-slate-500 hover:bg-cream-light"
                }`}
              >
                <div
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    showKeysValue ? "bg-lime-brand" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      showKeysValue ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>

                <span className="whitespace-nowrap">Tampilkan Kunci Jawaban</span>
              </button>

              {/* TOMBOL TAMBAH TRIPLET */}
              <button
                type="button"
                onClick={() => setShowTripletForm(true)}
                className="inline-flex items-center justify-center rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark/90"
              >
                Tambah Triplet
              </button>
            </div>
          )}
        </div>

        {/* TRIPLET LIST */}
        {triplets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-cream-border bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-500">
              Belum ada triplet CER.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Klik tombol Tambah Triplet untuk membuat komponen CER.
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-2">
            {triplets.map((triplet, index) => (
              <TripletAccordionItem
                key={triplet.id}
                triplet={triplet}
                number={index + 1}
                isOpen={openTripletId === triplet.id}
                isEditable={activity.status === "draft"}
                onToggle={() =>
                  setOpenTripletId((current) =>
                    current === triplet.id ? null : triplet.id
                  )
                }
                onUpdated={handleTripletUpdated}
                onDeleted={handleTripletDeleted}
              />
            ))}
          </div>
        )}
      </section>

      {/* MODAL PREVIEW (Terisi Jawaban Benar & Read-only Drag and Drop) */}
      {showPreviewModal && (
        <PreviewCerModal
          activity={activity}
          triplets={triplets}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* ADD TRIPLET MODAL */}
      {showTripletForm && activity.status === "draft" && (
        <TripletFormModal
          mode="create"
          activityId={id}
          onClose={() => setShowTripletForm(false)}
          onAdded={handleTripletAdded}
        />
      )}

      {/* STATUS CONFIRMATION MODAL */}
      {showStatusModal && (
        <UpdateStatusModal
          targetStatus={activity.status === "draft" ? "published" : "draft"}
          loading={statusMutation.isPending}
          onClose={() => {
            if (!statusMutation.isPending) {
              setShowStatusModal(false);
            }
          }}
          onConfirm={handleConfirmStatusChange}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row">
      <span className="flex w-24 shrink-0 items-center gap-2 text-sm font-medium text-gray-500">
        <span className="text-gray-400">{icon}</span>
        {label}
      </span>

      <span className="text-sm leading-6 text-dark">{value}</span>
    </div>
  );
}

export default ManageCerPage;