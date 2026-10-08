import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import TripletFormModal from "./TripletFormModal";
import { deleteCerItem } from "../services/cerService";

function TripletAccordionItem({
  triplet,
  number,
  isOpen,
  onToggle,
  onUpdated,
  onDeleted,
  isEditable,
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const claim = getCardContent(triplet, "claim");
  const evidence = getCardContent(triplet, "evidence");
  const reasoning = getCardContent(triplet, "reasoning");
  const distractorEvidence = getCardContent(triplet, "distractor_evidence");
  const distractorReasoning = getCardContent(triplet, "distractor_reasoning");

  const editData = {
    id: triplet.id,
    claim,
    evidence,
    reasoning,
    distractor_evidence: distractorEvidence,
    distractor_reasoning: distractorReasoning,
  };

  /* =========================================================
     MUTATION: DELETE TRIPLET ITEM
  ========================================================= */
  const deleteMutation = useMutation({
    mutationFn: () => deleteCerItem(triplet.id),
    onSuccess: () => {
      onDeleted?.(triplet.id);
      setShowDelete(false);
    },
    onError: (error) => {
      console.error(error);
      setDeleteError(
        error.response?.data?.message || "Gagal menghapus triplet."
      );
    },
  });

  function handleDelete() {
    setDeleteError("");
    deleteMutation.mutate();
  }

  return (
    <>
      <article
        className={`overflow-hidden rounded-2xl border border-cream-border bg-white shadow-sm transition-shadow hover:shadow-md ${
          !isOpen ? "h-104px" : ""
        }`}
      >
        {/* =========================================
            HEADER
        ========================================== */}
        <button
          type="button"
          onClick={onToggle}
          className="flex min-h-104px w-full items-center gap-4 p-4 text-left transition hover:bg-cream-light/60 sm:p-5"
        >
          {/* Number */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${getNumberStyle(
              number
            )}`}
          >
            {String(number).padStart(2, "0")}
          </div>

          {/* Claim */}
          <div className="min-w-0 flex-1">
            {!isOpen ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Claim
                </p>

                <p className="mt-1 text-sm font-semibold leading-5 text-dark sm:text-base">
                  {truncateText(
                    claim || "Claim belum tersedia.",
                    50
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-dark">
                Triplet {String(number).padStart(2, "0")}
              </p>
            )}
          </div>

          {/* Chevron */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center text-gray-400">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {/* =========================================
            EXPANDED CONTENT
        ========================================== */}
        {isOpen && (
          <div className="border-t border-cream-border px-5 pb-7 pt-7 sm:px-6 sm:pb-8 sm:pt-8">
            <div className="space-y-5">
              <CerContent
                label="Claim"
                content={claim}
                type="claim"
              />

              <CerContent
                label="Evidence"
                content={evidence}
                type="evidence"
              />

              <CerContent
                label="Reasoning"
                content={reasoning}
                type="reasoning"
              />

              <CerContent
                label="Distractor Evidence"
                content={distractorEvidence}
                type="distractor"
              />

              <CerContent
                label="Distractor Reasoning"
                content={distractorReasoning}
                type="distractor"
              />
            </div>

            {/* Actions */}
            {isEditable && (
              <div className="mt-7 flex justify-end gap-2 border-t border-cream-border pt-5">
                <button
                  type="button"
                  onClick={() => setShowEdit(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-cream-border bg-white px-4 py-2.5 text-sm font-semibold text-dark transition hover:bg-cream-light"
                >
                  <Pencil size={16} />
                  Ubah
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setShowDelete(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-100"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>
            )}
          </div>
        )}
      </article>

      {/* =========================================
          EDIT MODAL
      ========================================== */}
      {showEdit && (
        <TripletFormModal
          mode="edit"
          triplet={editData}
          onClose={() => setShowEdit(false)}
          onUpdated={(updatedTriplet) => {
            onUpdated?.(updatedTriplet);
            setShowEdit(false);
          }}
        />
      )}

      {/* =========================================
          DELETE MODAL
      ========================================== */}
      {showDelete && (
        <DeleteTripletModal
          number={number}
          loading={deleteMutation.isPending}
          error={deleteError}
          onClose={() => {
            if (!deleteMutation.isPending) {
              setShowDelete(false);
            }
          }}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

function getCardContent(triplet, cardType) {
  const card = triplet.option_cards?.find(
    (item) => item.card_type === cardType
  );

  return card?.content || "";
}

function CerContent({ label, content, type }) {
  return (
    <div className={`rounded-xl border p-4 ${getContentStyle(type)}`}>
      <p className="text-xs font-bold uppercase tracking-wider">{label}</p>

      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-dark">
        {content || "-"}
      </p>
    </div>
  );
}

function getNumberStyle(number) {
  const styles = [
    "bg-lime-brand text-dark",
    "bg-violet-100 text-violet-600",
    "bg-sky-100 text-sky-600",
    "bg-orange-100 text-orange-600",
    "bg-pink-100 text-pink-600",
  ];

  return styles[(number - 1) % styles.length];
}

function getContentStyle(type) {
  if (type === "claim") {
    return "border-lime-brand/30 bg-lime-brand/5 text-green-700";
  }

  if (type === "evidence") {
    return "border-sky-200 bg-sky-50/50 text-sky-700";
  }

  if (type === "reasoning") {
    return "border-violet-200 bg-violet-50/50 text-violet-700";
  }

  return "border-red-200 bg-red-50/50 text-red-500";
}

function DeleteTripletModal({ number, loading, error, onClose, onDelete }) {
  return (
    <div
      className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-6 sm:px-7">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Trash2 size={20} />
            </div>

            <h2 className="text-lg font-bold text-dark">Hapus Triplet?</h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Apakah Anda yakin ingin menghapus Triplet{" "}
              <strong className="text-dark">
                {String(number).padStart(2, "0")}
              </strong>
              ?
            </p>

            <p className="mt-1 text-sm leading-6 text-gray-400">
              Data triplet yang telah dihapus tidak dapat dikembalikan.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center text-2xl rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-500 sm:mx-7">
            {error}
          </div>
        )}

        {/* Footer */}
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
            onClick={onDelete}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <LoaderCircle size={17} className="animate-spin" />
            )}

            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

function truncateText(text, maxLength = 50) {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export default TripletAccordionItem;