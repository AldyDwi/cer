import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Search,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";

import { getPublishedStudentActivities } from "../../cer/services/cerService";

function ActivitySkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-cream-border bg-white p-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
          </div>

          <div className="mb-3 h-5 w-3/4 animate-pulse rounded-lg bg-gray-100" />
          <div className="mb-2 h-4 w-full animate-pulse rounded-lg bg-gray-100" />
          <div className="mb-6 h-4 w-2/3 animate-pulse rounded-lg bg-gray-100" />

          <div className="mb-5 h-4 w-1/2 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudentActivitiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Menggunakan React Query untuk mengambil daftar aktivitas
  const {
    data: activitiesData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["student-published-activities"],
    queryFn: getPublishedStudentActivities,
    select: (response) => (Array.isArray(response?.data) ? response.data : []),
    refetchInterval: 5000, 
    refetchOnWindowFocus: true,
  });

  const activities = activitiesData || [];
  const errorMessage =
    queryError?.response?.data?.message ||
    queryError?.message ||
    (queryError ? "Gagal memuat daftar aktivitas CER." : "");

  const keyword = search.trim().toLowerCase();

  const filteredActivities = activities.filter((activity) => {
    return (
      activity.title?.toLowerCase().includes(keyword) ||
      activity.teacher?.name?.toLowerCase().includes(keyword) ||
      activity.material?.title?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-7 sm:py-10 lg:px-8">
        {/* Heading */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50 px-3 py-1.5 text-xs font-semibold text-dark">
              <BookOpen size={14} />
              Ruang Belajar
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-dark sm:text-3xl">
              Aktivitas CER
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Pilih aktivitas yang tersedia dan susun komponen Claim, Evidence,
              dan Reasoning untuk melatih pemahamanmu.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-cream-border bg-white px-4 py-3 text-sm text-gray-500 md:self-auto">
            <ClipboardCheck size={17} className="text-violet-500" />
            <span>
              <strong className="text-dark">
                {activities.filter((item) => item.completed).length}
              </strong>{" "}
              aktivitas selesai
            </span>
          </div>
        </div>

        {/* Search and count */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {isLoading
              ? "Memuat aktivitas..."
              : `${filteredActivities.length} aktivitas tersedia`}
          </p>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari aktivitas..."
              className="w-full rounded-xl border border-cream-border bg-white py-2.5 pl-10 pr-4 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand"
            />
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => refetch()}
              className="ml-2 font-semibold underline hover:text-red-700"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Activity cards */}
        {isLoading ? (
          <ActivitySkeleton />
        ) : filteredActivities.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredActivities.map((activity) => (
              <article
                key={activity.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-cream-border bg-white transition duration-200 hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-md"
              >
                <div className="h-1.5 bg-lime-brand" />

                <div className="flex flex-1 flex-col p-5">
                  {/* Icon and completion status */}
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-brand text-dark">
                      <BookOpen size={21} />
                    </div>

                    {activity.completed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={14} />
                        Selesai
                      </span>
                    ) : (
                      <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                        Belum dikerjakan
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="mb-2 line-clamp-2 text-lg font-bold leading-6 text-dark">
                    {activity.title}
                  </h2>

                  <p className="mb-5 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                    {activity.description ||
                      "Aktivitas rekonstruksi Claim, Evidence, and Reasoning."}
                  </p>

                  {/* Teacher */}
                  <div className="mb-3 flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <GraduationCap size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Dosen pengampu</p>

                      <p className="truncate font-medium text-dark">
                        {activity.teacher?.name || "Dosen"}
                      </p>
                    </div>
                  </div>

                  {/* Material */}
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen size={15} className="shrink-0" />

                    <span className="truncate">
                      {activity.material?.title || "Materi pembelajaran"}
                    </span>
                  </div>

                  <div className="mb-5 flex items-center gap-2 border-t border-cream-border pt-4 text-sm text-gray-500">
                    <Clock3 size={16} />

                    <span>Durasi {activity.duration_minutes} menit</span>
                  </div>

                  {/* Score */}
                  {activity.completed && (
                    <div className="mb-4 flex items-center justify-between rounded-xl bg-cream-light px-4 py-3">
                      <span className="text-sm text-gray-600">
                        Nilai terakhir
                      </span>

                      <span className="text-lg font-bold text-dark">
                        {activity.score ?? "-"}
                      </span>
                    </div>
                  )}

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() => {
                      if (activity.completed) {
                        navigate(`/student/cer/${activity.id}/review`);
                      } else {
                        navigate(`/student/cer/${activity.id}/attempt`);
                      }
                    }}
                    className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      activity.completed
                        ? "border border-cream-border bg-white text-dark hover:bg-cream-light"
                        : "bg-lime-brand text-dark hover:bg-lime-hover"
                    }`}
                  >
                    {activity.completed ? "Review" : "Kerjakan"}
                    <ArrowRight size={16} />
                  </button>

                  {activity.completed && activity.completed_at && (
                    <p className="mt-3 text-center text-xs text-gray-400">
                      Selesai pada {formatDate(activity.completed_at)}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-cream-border bg-white px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-light">
              <BookOpen size={25} className="text-gray-400" />
            </div>

            <h2 className="text-base font-bold text-dark">
              {search
                ? "Aktivitas tidak ditemukan"
                : "Belum ada aktivitas CER"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {search
                ? "Coba gunakan kata kunci lain."
                : "Aktivitas akan muncul di sini setelah dosen memublikasikannya."}
            </p>
          </div>
        )}

        {/* Indikator background refetching */}
        {isFetching && !isLoading && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Memperbarui data aktivitas...
          </p>
        )}
      </div>
    </div>
  );
}