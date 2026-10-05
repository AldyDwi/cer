import { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../services/materialService";

import MaterialFormModal from "../components/MaterialFormModal";
import MaterialDetailModal from "../components/MaterialDetailModal";
import DeleteMaterialModal from "../components/DeleteMaterialModal";

function MaterialsPage() {
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const [modal, setModal] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  async function loadMaterials() {
    try {
      setLoading(true);
      setError("");

      const response = await getMaterials({
        search,
        perPage,
        page: currentPage,
      });

      setMaterials(response.data);

      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data materi."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, [search, perPage, currentPage]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    setCurrentPage(1);
    setSearch(searchInput.trim());
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
    setSelectedMaterial(null);
    setModal("create");
  }

  function openEdit(material) {
    setSelectedMaterial(material);
    setModal("edit");
  }

  function openDetail(material) {
    setSelectedMaterial(material);
    setModal("detail");
  }

  function openDelete(material) {
    setSelectedMaterial(material);
    setModal("delete");
  }

  function closeModal() {
    setModal(null);
    setSelectedMaterial(null);
  }

  async function handleCreate(data) {
    await createMaterial(data);

    setCurrentPage(1);
    setSearch("");
    setSearchInput("");

    await loadMaterials();
    closeModal();
  }

  async function handleUpdate(data) {
    await updateMaterial(selectedMaterial.id, data);

    await loadMaterials();
    closeModal();
  }

  async function handleDelete() {
    await deleteMaterial(selectedMaterial.id);

    // Kalau data terakhir di halaman terhapus,
    // kembali ke halaman sebelumnya.
    if (materials.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      await loadMaterials();
    }

    closeModal();
  }

  return (
    <div className="space-y-6">
      {/* =========================================
          HEADER
      ========================================== */}
      <div>
        <h1 className="text-2xl font-bold text-dark">
          Kelola Materi
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Kelola materi pembelajaran yang digunakan dalam aktivitas CER.
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
        Tambah Materi
      </button>

      {/* =========================================
          TOOLBAR
      ========================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Per Page */}
        <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
            Tampilkan
        </span>

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

        <span className="text-sm text-gray-500">
            data
        </span>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full sm:w-auto"
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
              placeholder="Cari materi..."
              className="w-full rounded-xl border border-cream-border bg-white py-2.5 pl-10 pr-4 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
            />
          </div>
        </form>
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
          MATERIAL GRID
      ========================================== */}
      {loading ? (
        <MaterialLoading />
      ) : materials.length === 0 ? (
        <EmptyMaterials search={search} onCreate={openCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {materials.map((material, index) => (
            <MaterialCard
              key={material.id}
              material={material}
              index={index}
              onDetail={() => openDetail(material)}
              onEdit={() => openEdit(material)}
              onDelete={() => openDelete(material)}
            />
          ))}
        </div>
      )}

      {/* =========================================
          PAGINATION
      ========================================== */}
      {!loading && materials.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}

      {/* =========================================
          CREATE MODAL
      ========================================== */}
      {modal === "create" && (
        <MaterialFormModal
          mode="create"
          onClose={closeModal}
          onSubmit={handleCreate}
        />
      )}

      {/* =========================================
          EDIT MODAL
      ========================================== */}
      {modal === "edit" && selectedMaterial && (
        <MaterialFormModal
          mode="edit"
          material={selectedMaterial}
          onClose={closeModal}
          onSubmit={handleUpdate}
        />
      )}

      {/* =========================================
          DETAIL MODAL
      ========================================== */}
      {modal === "detail" && selectedMaterial && (
        <MaterialDetailModal
          material={selectedMaterial}
          onClose={closeModal}
        />
      )}

      {/* =========================================
          DELETE MODAL
      ========================================== */}
      {modal === "delete" && selectedMaterial && (
        <DeleteMaterialModal
          material={selectedMaterial}
          onClose={closeModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* =============================================
   MATERIAL CARD
============================================= */

function MaterialCard({
  material,
  index,
  onDetail,
  onEdit,
  onDelete,
}) {
  const iconStyles = [
    "bg-lime-brand text-dark",
    "bg-violet-100 text-violet-600",
    "bg-sky-100 text-sky-600",
    "bg-orange-100 text-orange-600",
    "bg-pink-100 text-pink-600",
  ];

  const iconStyle = iconStyles[index % iconStyles.length];

  return (
    <article className="group flex min-h-75 flex-col rounded-3xl border border-cream-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Icon */}
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-full ${iconStyle}`}>
        <BookOpen size={20} />
      </div>

      {/* Title */}
      <div>
        <h2 className="text-base font-bold leading-6 text-dark">
          {material.title}
        </h2>
      </div>

      {/* Content */}
      <div className="mt-3 flex-1">
        <p className="line-clamp-4 text-sm leading-6 text-gray-500">
          {getContentPreview(material.content)}
        </p>
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-cream-border" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">
          Materi
        </span>

        <div className="flex items-center gap-1">
          <CardActionButton
            icon={<Eye size={17} />}
            label="Detail"
            onClick={onDetail}
          />

          <CardActionButton
            icon={<Pencil size={17} />}
            label="Ubah"
            onClick={onEdit}
          />

          <CardActionButton
            icon={<Trash2 size={17} />}
            label="Hapus"
            danger
            onClick={onDelete}
          />
        </div>
      </div>
    </article>
  );
}

/* =============================================
   CONTENT PREVIEW
============================================= */

function getContentPreview(content) {
  const text = content?.replace(/\s+/g, " ").trim() || "";

  if (!text) {
    return "...";
  }

  const sentenceMatch = text.match(/^(.+?[.!?])(?:\s|$)/);

  if (sentenceMatch) {
    return `${sentenceMatch[1]} ...`;
  }

  return `${text} ...`;
}

/* =============================================
   ACTION BUTTON
============================================= */

function CardActionButton({
  icon,
  label,
  danger = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-500 hover:bg-cream-light hover:text-dark"
      }`}
    >
      {icon}
    </button>
  );
}

/* =============================================
   LOADING
============================================= */

function MaterialLoading() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-75 animate-pulse rounded-3xl border border-cream-border bg-white p-5"
        >
          <div className="h-11 w-11 rounded-full bg-gray-100" />

          <div className="mt-5 h-5 w-3/4 rounded bg-gray-100" />

          <div className="mt-4 space-y-2">
            <div className="h-3 rounded bg-gray-100" />
            <div className="h-3 rounded bg-gray-100" />
            <div className="h-3 w-2/3 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =============================================
   EMPTY STATE
============================================= */

function EmptyMaterials({ search, onCreate }) {
  return (
    <div className="rounded-3xl border border-cream-border bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-light text-gray-400">
        <BookOpen size={25} />
      </div>

      <h2 className="mt-4 text-base font-bold text-dark">
        {search ? "Materi tidak ditemukan" : "Belum ada materi"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
        {search
          ? `Tidak ada materi yang cocok dengan pencarian "${search}".`
          : "Tambahkan materi pertama untuk digunakan dalam aktivitas CER."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark/90"
        >
          <Plus size={18} />
          Tambah Materi
        </button>
      )}
    </div>
  );
}

/* =============================================
   PAGINATION
============================================= */

function Pagination({
  currentPage,
  lastPage,
  total,
  onPageChange,
}) {
  if (lastPage <= 1) {
    return (
      <div className="flex justify-center text-xs text-gray-400">
        {total} materi
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      {/* Previous */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Halaman sebelumnya"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-cream-border bg-white text-gray-500 transition hover:bg-cream-light hover:text-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
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

      {/* Next */}
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
    return Array.from(
      { length: lastPage },
      (_, index) => index + 1
    );
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

export default MaterialsPage;