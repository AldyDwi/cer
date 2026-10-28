import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  FileText,
  GripVertical,
  LoaderCircle,
  PanelRightOpen,
  Send,
  X,
} from "lucide-react";
import api from "../../../services/api";
import echo from "../../../utils/echo";
import logoImg from "../../../assets/logo.png";

const AUTOSAVE_INTERVAL = 10_000;

const SLOTS = [
  {
    key: "claim_card_id",
    logKey: "claim",
    label: "Claim",
    description: "Pernyataan utama",
    number: "01",
    accent: "border-violet-300 bg-violet-50/70",
    badge: "bg-violet-600",
    textBadge: "bg-violet-100 text-violet-700 border-violet-200",
  },
  {
    key: "evidence_card_id",
    logKey: "evidence",
    label: "Evidence",
    description: "Data atau fakta pendukung",
    number: "02",
    accent: "border-sky-300 bg-sky-50/70",
    badge: "bg-sky-600",
    textBadge: "bg-sky-100 text-sky-700 border-sky-200",
  },
  {
    key: "reasoning_card_id",
    logKey: "reasoning",
    label: "Reasoning",
    description: "Hubungan bukti dan klaim",
    number: "03",
    accent: "border-amber-300 bg-amber-50/70",
    badge: "bg-amber-500",
    textBadge: "bg-amber-100 text-amber-800 border-amber-200",
  },
];

const EMPTY_ANSWER = {
  claim_card_id: null,
  evidence_card_id: null,
  reasoning_card_id: null,
};

const INITIAL_LOGS = {
  place_claim: 0,
  place_evidence: 0,
  place_reasoning: 0,
  delete_claim: 0,
  delete_evidence: 0,
  delete_reasoning: 0,
  replace_claim: 0,
  replace_evidence: 0,
  replace_reasoning: 0,
  read_material_count: 0,
  read_material_time: 0,
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function formatDeadlineWIB(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date) + " WIB"
  );
}

function resolveDeadline(attempt, durationMinutes, fallbackStartedAt) {
  const deadlineAt = attempt?.deadline_at ?? attempt?.deadlineAt;

  if (deadlineAt) {
    const timestamp = new Date(deadlineAt).getTime();

    if (!Number.isNaN(timestamp)) {
      return {
        timestamp,
        source: "server",
      };
    }
  }

  const startedAt = attempt?.started_at ?? attempt?.startedAt;

  if (startedAt && Number(durationMinutes) > 0) {
    const started = new Date(startedAt).getTime();

    if (!Number.isNaN(started)) {
      return {
        timestamp: started + Number(durationMinutes) * 60_000,
        source: "derived",
      };
    }
  }

  if (fallbackStartedAt && Number(durationMinutes) > 0) {
    return {
      timestamp: fallbackStartedAt + Number(durationMinutes) * 60_000,
      source: "local-fallback",
    };
  }

  return {
    timestamp: null,
    source: "missing",
  };
}

function createInitialAnswers(items = []) {
  const result = {};

  for (const item of items) {
    result[item.id] = {
      claim_card_id: item.answer?.claim_card_id ?? null,
      evidence_card_id: item.answer?.evidence_card_id ?? null,
      reasoning_card_id: item.answer?.reasoning_card_id ?? null,
    };
  }

  return result;
}

function toAnswerPayload(answers) {
  return Object.entries(answers).map(([itemId, answer]) => ({
    item_id: Number(itemId),
    claim_card_id: answer.claim_card_id ?? null,
    evidence_card_id: answer.evidence_card_id ?? null,
    reasoning_card_id: answer.reasoning_card_id ?? null,
  }));
}

function getFilledCount(answer = EMPTY_ANSWER) {
  return SLOTS.filter((slot) => answer?.[slot.key] != null).length;
}

export default function StudentCerAttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quizId = id;

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [logs, setLogs] = useState(INITIAL_LOGS);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [errorMessage, setErrorMessage] = useState("");

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [fallbackStartedAt, setFallbackStartedAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [draggingCardId, setDraggingCardId] = useState(null);
  const [activeDropSlot, setActiveDropSlot] = useState(null);

  const answersRef = useRef({});
  const logsRef = useRef(INITIAL_LOGS);
  const dirtyRef = useRef(false);
  const revisionRef = useRef(0);
  const savePromiseRef = useRef(null);
  const submittingRef = useRef(false);
  const enabledRef = useRef(false);
  const autoSubmitTriggeredRef = useRef(false);
  const deadlineRef = useRef(null);

  const currentItem = items[currentIndex] ?? null;

  /* =========================================================
     AUTO SCROLL LAKUKAN DRAG DI KURSOR ATAS / BAWAH
  ========================================================= */
  useEffect(() => {
    if (!draggingCardId) return;

    let animFrameId;

    const handleDragOverWindow = (e) => {
      const threshold = 120; // Jarak zona scroll (px) dari tepi atas/bawah
      const clientY = e.clientY;
      const windowHeight = window.innerHeight;

      if (clientY < threshold) {
        // Drag mendekati bagian atas layar -> scroll up
        const speed = Math.max(5, Math.floor((threshold - clientY) / 3));
        window.scrollBy({ top: -speed, behavior: "instant" });
      } else if (windowHeight - clientY < threshold) {
        // Drag mendekati bagian bawah layar -> scroll down
        const speed = Math.max(5, Math.floor((threshold - (windowHeight - clientY)) / 3));
        window.scrollBy({ top: speed, behavior: "instant" });
      }
    };

    window.addEventListener("dragover", handleDragOverWindow);

    return () => {
      window.removeEventListener("dragover", handleDragOverWindow);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [draggingCardId]);

  /* =========================================================
     TRACKING WAKTU BACA MATERI (MODAL MATERI)
  ========================================================= */
  useEffect(() => {
    let timer;

    if (showMaterialModal) {
      setLogs((prev) => {
        const nextLogs = {
          ...prev,
          read_material_count: prev.read_material_count + 1,
        };
        logsRef.current = nextLogs;
        dirtyRef.current = true;
        return nextLogs;
      });

      timer = setInterval(() => {
        setLogs((prev) => {
          const nextLogs = {
            ...prev,
            read_material_time: prev.read_material_time + 1,
          };
          logsRef.current = nextLogs;
          dirtyRef.current = true;
          return nextLogs;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showMaterialModal]);

  /* =========================================================
     PENGACAKAN KARTU (SHUFFLE CARDS) PER ITEM
  ========================================================= */
  const shuffledCards = useMemo(() => {
    if (!currentItem?.cards || currentItem.cards.length === 0) return [];

    const storageKey = `cer_cards_order_${quizId}_${currentItem.id}`;
    const savedOrder = localStorage.getItem(storageKey);

    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const cardMap = new Map(currentItem.cards.map((c) => [Number(c.id), c]));
        const orderedCards = orderIds
          .map((cardId) => cardMap.get(Number(cardId)))
          .filter(Boolean);

        if (orderedCards.length === currentItem.cards.length) {
          return orderedCards;
        }
      } catch (e) {
        console.error("Gagal membaca urutan kartu dari localStorage", e);
      }
    }

    const newShuffled = shuffleArray(currentItem.cards);
    const newOrderIds = newShuffled.map((card) => card.id);
    localStorage.setItem(storageKey, JSON.stringify(newOrderIds));

    return newShuffled;
  }, [quizId, currentItem?.id, currentItem?.cards]);

  const currentAnswer = currentItem
    ? answers[currentItem.id] ?? EMPTY_ANSWER
    : EMPTY_ANSWER;

  const totalFilled = items.reduce(
    (total, item) => total + getFilledCount(answers[item.id]),
    0
  );

  const totalSlots = items.length * 3;
  const currentFilled = getFilledCount(currentAnswer);

  const deadlineInfo = useMemo(
    () =>
      resolveDeadline(
        attempt,
        quiz?.duration_minutes ?? quiz?.duration ?? quiz?.time_limit_minutes,
        fallbackStartedAt
      ),
    [
      attempt,
      quiz?.duration_minutes,
      quiz?.duration,
      quiz?.time_limit_minutes,
      fallbackStartedAt,
    ]
  );

  const deadlineLabel = formatDeadlineWIB(
    deadlineInfo.timestamp
      ? new Date(deadlineInfo.timestamp).toISOString()
      : null
  );

  /* =========================================================
     WEBSOCKET REAL-TIME LISTENER (LARAVEL REVERB)
  ========================================================= */
  useEffect(() => {
    const channel = echo.channel("cer-activities");

    channel.listen(".activity.updated", (event) => {
      if (Number(event?.activity_id ?? event?.id) === Number(quizId)) {
        setErrorMessage(
          "Aktivitas ini telah diperbarui oleh dosen. Jawabanmu tetap aman."
        );
      }
    });

    channel.listen(".attempt.submitted", (event) => {
      if (Number(event?.quiz_id ?? event?.activity_id) === Number(quizId)) {
        navigate(`/student/cer/${quizId}/review`, { replace: true });
      }
    });

    return () => {
      echo.leaveChannel("cer-activities");
    };
  }, [quizId, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function loadAttempt() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get(
          `/student/cer-quizzes/${quizId}/attempt`
        );

        if (cancelled) return;

        const data = response.data;

        const loadedQuiz =
          data.quiz ?? data.cer_quiz ?? data.activity ?? null;

        const loadedAttempt =
          data.attempt ?? data.quiz_attempt ?? null;

        const loadedDuration =
          loadedQuiz?.duration_minutes ??
          loadedQuiz?.duration ??
          loadedQuiz?.time_limit_minutes ??
          data.duration_minutes ??
          null;

        const loadedItems = Array.isArray(data.items) ? data.items : [];
        const initialAnswers = createInitialAnswers(loadedItems);
        const loadedLogs = data.logs || INITIAL_LOGS;

        setQuiz(
          loadedQuiz
            ? {
                ...loadedQuiz,
                duration_minutes: loadedDuration,
              }
            : null
        );

        setAttempt(loadedAttempt);
        setFallbackStartedAt(Date.now());
        setItems(loadedItems);
        setAnswers(initialAnswers);
        setLogs(loadedLogs);

        answersRef.current = initialAnswers;
        logsRef.current = loadedLogs;
        dirtyRef.current = false;
        revisionRef.current = 0;

        if (loadedAttempt?.status === "completed") {
          navigate(`/student/cer/${quizId}/review`, { replace: true });
          return;
        }

        enabledRef.current = true;
      } catch (error) {
        if (cancelled) return;

        setErrorMessage(
          error.response?.data?.message ??
            "Aktivitas tidak dapat dimuat. Periksa koneksi dan coba lagi."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAttempt();

    return () => {
      cancelled = true;
      enabledRef.current = false;
    };
  }, [quizId, navigate]);

  useEffect(() => {
    if (!deadlineInfo.timestamp) {
      setRemainingSeconds(null);
      deadlineRef.current = null;
      return;
    }

    deadlineRef.current = deadlineInfo.timestamp;

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.ceil((deadlineInfo.timestamp - Date.now()) / 1000)
      );

      setRemainingSeconds(seconds);
    };

    updateTimer();

    const intervalId = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(intervalId);
  }, [deadlineInfo.timestamp]);

  /* =========================================================
     AUTOSAVE DENGAN PAYLOAD ANSWERS + LOGS
  ========================================================= */
  const saveNow = useCallback(async () => {
    if (!enabledRef.current || !dirtyRef.current) {
      return true;
    }

    if (savePromiseRef.current) {
      try {
        await savePromiseRef.current;
      } catch {
        return false;
      }

      if (dirtyRef.current && enabledRef.current) {
        return saveNow();
      }

      return !dirtyRef.current;
    }

    const revisionAtStart = revisionRef.current;

    const payload = {
      answers: toAnswerPayload(answersRef.current),
      logs: logsRef.current,
    };

    setSaveStatus("saving");

    const task = api
      .put(`/student/cer-quizzes/${quizId}/attempt/answers`, payload)
      .then(() => {
        if (revisionRef.current === revisionAtStart) {
          dirtyRef.current = false;
          setSaveStatus("saved");
        } else {
          setSaveStatus("unsaved");
        }
      })
      .catch((error) => {
        if (error.response?.status === 409) {
          enabledRef.current = false;
          setSaveStatus("expired");
          setErrorMessage("Waktu habis atau attempt sudah selesai.");
          navigate(`/student/cer/${quizId}/review`, { replace: true });
        } else {
          setSaveStatus("error");
          setErrorMessage(
            error.response?.data?.message ??
              "Autosave gagal. Periksa koneksi internet."
          );
        }

        throw error;
      })
      .finally(() => {
        savePromiseRef.current = null;
      });

    savePromiseRef.current = task;

    try {
      await task;
    } catch {
      return false;
    }

    if (dirtyRef.current && enabledRef.current) {
      return saveNow();
    }

    return !dirtyRef.current;
  }, [quizId, navigate]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (dirtyRef.current && !savePromiseRef.current) {
        saveNow();
      }
    }, AUTOSAVE_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [attempt, saveNow]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        dirtyRef.current &&
        enabledRef.current &&
        !savePromiseRef.current
      ) {
        saveNow();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [saveNow]);

  /* =========================================================
     ASSIGN CARD DENGAN TRACKING LOG (PLACE / DELETE / REPLACE)
  ========================================================= */
  const assignCard = useCallback((itemId, field, cardId) => {
    if (!enabledRef.current || submittingRef.current) {
      return;
    }

    setAnswers((previous) => {
      const currentSlotAnswer = previous[itemId]?.[field] ?? null;
      const targetSlot = SLOTS.find((s) => s.key === field);
      const slotLogKey = targetSlot?.logKey || "claim";

      let actionType = null;
      if (cardId === null && currentSlotAnswer !== null) {
        actionType = "delete";
      } else if (cardId !== null && currentSlotAnswer === null) {
        actionType = "place";
      } else if (cardId !== null && currentSlotAnswer !== null && cardId !== currentSlotAnswer) {
        actionType = "replace";
      }

      if (actionType) {
        const logFieldKey = `${actionType}_${slotLogKey}`;
        setLogs((prevLogs) => {
          const nextLogs = {
            ...prevLogs,
            [logFieldKey]: (prevLogs[logFieldKey] || 0) + 1,
          };
          logsRef.current = nextLogs;
          return nextLogs;
        });
      }

      const nextAnswer = {
        ...EMPTY_ANSWER,
        ...(previous[itemId] ?? {}),
      };

      for (const slot of SLOTS) {
        if (slot.key !== field && nextAnswer[slot.key] === cardId) {
          nextAnswer[slot.key] = null;
        }
      }

      nextAnswer[field] = cardId;

      const nextAnswers = {
        ...previous,
        [itemId]: nextAnswer,
      };

      answersRef.current = nextAnswers;
      dirtyRef.current = true;
      revisionRef.current += 1;

      setSaveStatus("unsaved");
      setErrorMessage("");

      return nextAnswers;
    });
  }, []);

  const removeCard = (itemId, field) => {
    assignCard(itemId, field, null);
  };

  const getCard = (cardId) =>
    currentItem?.cards?.find((card) => Number(card.id) === Number(cardId));

  const handleCardClick = (cardId) => {
    if (!currentItem) return;

    const alreadySelected = SLOTS.find(
      (slot) => Number(currentAnswer[slot.key]) === Number(cardId)
    );

    if (alreadySelected) {
      removeCard(currentItem.id, alreadySelected.key);
      return;
    }

    const emptySlot = SLOTS.find((slot) => currentAnswer[slot.key] == null);

    if (emptySlot) {
      assignCard(currentItem.id, emptySlot.key, cardId);
    }
  };

  const handleDragStart = (event, cardId) => {
    setDraggingCardId(cardId);
    event.dataTransfer.setData("text/plain", String(cardId));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event, field) => {
    event.preventDefault();
    setActiveDropSlot(null);

    if (!currentItem || !enabledRef.current) {
      return;
    }

    const cardId = Number(event.dataTransfer.getData("text/plain"));

    const exists = currentItem.cards?.some(
      (card) => Number(card.id) === cardId
    );

    if (exists) {
      assignCard(currentItem.id, field, cardId);
    }

    setDraggingCardId(null);
  };

  const handleNavigate = async (nextIndex) => {
    if (
      nextIndex < 0 ||
      nextIndex >= items.length ||
      submittingRef.current
    ) {
      return;
    }

    if (dirtyRef.current) {
      const saved = await saveNow();

      if (!saved || dirtyRef.current) {
        setErrorMessage(
          "Jawaban belum berhasil disimpan. Coba simpan lagi sebelum berpindah."
        );
        return;
      }
    }

    setCurrentIndex(nextIndex);
    setErrorMessage("");
  };

  /* =========================================================
     FINAL SUBMIT DENGAN PAYLOAD ANSWERS + LOGS
  ========================================================= */
  const handleSubmit = async (automatic = false) => {
    if (submittingRef.current) return;

    if (!automatic) {
      setShowSubmitModal(false);
    }

    submittingRef.current = true;
    setSubmitting(true);
    enabledRef.current = false;
    setErrorMessage("");

    try {
      if (savePromiseRef.current) {
        try {
          await savePromiseRef.current;
        } catch {
          // Lanjut submit
        }
      }

      const payload = {
        answers: toAnswerPayload(answersRef.current),
        logs: logsRef.current,
      };

      console.log("Payload Submit Diteruskan:", payload);

      const response = await api.post(
        `/student/cer-quizzes/${quizId}/attempt/submit`,
        payload
      );

      // Hapus penyimpanan temporary urutan kartu
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(`cer_cards_order_${quizId}_`)) {
          localStorage.removeItem(key);
        }
      });

      dirtyRef.current = false;
      setSaveStatus("saved");

      if (response.status === 200) {
        navigate(`/student/cer/${quizId}/review`, { replace: true });
      }
    } catch (error) {
      const status = error.response?.status;

      if (status === 409) {
        navigate(`/student/cer/${quizId}/review`, { replace: true });
      } else {
        enabledRef.current = true;
        setErrorMessage(
          error.response?.data?.message ??
            "Submit gagal. Periksa koneksi, lalu coba lagi."
        );
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      remainingSeconds !== 0 ||
      !attempt ||
      attempt.status !== "in_progress" ||
      autoSubmitTriggeredRef.current
    ) {
      return;
    }

    autoSubmitTriggeredRef.current = true;
    handleSubmit(true);
  }, [remainingSeconds, attempt?.status]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream-light p-6">
        <div className="flex flex-col items-center">
          <img
            src={logoImg}
            alt="Reka-CER Logo"
            className="h-14 w-14 animate-pulse object-contain rounded-2xl"
          />

          <div className="mt-5 flex items-center gap-2">
            <LoaderCircle size={18} className="animate-spin text-dark" />
            <span className="text-sm font-medium text-gray-500">
              Memuat aktivitas CER...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage && !quiz) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-cream-light p-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
          <h1 className="text-lg font-bold text-slate-900">
            Aktivitas tidak dapat dimuat
          </h1>
          <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !currentItem) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-cream-light p-6">
        <div className="max-w-lg rounded-2xl border border-cream-border bg-white p-6">
          <h1 className="font-bold text-slate-900">Belum ada triplet CER</h1>
          <p className="mt-2 text-sm text-slate-600">
            Aktivitas ini belum memiliki item untuk dikerjakan.
          </p>
        </div>
      </div>
    );
  }

  const isLowTime = remainingSeconds !== null && remainingSeconds <= 300;
  const isDeadlineReached = remainingSeconds === 0;

  return (
    <>
      <style>{`
        nav, header:not(.cer-header) {
          display: none !important;
        }

        @keyframes cer-card-enter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes cer-drop-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(139, 235, 0, 0);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(139, 235, 0, .25);
          }
        }

        .cer-card-enter {
          animation: cer-card-enter .22s ease-out both;
        }

        .cer-drop-active {
          animation: cer-drop-pulse 1s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .cer-card-enter,
          .cer-drop-active {
            animation: none !important;
          }

          .cer-motion {
            transition: none !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-cream-light pb-12 text-slate-900">
        <header className="cer-header sticky top-0 z-20 border-b border-cream-border bg-white backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold sm:text-lg">
                {quiz.title}
              </h1>
            </div>

            <div
              className={`shrink-0 rounded-xl border px-3 py-1.5 text-right ${
                isLowTime
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-gray-400 bg-white text-slate-800"
              }`}
            >
              <div className="flex items-center justify-end gap-2">
                <Clock3 className="h-4 w-4" />
                <span className="font-mono text-sm font-bold tabular-nums sm:text-base">
                  {remainingSeconds === null
                    ? "--:--:--"
                    : formatTime(remainingSeconds)}
                </span>
              </div>

              <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                {deadlineLabel
                  ? `Deadline ${deadlineLabel}`
                  : "Deadline belum diterima server"}
              </p>
            </div>
          </div>

          <div className="h-1 bg-cream-border">
            <div
              className="h-full bg-lime-brand transition-[width] duration-500"
              style={{
                width: `${
                  totalSlots ? (totalFilled / totalSlots) * 100 : 0
                }%`,
              }}
            />
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
                  Aktivitas bertahap
                </p>
                <h2 className="text-xl font-extrabold sm:text-2xl">
                  Rekonstruksi CER
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-expanded={isSidebarOpen}
                  aria-controls="student-cer-summary-sidebar"
                  className="inline-flex items-center gap-2 rounded-xl border border-cream-border bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-lime-brand hover:shadow-md sm:text-sm"
                >
                  <PanelRightOpen className="h-4 w-4 text-[#5C8C00]" />
                  Ringkasan
                </button>

                <button
                  type="button"
                  onClick={() => setShowMaterialModal(true)}
                  disabled={!quiz.material}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-cream-border bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-lime-brand hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  <BookOpen className="h-4 w-4 text-violet-600" />
                  Lihat materi
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-cream-border bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold sm:text-base">
                    Pasangkan komponen CER
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Seret kartu ke slot atau ketuk kartu pilihan di bawah.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {currentFilled}/3 terisi
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {SLOTS.map((slot) => {
                  const selectedCard = getCard(currentAnswer[slot.key]);
                  const isActive = activeDropSlot === slot.key;

                  return (
                    <div
                      key={slot.key}
                      onDragEnter={(event) => {
                        event.preventDefault();
                        setActiveDropSlot(slot.key);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        setActiveDropSlot(slot.key);
                      }}
                      onDragLeave={(event) => {
                        if (
                          !event.currentTarget.contains(
                            event.relatedTarget
                          )
                        ) {
                          setActiveDropSlot(null);
                        }
                      }}
                      onDrop={(event) => handleDrop(event, slot.key)}
                      className={`cer-motion relative flex min-h-35 flex-col rounded-xl border-2 border-dashed p-3.5 transition-all duration-200 ease-out ${
                        isActive
                          ? "cer-drop-active scale-[1.01] border-lime-brand bg-[#F5FCE9]"
                          : selectedCard
                          ? `${slot.accent} border-solid`
                          : "border-cream-border bg-[#FCFBF6] hover:border-slate-300 hover:bg-white"
                      }`}
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

                      {selectedCard ? (
                        <div
                          key={selectedCard.id}
                          className="cer-card-enter flex flex-1 items-start gap-2.5 rounded-xl border border-white/80 bg-white p-3 shadow-sm"
                        >
                          <p className="flex-1 text-xs leading-5 text-slate-700">
                            {selectedCard.content}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeCard(currentItem.id, slot.key)
                            }
                            aria-label={`Hapus ${slot.label}`}
                            className="rounded-md p-1 text-slate-400 transition hover:rotate-90 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`flex flex-1 items-center justify-center rounded-xl border border-dashed px-3 py-4 text-center text-xs font-medium transition-colors ${
                            isActive
                              ? "border-lime-500 bg-white text-slate-800"
                              : "border-cream-border bg-white/60 text-slate-400"
                          }`}
                        >
                          {isActive
                            ? "Lepaskan kartu di sini"
                            : "Drop kartu di sini"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-cream-border bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold sm:text-base">
                    Pilihan kartu
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Tarik kartu ke slot CER atau klik kartu untuk memilihnya.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {shuffledCards.map((card, index) => {
                  const selectedSlot = SLOTS.find(
                    (slot) =>
                      Number(currentAnswer[slot.key]) === Number(card.id)
                  );

                  const isDragging =
                    Number(draggingCardId) === Number(card.id);

                  return (
                    <div
                      key={card.id}
                      draggable={!submitting && !isDeadlineReached}
                      onDragStart={(event) =>
                        handleDragStart(event, card.id)
                      }
                      onDragEnd={() => {
                        setDraggingCardId(null);
                        setActiveDropSlot(null);
                      }}
                      onClick={() => handleCardClick(card.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleCardClick(card.id);
                        }
                      }}
                      className={`cer-motion cer-card-enter group relative flex min-h-40 flex-col rounded-xl border p-3.5 text-left transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md cursor-grab active:cursor-grabbing ${
                        isDragging
                          ? "opacity-50 rotate-1 scale-95 border-lime-brand bg-[#F5FCE9] shadow-2xl"
                          : selectedSlot
                          ? "border-lime-brand bg-[#F5FCE9] shadow-sm"
                          : "border-cream-border bg-[#FCFBF6] hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="mb-2 flex w-full items-center justify-between gap-1">
                        <div className="flex items-center gap-1 text-slate-400">
                          <GripVertical className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wider">
                            Kartu {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        {selectedSlot ? (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${selectedSlot.textBadge}`}
                          >
                            {selectedSlot.label}
                          </span>
                        ) : (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 transition group-hover:bg-lime-brand group-hover:text-slate-900">
                            Pilih
                          </span>
                        )}
                      </div>

                      <p className="flex-1 whitespace-normal warp-break-word text-xs leading-5 text-slate-700">
                        {card.content}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 transition group-hover:text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-lime-brand" />
                        {selectedSlot ? "Klik untuk melepas" : "Geser kartu"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleNavigate(currentIndex - 1)}
                disabled={currentIndex === 0 || submitting}
                className="inline-flex items-center gap-2 rounded-xl border border-cream-border bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Sebelumnya
              </button>

              <div className="text-center">
                <p className="text-xs font-bold text-slate-800 sm:text-sm">
                  Triplet {currentIndex + 1} / {items.length}
                </p>
                <p className="text-[10px] text-slate-500 sm:text-xs">
                  {totalFilled}/{totalSlots} komponen terisi
                </p>
              </div>

              {currentIndex < items.length - 1 ? (
                <button
                  type="button"
                  onClick={() => handleNavigate(currentIndex + 1)}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50 sm:text-sm"
                >
                  Berikutnya
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={submitting || isDeadlineReached}
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-brand px-4 py-2.5 text-xs font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-lime-hover disabled:opacity-50 sm:text-sm"
                >
                  <Send className="h-4 w-4" />
                  Selesaikan
                </button>
              )}
            </div>
          </section>
        </div>
      </main>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar ringkasan"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px]"
        />
      )}

      <aside
        id="student-cer-summary-sidebar"
        aria-label="Ringkasan aktivitas"
        aria-hidden={!isSidebarOpen}
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(92vw,390px)] flex-col gap-3 overflow-y-auto border-l border-cream-border bg-cream-light p-4 shadow-2xl transition-transform duration-300 ease-out ${
          isSidebarOpen
            ? "translate-x-0"
            : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-cream-border bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">
              Reka-CER
            </p>
            <h2 className="text-base font-extrabold text-slate-900">
              Ringkasan aktivitas
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Tutup sidebar"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-2xl border border-cream-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold">Progres</h3>

            <span className="text-xs font-bold text-slate-500">
              {totalSlots
                ? Math.round((totalFilled / totalSlots) * 100)
                : 0}
              %
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-border">
            <div
              className="h-full rounded-full bg-lime-brand transition-[width] duration-500"
              style={{
                width: `${
                  totalSlots ? (totalFilled / totalSlots) * 100 : 0
                }%`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {items.map((item, index) => {
              const count = getFilledCount(answers[item.id]);
              const isCurrent = index === currentIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(index)}
                  disabled={submitting}
                  aria-label={`Buka triplet ${index + 1}`}
                  className={`flex h-9 items-center justify-center rounded-lg border text-xs font-extrabold transition hover:-translate-y-0.5 ${
                    isCurrent
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : count === 3
                      ? "border-[#CFE8A7] bg-[#F0F9E3] text-green-800"
                      : "border-cream-border bg-[#FCFBF6] text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {count === 3 && !isCurrent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] leading-5 text-slate-500">
            Hijau berarti semua slot terisi, bukan berarti jawaban benar.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowSubmitModal(true)}
          disabled={submitting || isDeadlineReached}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Selesaikan aktivitas
        </button>
      </aside>

      {showMaterialModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowMaterialModal(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="material-modal-title"
            className="cer-card-enter flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-cream-border bg-[#FCFBF6] px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-600">
                    Materi pembelajaran
                  </p>

                  <h2
                    id="material-modal-title"
                    className="mt-1 text-lg font-extrabold text-slate-900"
                  >
                    {quiz.material?.title ?? "Materi"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMaterialModal(false)}
                aria-label="Tutup materi"
                className="rounded-lg p-2 text-slate-500 transition hover:rotate-90 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                {quiz.material?.content || "Materi belum tersedia."}
              </p>
            </div>

            <div className="flex justify-end border-t border-cream-border px-5 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => setShowMaterialModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Kembali mengerjakan
              </button>
            </div>
          </section>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-title"
            className="cer-card-enter w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F9E3]">
              <Send className="h-5 w-5 text-green-800" />
            </div>

            <h2 id="submit-title" className="text-lg font-extrabold">
              Selesaikan aktivitas?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Kamu telah mengisi {totalFilled} dari {totalSlots} komponen.
              Setelah disubmit, jawaban tidak dapat diubah lagi.
            </p>

            {totalFilled < totalSlots && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Masih ada komponen yang belum terisi. Komponen kosong akan
                dinilai sebagai jawaban salah.
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="rounded-xl border border-cream-border px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-lime-brand px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-lime-hover disabled:opacity-60"
              >
                {submitting && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                {submitting ? "Mengirim..." : "Ya, submit"}
              </button>
            </div>
          </section>
        </div>
      )}

      {isDeadlineReached && submitting && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl bg-white p-5 shadow-xl">
            <LoaderCircle className="h-6 w-6 animate-spin text-slate-700" />
            <div>
              <p className="font-bold">Waktu pengerjaan habis</p>
              <p className="mt-1 text-sm text-slate-600">
                Memfinalisasi jawaban yang tersimpan...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}