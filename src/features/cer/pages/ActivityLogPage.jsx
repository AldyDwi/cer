import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../../services/api";
import echo from "../../../utils/echo";

function formatSeconds(seconds) {
  const sec = Number(seconds) || 0;
  if (sec < 60) return `${sec} dtk`;
  const mins = Math.floor(sec / 60);
  const remainingSec = sec % 60;
  return `${mins} mnt ${remainingSec} dtk`;
}

export default function ActivityLogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State untuk pencarian, filter kelas, dan pagination (sama seperti MaterialsPage)
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  /* =========================================================
     REACT QUERY DATA FETCHING
  ========================================================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cer-activity-logs", id],
    queryFn: async () => {
      const res = await api.get(`/cer-quizzes/${id}/logs`);
      return res.data;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 30, // 30 detik
  });

  /* =========================================================
     WEBSOCKET REAL-TIME LISTENER (LARAVEL REVERB)
     Memperbarui log ketika mahasiswa melakukan autosave / submit
  ========================================================= */
  useEffect(() => {
    const channel = echo.channel("cer-activities");

    channel.listen(".activity.updated", () => {
      queryClient.invalidateQueries({ queryKey: ["cer-activity-logs", id] });
    });

    channel.listen(".attempt.submitted", () => {
      queryClient.invalidateQueries({ queryKey: ["cer-activity-logs", id] });
    });

    return () => {
      echo.leaveChannel("cer-activities");
    };
  }, [id, queryClient]);

  const quiz = data?.quiz;
  const rawLogs = useMemo(() => data?.logs || [], [data]);

  // Mengambil daftar kelas unik untuk dropdown filter
  const classes = useMemo(() => {
    return [
      ...new Set(rawLogs.map((l) => l.student?.class_name).filter(Boolean)),
    ].sort();
  }, [rawLogs]);

  /* =========================================================
     CLIENT-SIDE INSTANT SEARCH & FILTER KELAS
  ========================================================= */
  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rawLogs.filter((log) => {
      const student = log.student;
      const matchesSearch =
        !keyword ||
        student?.name?.toLowerCase().includes(keyword) ||
        student?.username?.toLowerCase().includes(keyword);

      const matchesClass =
        !classFilter || student?.class_name === classFilter;

      return matchesSearch && matchesClass;
    });
  }, [rawLogs, search, classFilter]);

  /* =========================================================
     CLIENT-SIDE PAGINATION (Sama seperti MaterialsPage)
  ========================================================= */
  const lastPage = Math.max(1, Math.ceil(filteredLogs.length / perPage));

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredLogs.slice(start, start + perPage);
  }, [filteredLogs, currentPage, perPage]);

  // Reset ke halaman 1 jika kata kunci pencarian, filter kelas, atau perPage berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, classFilter, perPage]);

  // Menjaga agar currentPage tidak melebihi lastPage
  useEffect(() => {
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [currentPage, lastPage]);

  /* =========================================================
     HANDLERS
  ========================================================= */
  function handlePerPageChange(event) {
    setPerPage(Number(event.target.value));
  }

  function handlePageChange(page) {
    if (page < 1 || page > lastPage) return;
    setCurrentPage(page);
  }

  return (
    <div className="min-h-full space-y-6 bg-cream-light/40 p-5 sm:p-7 lg:p-8">
      {/* HEADER */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`/teacher/cer/${id}`)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-dark"
        >
          <ArrowLeft size={17} />
          Kembali ke Aktivitas CER
        </button>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-dark">
              Log Aktivitas
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Detail rekam jejak interaksi mahasiswa (drag-and-drop, perubahan kartu, dan aktivitas membaca materi)
          </p>
        </div>
      </div>

      {/* ERROR STATE */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error?.response?.data?.message || "Gagal mengambil data log aktivitas."}
        </div>
      )}

      {/* TOOLBAR & FILTER BAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Per Page & Total */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Tampilkan</span>
            <div className="relative">
              <select
                value={perPage}
                onChange={handlePerPageChange}
                className="w-16.5 appearance-none rounded-xl border border-cream-border bg-white py-2 pl-3 pr-8 text-sm font-medium text-dark outline-none transition focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown
                size={15}
                strokeWidth={2}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
            <span className="text-sm text-gray-500">data</span>
          </div>
        </div>

        {/* Right: Class Filter & Search */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Class Filter */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-cream-border bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-dark outline-none transition focus:border-lime-brand sm:w-40"
            >
              <option value="">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari mahasiswa..."
              className="w-full rounded-xl border border-cream-border bg-white py-2.5 pl-10 pr-4 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
            />
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="overflow-hidden rounded-2xl border border-cream-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-300 text-left text-xs text-slate-700 border-collapse">
            <thead className="border-b border-cream-border bg-[#FCFBF6] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th rowSpan={2} className="px-4 py-3 border-r border-cream-border text-center w-12">
                  No
                </th>
                <th rowSpan={2} className="px-4 py-3 border-r border-cream-border min-w-48">
                  Mahasiswa
                </th>
                <th rowSpan={2} className="px-4 py-3 border-r border-cream-border">
                  Kelas
                </th>
                
                {/* Group Place */}
                <th colSpan={3} className="px-3 py-2 border-r border-cream-border text-center bg-violet-50/60 text-violet-800">
                  Place (Pasang)
                </th>

                {/* Group Delete */}
                <th colSpan={3} className="px-3 py-2 border-r border-cream-border text-center bg-rose-50/60 text-rose-800">
                  Delete (Hapus)
                </th>

                {/* Group Replace */}
                <th colSpan={3} className="px-3 py-2 border-r border-cream-border text-center bg-amber-50/60 text-amber-800">
                  Replace (Ganti)
                </th>

                {/* Group Material */}
                <th colSpan={2} className="px-3 py-2 text-center bg-sky-50/60 text-sky-800">
                  Aktivitas Materi
                </th>
              </tr>
              <tr className="border-t border-cream-border">
                {/* Place Sub */}
                <th className="px-2.5 py-2 text-center border-r border-cream-border bg-violet-50/30">Claim</th>
                <th className="px-2.5 py-2 text-center border-r border-cream-border bg-violet-50/30">Evidence</th>
                <th className="px-2.5 py-2 text-center border-r border-cream-border bg-violet-50/30">Reasoning</th>

                {/* Delete Sub */}
                <th className="px-2.5 py-2 text-center border-r border-cream-border bg-rose-50/30">Claim</th>
                <th className="px-2.5 py-2 text-center border-r border-cream-border bg-rose-50/30">Evidence</th>
                <th className="px-2.5 py-2 text-center border-r border-cream-border bg-rose-50/30">Reasoning</th>

                {/* Replace Sub */}
                <th className="px-2.5 py-2 text-center border-r border-cream-border bg-amber-50/30">Claim</th>
                <th className="px-2.5 py-2 text-center border-r border-cream-border bg-amber-50/30">Evidence</th>
                <th className="px-2.5 py-2 text-center border-r border-cream-border bg-amber-50/30">Reasoning</th>

                {/* Material Sub */}
                <th className="px-3 py-2 text-center border-r border-cream-border bg-sky-50/30">Count</th>
                <th className="px-3 py-2 text-center bg-sky-50/30">Total Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-cream-border font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-slate-400">
                    Memuat log pengerjaan mahasiswa...
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-slate-400">
                    Belum ada data log aktivitas mahasiswa.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, index) => {
                  const globalIndex = (currentPage - 1) * perPage + index + 1;
                  return (
                    <tr key={log.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3 border-r border-cream-border text-center text-slate-500">
                        {globalIndex}
                      </td>
                      <td className="px-4 py-3 border-r border-cream-border">
                        <p className="font-bold text-slate-900">{log.student?.name || "-"}</p>
                        <p className="text-[10px] text-slate-400">{log.student?.username || "-"}</p>
                      </td>
                      <td className="px-4 py-3 border-r border-cream-border">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                          {log.student?.class_name || "-"}
                        </span>
                      </td>

                      {/* Place Values */}
                      <td className="px-2.5 py-3 border-r border-cream-border text-center text-violet-900 bg-violet-50/10 font-bold">
                        {log.place_claim}
                      </td>
                      <td className="px-2.5 py-3 border-r border-cream-border text-center text-violet-900 bg-violet-50/10 font-bold">
                        {log.place_evidence}
                      </td>
                      <td className="px-2.5 py-3 border-r border-cream-border text-center text-violet-900 bg-violet-50/10 font-bold">
                        {log.place_reasoning}
                      </td>

                      {/* Delete Values */}
                      <td className="px-2.5 py-3 border-r border-cream-border text-center text-rose-900 bg-rose-50/10 font-bold">
                        {log.delete_claim}
                      </td>
                      <td className="px-2.5 py-3 border-r border-cream-border text-center text-rose-900 bg-rose-50/10 font-bold">
                        {log.delete_evidence}
                      </td>
                      <td className="px-2.5 py-3 border-r border-cream-border text-center text-rose-900 bg-rose-50/10 font-bold">
                        {log.delete_reasoning}
                      </td>

                      {/* Replace Values */}
                      <td className="px-2.5 py-3 border-r border-cream-border text-center text-amber-900 bg-amber-50/10 font-bold">
                        {log.replace_claim}
                      </td>
                      <td className="px-2.5 py-3 border-r border-cream-border text-center text-amber-900 bg-amber-50/10 font-bold">
                        {log.replace_evidence}
                      </td>
                      <td className="px-2.5 py-3 border-r border-cream-border text-center text-amber-900 bg-amber-50/10 font-bold">
                        {log.replace_reasoning}
                      </td>

                      {/* Material Values */}
                      <td className="px-3 py-3 border-r border-cream-border text-center font-bold text-sky-900 bg-sky-50/10">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen size={12} className="text-sky-600" />
                          {log.read_material_count} kali
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-sky-900 bg-sky-50/10">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} className="text-sky-600" />
                          {formatSeconds(log.read_material_time)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTAINER (Sama seperti MaterialsPage) */}
      {!isLoading && filteredLogs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={filteredLogs.length}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

/* =============================================
   PAGINATION COMPONENT
============================================= */
function Pagination({ currentPage, lastPage, total, onPageChange }) {
  if (lastPage <= 1) {
    return (
      <div className="flex justify-center text-xs text-gray-400">
        Total {total} mahasiswa
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Halaman sebelumnya"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-cream-border bg-white text-gray-500 transition hover:bg-cream-light hover:text-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers(currentPage, lastPage).map((page, index) =>
          page === "..." ? (
            <span
              key={`dots-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-medium transition ${
                page === currentPage
                  ? "bg-lime-brand text-dark font-bold"
                  : "text-gray-500 hover:bg-cream-light hover:text-dark"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Halaman selanjutnya"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-cream-border bg-white text-gray-500 transition hover:bg-cream-light hover:text-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function getPageNumbers(currentPage, lastPage) {
  if (lastPage <= 5) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", lastPage];
  }

  if (currentPage >= lastPage - 2) {
    return [
      1,
      "...",
      lastPage - 3,
      lastPage - 2,
      lastPage - 1,
      lastPage,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    lastPage,
  ];
}