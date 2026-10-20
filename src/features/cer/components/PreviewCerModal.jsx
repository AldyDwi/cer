import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  X,
  CheckCircle2,
  GripVertical,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const SLOTS = [
  {
    key: "claim",
    label: "Claim",
    description: "Pernyataan utama",
    number: "01",
    accent: "border-violet-300 bg-violet-50/70",
    badge: "bg-violet-600",
    textBadge: "bg-violet-100 text-violet-700 border-violet-200",
  },
  {
    key: "evidence",
    label: "Evidence",
    description: "Data atau fakta pendukung",
    number: "02",
    accent: "border-sky-300 bg-sky-50/70",
    badge: "bg-sky-600",
    textBadge: "bg-sky-100 text-sky-700 border-sky-200",
  },
  {
    key: "reasoning",
    label: "Reasoning",
    description: "Hubungan bukti dan klaim",
    number: "03",
    accent: "border-amber-300 bg-amber-50/70",
    badge: "bg-amber-500",
    textBadge: "bg-amber-100 text-amber-800 border-amber-200",
  },
];

/**
 * Fungsi helper untuk mengacak urutan array (Fisher-Yates Shuffle)
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function PreviewCerModal({ activity, triplets = [], onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentItem = triplets[currentIndex] ?? null;

  // Key prefix khusus session/cache preview modal ini
  const previewSessionKey = useMemo(
    () => `preview_session_${activity?.id ?? 'default'}`,
    [activity?.id]
  );

  /* =========================================================
     BERSIHKAN CACHE PREVIEW SAAT MODAL DITUTUP / UNMOUNT
  ========================================================= */
  useEffect(() => {
    return () => {
      // Hapus seluruh cache acakan kartu modal preview dari sessionStorage
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("preview_cards_order_")) {
          sessionStorage.removeItem(key);
        }
      });
    };
  }, []);

  // Mengambil daftar kartu asli dari item saat ini
  const rawCardsList = useMemo(() => {
    return (
      currentItem?.option_cards ??
      currentItem?.optionCards ??
      currentItem?.cards ??
      []
    );
  }, [currentItem]);

  /* =========================================================
     PENGACAKAN KARTU PREVIEW (ACAK 1 KALI SELAMA MODAL BUKA)
  ========================================================= */
  const shuffledCardsList = useMemo(() => {
    if (!rawCardsList || rawCardsList.length === 0) return [];

    const storageKey = `preview_cards_order_${previewSessionKey}_${currentItem?.id}`;
    const savedOrder = sessionStorage.getItem(storageKey);

    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const cardMap = new Map(rawCardsList.map((c) => [Number(c.id), c]));
        const orderedCards = orderIds
          .map((cardId) => cardMap.get(Number(cardId)))
          .filter(Boolean);

        if (orderedCards.length === rawCardsList.length) {
          return orderedCards;
        }
      } catch (e) {
        console.error("Gagal membaca cache acakan preview:", e);
      }
    }

    // Acak baru dan simpan ke sessionStorage untuk sesi modal ini
    const newShuffled = shuffleArray(rawCardsList);
    const newOrderIds = newShuffled.map((card) => card.id);
    sessionStorage.setItem(storageKey, JSON.stringify(newOrderIds));

    return newShuffled;
  }, [rawCardsList, currentItem?.id, previewSessionKey]);

  // Mencari kartu jawaban benar berdasarkan card_type
  const getCorrectCard = (slotType) => {
    return (
      rawCardsList.find((card) => {
        const type = card.card_type ?? card.type;
        return String(type).toLowerCase() === String(slotType).toLowerCase();
      }) ?? null
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-cream-border bg-cream-light shadow-2xl">
        {/* Header Modal Preview */}
        <div className="flex shrink-0 items-center justify-between border-b border-cream-border bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              <Eye size={14} /> Mode Preview
            </span>
            <h3 className="hidden text-sm font-bold text-dark sm:inline">
              {activity?.title ?? "Aktivitas CER"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-500 hover:bg-cream-light hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        {/* Konten Pengerjaan Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {triplets.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Belum ada triplet CER untuk dipreview.
            </div>
          ) : (
            <div className="space-y-6">
              {/* SLOT CER HORIZONTAL (Terisi Jawaban Benar) */}
              <div className="rounded-2xl border border-cream-border bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold sm:text-base text-dark">
                      Pasangkan komponen CER
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Seret kartu ke slot atau ketuk kartu pilihan di bawah.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    3/3 terisi
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {SLOTS.map((slot) => {
                    const correctCard = getCorrectCard(slot.key);

                    return (
                      <div
                        key={slot.key}
                        className={`relative flex min-h-35 flex-col rounded-xl border-2 border-solid ${slot.accent} p-3.5`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white ${slot.badge}`}
                          >
                            {slot.number}
                          </span>

                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold sm:text-sm">
                              {slot.label}
                            </h4>
                            <p className="text-[10px] leading-3 text-slate-500">
                              {slot.description}
                            </p>
                          </div>
                        </div>

                        {correctCard ? (
                          <div className="flex flex-1 items-start gap-2.5 rounded-xl border border-white/80 bg-white p-3 shadow-sm">
                            <p className="flex-1 whitespace-pre-line text-xs leading-5 text-slate-700">
                              {correctCard.content}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-cream-border bg-white/60 p-3 text-xs text-gray-400">
                            Kunci tidak ditemukan
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PILIHAN KARTU (Sama dengan Layout Mahasiswa) */}
              <div className="rounded-2xl border border-cream-border bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold sm:text-base text-dark">
                      Pilihan kartu
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Tarik kartu ke slot CER atau klik kartu untuk memilihnya.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {shuffledCardsList.map((card, idx) => {
                    const cardType = String(card.card_type ?? card.type).toLowerCase();
                    const selectedSlot = SLOTS.find((slot) => slot.key === cardType);

                    return (
                      <div
                        key={card.id ?? idx}
                        className={`group relative flex min-h-40 cursor-not-allowed select-none flex-col rounded-xl border p-3.5 text-left transition-all ${
                          selectedSlot
                            ? "border-lime-brand bg-[#F5FCE9] shadow-sm"
                            : "border-cream-border bg-[#FCFBF6]"
                        }`}
                      >
                        <div className="mb-2 flex w-full items-center justify-between gap-1">
                          <div className="flex items-center gap-1 text-slate-400">
                            <GripVertical className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                              Kartu {String(idx + 1).padStart(2, "0")}
                            </span>
                          </div>

                          {selectedSlot ? (
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${selectedSlot.textBadge}`}
                            >
                              {selectedSlot.label}
                            </span>
                          ) : (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                              Pengecoh
                            </span>
                          )}
                        </div>

                        <p className="flex-1 whitespace-pre-line text-xs leading-5 text-slate-700">
                          {card.content}
                        </p>

                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-lime-brand" />
                          {selectedSlot ? "Klik untuk melepas" : "Geser kartu"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigasi Triplet */}
        <div className="flex shrink-0 items-center justify-between border-t border-cream-border bg-white px-5 py-3">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-cream-border bg-white px-3.5 py-2 text-xs font-bold text-dark disabled:opacity-40"
          >
            <ArrowLeft size={16} /> Sebelumnya
          </button>

          <span className="text-xs font-bold text-gray-500">
            Triplet {currentIndex + 1} / {triplets.length}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentIndex((prev) =>
                Math.min(triplets.length - 1, prev + 1)
              )
            }
            disabled={currentIndex >= triplets.length - 1}
            className="inline-flex items-center gap-2 rounded-xl border border-cream-border bg-white px-3.5 py-2 text-xs font-bold text-dark disabled:opacity-40"
          >
            Berikutnya <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}