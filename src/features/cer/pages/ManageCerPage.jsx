import { useState } from "react";
import {
  AlignLeft,
  BookOpen,
  Clock3,
  ClipboardList,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import TripletFormModal from "../components/TripletFormModal";
import TripletAccordionItem from "../components/TripletAccordionItem";
import UpdateStatusModal from "../components/UpdateStatusModal";
import CerPageSkeleton from "../components/CerPageSkeleton";

import {
  getCerQuiz,
  getCerItems,
  updateCerQuizStatus,
} from "../services/cerService";

function ManageCerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTripletForm, setShowTripletForm] = useState(false);
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
     MUTATION UPDATE STATUS
  ========================================================= */

  const statusMutation = useMutation({
    mutationFn: ({ quizId, status }) => updateCerQuizStatus(quizId, status),
    onSuccess: () => {
      // Refresh cache info aktivitas setelah status diubah
      queryClient.invalidateQueries({ queryKey: ["cer-quiz", id] });
      setShowStatusModal(false);
    },
    onError: (error) => {
      console.error("Gagal mengubah status aktivitas:", error);
    },
  });

  function handleConfirmStatusChange() {
    if (!activity) return;

    const newStatus = activity.status === "draft" ? "published" : "draft";
    statusMutation.mutate({ quizId: activity.id, status: newStatus });
  }

  /* =========================================================
     TRIPLET HANDLERS (Manual cache update / Invalidation)
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
          <div className="flex flex-col items-start gap-4 lg:items-end">
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

            <button
              type="button"
              onClick={() => navigate(`/teacher/cer/${activity.id}/grades`)}
              className="inline-flex items-center gap-2 rounded-xl border border-cream-border bg-white px-4 py-2.5 text-sm font-semibold text-dark transition hover:bg-cream-light"
            >
              <ClipboardList size={17} />
              Rekap Nilai
            </button>
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

          {activity.status === "draft" && (
            <button
              type="button"
              onClick={() => setShowTripletForm(true)}
              className="inline-flex items-center justify-center rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark/90"
            >
              Tambah Triplet
            </button>
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