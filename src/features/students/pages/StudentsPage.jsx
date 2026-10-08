import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/studentService";

import StudentFormModal from "../components/StudentFormModal";
import DeleteStudentModal from "../components/DeleteStudentModal";

function StudentsPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [className, setClassName] = useState("");

  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  /* =========================================================
     REACT QUERY DATA FETCHING
  ========================================================= */

  const {
    data: studentsData,
    isLoading: loading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["students", search, className, perPage, currentPage],
    queryFn: () =>
      getStudents({
        search,
        className,
        perPage,
        page: currentPage,
      }),
    staleTime: 1000 * 60 * 5, // Cache data selama 5 menit
  });

  const students = studentsData?.data || [];
  const classes = studentsData?.classes || [];

  const pagination = {
    currentPage: studentsData?.current_page || 1,
    lastPage: studentsData?.last_page || 1,
    total: studentsData?.total || 0,
  };

  const error =
    isError &&
    (queryError?.response?.data?.message ||
      "Gagal mengambil data student.");

  /* =========================================================
     MUTATIONS (CREATE / UPDATE / DELETE)
  ========================================================= */

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setCurrentPage(1);
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      if (students.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      }
      closeModal();
    },
  });

  /* =========================================================
     HANDLERS
  ========================================================= */

  function handleSearchSubmit(event) {
    event.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  }

  function handleClassChange(event) {
    setClassName(event.target.value);
    setCurrentPage(1);
  }

  function handlePerPageChange(event) {
    setPerPage(Number(event.target.value));
    setCurrentPage(1);
  }

  function handlePageChange(page) {
    if (page < 1 || page > pagination.lastPage) {
      return;
    }
    setCurrentPage(page);
  }

  function openCreate() {
    setSelectedStudent(null);
    setModal("create");
  }

  function openEdit(student) {
    setSelectedStudent(student);
    setModal("edit");
  }

  function openDelete(student) {
    setSelectedStudent(student);
    setModal("delete");
  }

  function closeModal() {
    setModal(null);
    setSelectedStudent(null);
  }

  function handleCreate(data) {
    return createMutation.mutateAsync(data);
  }

  function handleUpdate(data) {
    return updateMutation.mutateAsync({
      id: selectedStudent.id,
      data,
    });
  }

  function handleDelete() {
    return deleteMutation.mutateAsync(selectedStudent.id);
  }

  return (
    <div className="space-y-6">
      {/* =========================================
          HEADER
      ========================================== */}
      <div>
        <h1 className="text-2xl font-bold text-dark">
          Kelola Mahasiswa
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Kelola data mahasiswa yang dapat mengikuti aktivitas CER.
        </p>
      </div>

      {/* =========================================
          ADD BUTTON
      ========================================== */}
      <button
        type="button"
        onClick={openCreate}
        className="flex items-center gap-2 rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark/90"
      >
        <Plus size={18} />
        Tambah Mahasiswa
      </button>

      {/* =========================================
          TOOLBAR
      ========================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Per Page */}
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

        {/* Filter + Search */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {/* Class Filter */}
          <div className="relative">
            <select
              value={className}
              onChange={handleClassChange}
              className="w-full appearance-none rounded-xl border border-cream-border bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-dark outline-none transition focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20 sm:w-40"
            >
              <option value="">Semua Kelas</option>

              {classes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown
              size={15}
              strokeWidth={2}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>

          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full sm:w-auto"
          >
            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Cari mahasiswa..."
                className="w-full rounded-xl border border-cream-border bg-white py-2.5 pl-10 pr-4 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
              />
            </div>
          </form>
        </div>
      </div>

      {/* =========================================
          ERROR
      ========================================== */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =========================================
          TABLE
      ========================================== */}
      <div className="overflow-hidden rounded-2xl border border-cream-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5">
            <thead>
              <tr className="border-b border-cream-border bg-white">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400">
                  Nama
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400">
                  Username
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400">
                  Akun / Email
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400">
                  Kelas
                </th>

                <th className="w-30 px-5 py-3.5 text-center text-xs font-semibold text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <StudentTableLoading />
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cream-light text-gray-400">
                      <Users size={22} />
                    </div>

                    <p className="mt-3 text-sm font-medium text-dark">
                      Student tidak ditemukan
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Belum ada data student yang sesuai.
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    onEdit={() => openEdit(student)}
                    onDelete={() => openDelete(student)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          PAGINATION
      ========================================== */}
      {!loading && students.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}

      {/* =========================================
          CREATE
      ========================================== */}
      {modal === "create" && (
        <StudentFormModal
          mode="create"
          onClose={closeModal}
          onSubmit={handleCreate}
        />
      )}

      {/* =========================================
          EDIT
      ========================================== */}
      {modal === "edit" && selectedStudent && (
        <StudentFormModal
          mode="edit"
          student={selectedStudent}
          onClose={closeModal}
          onSubmit={handleUpdate}
        />
      )}

      {/* =========================================
          DELETE
      ========================================== */}
      {modal === "delete" && selectedStudent && (
        <DeleteStudentModal
          student={selectedStudent}
          onClose={closeModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* =============================================
   TABLE ROW
============================================= */

function StudentRow({ student, onEdit, onDelete }) {
  return (
    <tr className="border-b border-cream-border transition last:border-b-0 hover:bg-cream-light/40">
      {/* Nama */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <StudentAvatar name={student.name} />

          <p className="text-sm font-semibold text-dark">
            {student.name}
          </p>
        </div>
      </td>

      {/* Username */}
      <td className="px-5 py-3.5">
        <p className="text-sm text-gray-500">{student.username}</p>
      </td>

      {/* Email */}
      <td className="px-5 py-3.5">
        <p className="text-sm text-gray-500">{student.email}</p>
      </td>

      {/* Kelas */}
      <td className="px-5 py-3.5">
        <ClassBadge className={student.class_name} />
      </td>

      {/* Aksi */}
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-center gap-1">
          <ActionButton
            icon={<Pencil size={16} />}
            label="Ubah"
            onClick={onEdit}
          />

          <ActionButton
            icon={<Trash2 size={16} />}
            label="Hapus"
            danger
            onClick={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

/* =============================================
   STUDENT AVATAR
============================================= */

function StudentAvatar({ name }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  const colors = [
    "bg-lime-brand text-dark",
    "bg-violet-100 text-violet-600",
    "bg-sky-100 text-sky-600",
    "bg-orange-100 text-orange-600",
    "bg-pink-100 text-pink-600",
  ];

  const colorIndex =
    name
      ?.split("")
      .reduce(
        (total, character) => total + character.charCodeAt(0),
        0
      ) % colors.length;

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colors[colorIndex]}`}
    >
      {initial}
    </div>
  );
}

/* =============================================
   CLASS BADGE
============================================= */

function ClassBadge({ className }) {
  if (!className) {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
        -
      </span>
    );
  }

  const colors = [
    "bg-lime-brand text-dark",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-emerald-100 text-emerald-700",
  ];

  const colorIndex =
    className
      .split("")
      .reduce(
        (total, character) => total + character.charCodeAt(0),
        0
      ) % colors.length;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colors[colorIndex]}`}
    >
      {className}
    </span>
  );
}

/* =============================================
   ACTION BUTTON
============================================= */

function ActionButton({ icon, label, danger = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
        danger
          ? "text-red-400 hover:bg-red-50 hover:text-red-500"
          : "text-gray-400 hover:bg-cream-light hover:text-dark"
      }`}
    >
      {icon}
    </button>
  );
}

/* =============================================
   LOADING
============================================= */

function StudentTableLoading() {
  return (
    <tr>
      <td colSpan="5" className="px-5 py-12">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-10 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </td>
    </tr>
  );
}

/* =============================================
   PAGINATION
============================================= */

function Pagination({ currentPage, lastPage, total, onPageChange }) {
  if (lastPage <= 1) {
    return (
      <div className="flex justify-center text-xs text-gray-400">
        {total} mahasiswa
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
                  ? "bg-lime-brand text-dark"
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

export default StudentsPage;