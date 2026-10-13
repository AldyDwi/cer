import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  Trophy,
  BookOpen,
  LoaderCircle,
  AlertCircle,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../../services/api";
import echo from "../../../utils/echo";
import { useAuth } from "../../../contexts/AuthContext";

const CER_SLOTS = [
  {
    key: "claim",
    label: "Claim",
    description: "Pernyataan utama",
    answerKey: "claim_card_id",
    correctKey: "is_claim_correct",
    number: "01",
    badge: "bg-violet-600",
  },
  {
    key: "evidence",
    label: "Evidence",
    description: "Data atau fakta pendukung",
    answerKey: "evidence_card_id",
    correctKey: "is_evidence_correct",
    number: "02",
    badge: "bg-sky-600",
  },
  {
    key: "reasoning",
    label: "Reasoning",
    description: "Hubungan bukti dan klaim",
    answerKey: "reasoning_card_id",
    correctKey: "is_reasoning_correct",
    number: "03",
    badge: "bg-amber-500",
  },
];

function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;

  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }

  if (minutes > 0) {
    return `${minutes} menit ${remainingSeconds} detik`;
  }

  return `${remainingSeconds} detik`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date) + " WIB"
  );
}

function getSelectedCard(item, cardId) {
  if (cardId == null) return null;

  return (
    item.cards?.find(
      (card) => Number(card.id) === Number(cardId)
    ) ?? null
  );
}

function getCorrectCard(item, slotKey) {
  return (
    item.cards?.find(
      (card) => card.card_type === slotKey
    ) ?? null
  );
}

function getCorrectCount(item) {
  const answer = item.answer;

  if (!answer) return 0;

  return CER_SLOTS.filter(
    (slot) => answer[slot.correctKey] === true
  ).length;
}

function getTotalCorrect(items) {
  return items.reduce(
    (total, item) => total + getCorrectCount(item),
    0
  );
}

function ResultBadge({ correct, answered }) {
  if (!answered) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
        Belum dijawab
      </span>
    );
  }

  if (correct) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-800">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Benar
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
      <XCircle className="h-3.5 w-3.5" />
      Salah
    </span>
  );
}

function AnswerReview({ item, slot, showCorrectAnswers = true }) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const answer = item.answer;

  const selectedCard = getSelectedCard(
    item,
    answer?.[slot.answerKey]
  );

  const correctCard = getCorrectCard(item, slot.key);

  const isCorrect = answer?.[slot.correctKey] === true;
  const answered = answer?.[slot.answerKey] != null;

  return (
    <div className="rounded-xl border border-cream-border bg-[#FCFBF6] p-3 sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold text-white ${slot.badge}`}
          >
            {slot.number}
          </span>

          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-slate-900">
              {slot.label}
            </h4>

            <p className="mt-0.5 text-[11px] text-slate-500">
              {slot.description}
            </p>
          </div>
        </div>

        <ResultBadge
          correct={isCorrect}
          answered={answered}
        />
      </div>

      {/* Jawaban mahasiswa */}
      <div
        className={`rounded-lg border p-3 ${
          !answered
            ? "border-slate-200 bg-white"
            : isCorrect
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
        }`}
      >
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {isTeacher ? "Jawaban mahasiswa" : "Jawaban kamu"}
        </p>

        <div className="flex items-start gap-2">
          {answered && (
            isCorrect ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            )
          )}

          <p className="whitespace-pre-line wrap-break-word text-sm leading-6 text-slate-700">
            {selectedCard?.content ?? (isTeacher ? "Belum memilih kartu." : "Kamu belum memilih kartu.")}
          </p>
        </div>
      </div>

      {/* Kunci jawaban */}
      {!isCorrect && showCorrectAnswers && (
        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-green-800">
            Jawaban yang benar
          </p>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />

            <p className="whitespace-pre-line wrap-break-word text-sm leading-6 text-green-900">
              {correctCard?.content ??
                "Kunci jawaban tidak tersedia."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TripletReview({ item, index, showCorrectAnswers }) {
  const [expanded, setExpanded] = useState(true);

  const correctCount = getCorrectCount(item);
  const answer = item.answer;

  return (
    <section className="overflow-hidden rounded-2xl border border-cream-border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((previous) => !previous)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-[#FCFBF6] sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
              correctCount === 3
                ? "bg-green-100 text-green-800"
                : correctCount > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 sm:text-base">
              Triplet CER {index + 1}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {correctCount} dari 3 komponen benar
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              correctCount === 3
                ? "bg-green-100 text-green-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {correctCount}/3
          </span>

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-cream-border p-3 sm:p-5">
          {!answer && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Data jawaban untuk triplet ini tidak ditemukan.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {CER_SLOTS.map((slot) => (
              <AnswerReview
                key={slot.key}
                item={item}
                slot={slot}
                showCorrectAnswers={showCorrectAnswers}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function StudentCerReviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* =========================================================
      REACT QUERY DATA FETCHING
  ========================================================= */
  const {
    data: reviewData,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["student-cer-review", id, location.search],
    queryFn: async () => {
      // Menyertakan query parameter ?student_id=... jika ada dari URL
      const response = await api.get(
        `/student/cer-quizzes/${id}/review${location.search}`
      );
      return response.data;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });

  /* =========================================================
      WEBSOCKET REAL-TIME LISTENER (LARAVEL REVERB)
  ========================================================= */
  useEffect(() => {
    const channel = echo.channel("cer-activities");

    channel.listen(".activity.updated", (event) => {
      if (Number(event?.activity_id ?? event?.id) === Number(id)) {
        queryClient.invalidateQueries({
          queryKey: ["student-cer-review", id, location.search],
        });
      }
    });

    return () => {
      echo.leaveChannel("cer-activities");
    };
  }, [id, location.search, queryClient]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/student");
    }
  };

  const quiz = reviewData?.quiz ?? null;
  const attempt = reviewData?.attempt ?? null;
  const items = Array.isArray(reviewData?.items) ? reviewData.items : [];

  const errorMessage =
    isError &&
    (queryError?.response?.data?.message ??
      queryError?.message ??
      "Hasil pengerjaan tidak dapat dimuat.");

  const totalComponents = items.length * 3;

  const correctComponents = useMemo(
    () => getTotalCorrect(items),
    [items]
  );

  const percentage =
    totalComponents > 0
      ? Math.round(
          (correctComponents / totalComponents) * 100
        )
      : 0;

  const score = Number(attempt?.score ?? 0);
  const showCorrectAnswers = quiz?.show_keys ?? true;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-light">
        <div className="flex items-center gap-3 text-slate-600">
          <LoaderCircle className="h-6 w-6 animate-spin" />
          <span>Memuat hasil pengerjaan...</span>
        </div>
      </main>
    );
  }

  if (errorMessage || !quiz || !attempt) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-light p-5">
        <section className="w-full max-w-lg rounded-2xl border border-cream-border bg-white p-6 shadow-sm">
          <AlertCircle className="mb-3 h-8 w-8 text-red-500" />

          <h1 className="text-lg font-extrabold text-slate-900">
            Hasil belum tersedia
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {errorMessage ||
              "Data hasil pengerjaan tidak ditemukan. Pastikan aktivitas sudah diselesaikan."}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-cream-border bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Coba lagi
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream-light text-slate-900">
      {/* Header */}
      <header className={`bg-white {isTeacher ? "rounded-2xl border border-cream-border shadow-sm" : "border-b border-cream-border"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
              Reka-CER
            </p>

            <h1 className="mt-1 truncate text-lg font-extrabold sm:text-xl">
              Hasil Pengerjaan CER
            </h1>
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-cream-border bg-[#FCFBF6] px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-lime-brand hover:bg-[#F5FCE9] sm:px-4 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </button>
        </div>

        <div className="h-1 bg-cream-border">
          <div
            className="h-full bg-lime-brand"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
        {/* Kartu nilai */}
        <section className="overflow-hidden rounded-2xl border border-cream-border bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F9E3]">
                  <Trophy className="h-5 w-5 text-green-800" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">
                    Aktivitas selesai
                  </p>

                  <h2 className="mt-0.5 text-lg font-extrabold sm:text-xl">
                    {quiz.title}
                  </h2>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Berikut hasil rekonstruksi Claim, Evidence, dan Reasoning
                yang telah dikerjakan. Tinjau setiap komponen untuk
                mengetahui jawaban yang benar dan bagian yang perlu
                dipelajari kembali.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {correctComponents}/{totalComponents} komponen benar
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {items.length} triplet CER
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-t border-cream-border bg-[#FCFBF6] p-6 text-center md:border-l md:border-t-0">
              <p className="text-xs font-bold text-slate-500">
                Nilai akhir
              </p>

              <div className="mt-2 flex h-28 w-28 items-center justify-center rounded-full border-[7px] border-cream-border bg-white">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {Number.isFinite(score)
                      ? score.toLocaleString("id-ID", {
                          maximumFractionDigits: 2,
                        })
                      : "0"}
                  </span>

                  <span className="text-[10px] font-bold text-slate-400">
                    dari 100
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Akurasi komponen: {percentage}%
              </p>
            </div>
          </div>
        </section>

        {/* Informasi pengerjaan */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-cream-border bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50">
              <Clock3 className="h-5 w-5 text-sky-700" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Durasi pengerjaan
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {formatDuration(attempt.duration_seconds)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-cream-border bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50">
              <ClipboardCheck className="h-5 w-5 text-violet-700" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Waktu penyelesaian
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {formatDate(attempt.completed_at)}
              </p>
            </div>
          </div>
        </section>

        {/* Materi */}
        {quiz.material && (
          <section className="flex items-start gap-3 rounded-2xl border border-cream-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50">
              <BookOpen className="h-5 w-5 text-violet-700" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Materi pembelajaran
              </p>

              <h3 className="mt-1 text-sm font-extrabold text-slate-900">
                {quiz.material.title}
              </h3>
            </div>
          </section>
        )}

        {/* Detail jawaban */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Detail jawaban
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Buka setiap triplet untuk meninjau jawaban{showCorrectAnswers ? " dan membandingkannya dengan kunci jawaban." : "."}
            </p>
          </div>

          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, index) => (
                <TripletReview
                  key={item.id}
                  item={item}
                  index={index}
                  showCorrectAnswers={showCorrectAnswers}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-cream-border bg-white p-6 text-center">
              <p className="text-sm text-slate-500">
                Tidak ada data triplet untuk ditampilkan.
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-cream-border bg-white p-5 sm:flex-row">
          <div>
            <h3 className="text-sm font-extrabold">
              Sudah selesai meninjau hasil?
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Klik tombol kembali untuk kembali ke halaman sebelumnya.
            </p>
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-brand px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:bg-lime-hover sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        </footer>
      </div>
    </main>
  );
}