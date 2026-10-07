import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ClipboardList,
  Clock3,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getGradeRecap,
  getCerQuiz,
} from "../services/cerService";


/* =========================================================
   COLOR HELPERS
========================================================= */

const colorStyles = [
  "bg-lime-brand text-dark",
  "bg-violet-100 text-violet-600",
  "bg-sky-100 text-sky-600",
  "bg-orange-100 text-orange-600",
  "bg-pink-100 text-pink-600",
];

function getColorStyle(index) {
  return colorStyles[index % colorStyles.length];
}

function getClassColor(className) {
  if (!className) {
    return "bg-gray-100 text-gray-500";
  }

  const hash = className
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return colorStyles[hash % colorStyles.length];
}


/* =========================================================
   PAGE
========================================================= */

function GradeRecapPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);


  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    loadData();
  }, [id]);


  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [activityResponse, gradeResponse] = await Promise.all([
        getCerQuiz(id),
        getGradeRecap(id),
      ]);

      /*
       * Dibuat fleksibel untuk mengantisipasi:
       *
       * 1. service mengembalikan response.data
       * 2. service mengembalikan axios response langsung
       * 3. API membungkus data dengan { data: ... }
       */

      const activityData =
        activityResponse?.data?.data ??
        activityResponse?.data ??
        activityResponse;

      const gradeData =
        gradeResponse?.data?.data ??
        gradeResponse?.data ??
        gradeResponse;

      setActivity(activityData);

      setStudents(
        Array.isArray(gradeData)
          ? gradeData
          : []
      );

      setPage(1);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Gagal memuat rekap nilai."
      );
    } finally {
      setLoading(false);
    }
  }


  /* =========================================================
     CLASS OPTIONS
  ========================================================= */

  const classes = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.class_name)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !keyword ||
        student.name?.toLowerCase().includes(keyword) ||
        student.username?.toLowerCase().includes(keyword);

      const matchesClass =
        !classFilter ||
        student.class_name === classFilter;

      return matchesSearch && matchesClass;
    });
  }, [
    students,
    search,
    classFilter,
  ]);


  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / perPage)
  );

  const paginatedStudents = filteredStudents.slice(
    (page - 1) * perPage,
    page * perPage
  );


  useEffect(() => {
    setPage(1);
  }, [
    search,
    classFilter,
    perPage,
  ]);


  /*
   * Jika filter berubah dan halaman sebelumnya
   * lebih besar dari jumlah halaman baru.
   */
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [
    page,
    totalPages,
  ]);


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full bg-cream-light/40">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-7 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() =>
              navigate(`/teacher/cer/${id}`)
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-dark"
          >
            <ArrowLeft size={17} />

            Kembali ke Aktivitas CER
          </button>


          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-dark">
              Rekap Nilai
            </h1>

            <p className="text-sm text-gray-500">
              Lihat hasil pengerjaan mahasiswa pada aktivitas CER ini.
            </p>
          </div>

        </div>


        {/* =====================================================
            ACTIVITY INFO
        ===================================================== */}

        {loading ? (
          <ActivitySkeleton />
        ) : (
          activity && (
            <div className="mb-6 rounded-2xl border border-cream-border bg-white p-5 shadow-sm">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <div className="mb-1 flex items-center gap-2">

                    <ClipboardList
                      size={18}
                      className="shrink-0 text-violet-500"
                    />

                    <h2 className="truncate text-base font-bold text-dark">
                      {activity.title}
                    </h2>

                  </div>

                  <p className="text-sm text-gray-500">
                    Materi:{" "}
                    {activity.material?.title ?? "-"}
                  </p>

                </div>


                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                    activity.status === "published"
                      ? "bg-lime-brand text-dark"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {activity.status === "published"
                    ? "Published"
                    : "Draft"}
                </span>

              </div>

            </div>
          )
        )}


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}


        {/* =====================================================
            FILTER BAR
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* LEFT */}

          <div className="flex items-center gap-2 text-sm text-gray-500">

            <span>
              Tampilkan
            </span>


            <div className="relative">

              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                }}
                className="appearance-none rounded-xl border border-cream-border bg-white py-2 pl-3 pr-9 text-sm font-medium text-dark outline-none transition focus:border-lime-brand"
              >
                <option value={10}>
                  10
                </option>

                <option value={20}>
                  20
                </option>

                <option value={50}>
                  50
                </option>
              </select>


              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

            </div>


            <span>
              data
            </span>

          </div>


          {/* RIGHT */}

          <div className="flex flex-col gap-2 sm:flex-row">

            {/* CLASS FILTER */}

            <div className="relative">

              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                }}
                className="w-full appearance-none rounded-xl border border-cream-border bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-dark outline-none transition focus:border-lime-brand sm:w-auto"
              >

                <option value="">
                  Semua Kelas
                </option>

                {classes.map((className) => (
                  <option
                    key={className}
                    value={className}
                  >
                    {className}
                  </option>
                ))}

              </select>


              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

            </div>


            {/* SEARCH */}

            <div className="relative">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Cari mahasiswa..."
                className="w-full rounded-xl border border-cream-border bg-white py-2.5 pl-10 pr-4 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand sm:w-72"
              />

            </div>

          </div>

        </div>


        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="overflow-x-auto rounded-2xl border border-cream-border bg-white">

          <table className="w-full min-w-250 border-collapse">

            {/* TABLE HEADER */}

            <thead>

              <tr className="border-b border-cream-border bg-white">

                <th className="w-16 px-5 py-4 text-left text-sm font-semibold text-gray-600">
                  No
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                  Mahasiswa
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                  Username
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                  Kelas
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                  Nilai
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                  Durasi
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                  Selesai Pada
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>

              </tr>

            </thead>


            {/* TABLE BODY */}

            <tbody>

              {loading ? (
                <TableSkeleton />
              ) : paginatedStudents.length > 0 ? (

                paginatedStudents.map(
                  (student, index) => (
                    <GradeRow
                      key={student.id}
                      student={student}
                      index={
                        (page - 1) * perPage +
                        index +
                        1
                      }
                      colorIndex={index}
                    />
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center"
                  >

                    <div className="flex flex-col items-center justify-center">

                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">

                        <ClipboardList
                          size={22}
                          className="text-gray-400"
                        />

                      </div>

                      <p className="text-sm font-medium text-gray-600">
                        Tidak ada data rekap nilai
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Coba ubah pencarian atau filter kelas.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {!loading &&
          filteredStudents.length > 0 && (
            <div className="mt-5 flex items-center justify-between">

              {/* PREVIOUS */}

              <button
                type="button"
                disabled={page === 1}
                onClick={() => {
                  setPage(
                    (current) =>
                      current - 1
                  );
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-cream-border bg-white text-gray-500 transition hover:bg-cream-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>


              {/* PAGE NUMBERS */}

              <div className="flex items-center gap-1">

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((pageNumber) => (

                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() =>
                      setPage(pageNumber)
                    }
                    className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition ${
                      page === pageNumber
                        ? "bg-dark text-white"
                        : "text-gray-500 hover:bg-cream-light"
                    }`}
                  >
                    {pageNumber}
                  </button>

                ))}

              </div>


              {/* NEXT */}

              <button
                type="button"
                disabled={
                  page === totalPages
                }
                onClick={() => {
                  setPage(
                    (current) =>
                      current + 1
                  );
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-cream-border bg-white text-gray-500 transition hover:bg-cream-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>

            </div>
          )}

      </div>
    </div>
  );
}


/* =========================================================
   TABLE ROW
========================================================= */

function GradeRow({
  student,
  index,
  colorIndex,
}) {
  const initials =
    student.name
      ?.split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <tr className="border-b border-cream-border last:border-b-0 transition hover:bg-cream-light/40">

      {/* NO */}

      <td className="px-5 py-4 text-sm text-gray-500">
        {index}
      </td>


      {/* MAHASISWA */}

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getColorStyle(
              colorIndex
            )}`}
          >
            {initials}
          </div>


          <span className="text-sm font-semibold text-dark">
            {student.name || "-"}
          </span>

        </div>

      </td>


      {/* USERNAME */}

      <td className="px-5 py-4 text-sm text-gray-500">
        {student.username || "-"}
      </td>


      {/* KELAS */}

      <td className="px-5 py-4">

        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getClassColor(
            student.class_name
          )}`}
        >
          {student.class_name || "-"}
        </span>

      </td>


      {/* NILAI */}

      <td className="px-5 py-4">

        {student.score !== null &&
        student.score !== undefined ? (

          <span className="text-sm font-semibold text-dark">
            {student.score}
          </span>

        ) : (

          <span className="text-sm text-gray-400">
            -
          </span>

        )}

      </td>


      {/* DURASI */}

      <td className="px-5 py-4">

        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">

          <Clock3 size={14} />

          {student.duration_formatted || "-"}

        </span>

      </td>


      {/* SELESAI PADA */}

      <td className="px-5 py-4 text-sm text-gray-500">
        {formatCompletedAt(
          student.completed_at
        )}
      </td>


      {/* STATUS */}

      <td className="px-5 py-4">

        {student.status === "completed" ? (

          <span className="inline-flex rounded-full bg-lime-brand px-3 py-1 text-xs font-semibold text-dark">
            Selesai
          </span>

        ) : (

          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
            Belum Mengerjakan
          </span>

        )}

      </td>

    </tr>
  );
}


/* =========================================================
   ACTIVITY SKELETON
========================================================= */

function ActivitySkeleton() {
  return (
    <div className="mb-6 rounded-2xl border border-cream-border bg-white p-5 shadow-sm">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <div className="mb-2 flex items-center gap-2">

            <div className="h-5 w-5 animate-pulse rounded bg-gray-100" />

            <div className="h-5 w-48 animate-pulse rounded-lg bg-gray-100" />

          </div>

          <div className="h-4 w-64 animate-pulse rounded-lg bg-gray-100" />

        </div>


        <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />

      </div>

    </div>
  );
}


/* =========================================================
   TABLE SKELETON
========================================================= */

function TableSkeleton() {
  return (
    <>
      {Array.from({
        length: 6,
      }).map((_, rowIndex) => (

        <tr
          key={rowIndex}
          className="border-b border-cream-border last:border-b-0"
        >

          {/* NO */}

          <td className="px-5 py-5">

            <div className="h-4 w-5 animate-pulse rounded bg-gray-100" />

          </td>


          {/* MAHASISWA */}

          <td className="px-5 py-5">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-100" />

              <div className="h-4 w-32 animate-pulse rounded-lg bg-gray-100" />

            </div>

          </td>


          {/* USERNAME */}

          <td className="px-5 py-5">

            <div className="h-4 w-20 animate-pulse rounded-lg bg-gray-100" />

          </td>


          {/* KELAS */}

          <td className="px-5 py-5">

            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />

          </td>


          {/* NILAI */}

          <td className="px-5 py-5">

            <div className="h-4 w-8 animate-pulse rounded-lg bg-gray-100" />

          </td>


          {/* DURASI */}

          <td className="px-5 py-5">

            <div className="h-4 w-20 animate-pulse rounded-lg bg-gray-100" />

          </td>


          {/* SELESAI PADA */}

          <td className="px-5 py-5">

            <div className="h-4 w-32 animate-pulse rounded-lg bg-gray-100" />

          </td>


          {/* STATUS */}

          <td className="px-5 py-5">

            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />

          </td>

        </tr>

      ))}
    </>
  );
}


/* =========================================================
   DATE FORMATTER
========================================================= */

function formatCompletedAt(date) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString(
    "id-ID",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


export default GradeRecapPage;