import { useState } from "react";
import { X, FileSpreadsheet, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../../services/api";

export default function ImportUserModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Helper validasi tipe file
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    const isExtensionValid = /\.(xlsx|xls|csv)$/i.test(selectedFile.name);

    if (validTypes.includes(selectedFile.type) || isExtensionValid) {
      setFile(selectedFile);
    } else {
      toast.error("Format file harus berupa .xlsx, .xls, atau .csv");
    }
  };

  // Handler Event Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Pilih atau tarik file Excel terlebih dahulu!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      await api.post("/students/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Import data berhasil!");
      onSuccess();
      onClose();
    } catch (err) {
      const data = err.response?.data;
    
      if (err.response?.status === 422 && data?.errors) {
        toast.error(data.message);
      
        data.errors.slice(0, 3).forEach((msg) => toast.warn(msg));
      } else {
        toast.error(data?.message || "Gagal mengimport data.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-cream-border pb-4">
          <h3 className="text-lg font-bold text-dark">Import Data Pengguna</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Dropzone Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition duration-200 ${
              isDragging
                ? "border-lime-brand bg-lime-brand/10 scale-[1.01]"
                : file
                ? "border-emerald-400 bg-emerald-50/50"
                : "border-cream-border hover:bg-cream-light/30"
            }`}
          >
            {isDragging ? (
              <UploadCloud className="h-12 w-12 animate-bounce text-lime-brand" />
            ) : (
              <FileSpreadsheet
                className={`h-12 w-12 ${
                  file ? "text-emerald-500" : "text-lime-brand"
                }`}
              />
            )}

            <p className="mt-2 text-sm font-medium text-dark">
              {file ? (
                <span className="font-semibold text-emerald-700">
                  {file.name}
                </span>
              ) : (
                "Tarik & lepas file di sini, atau pilih manual"
              )}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Format yang didukung: .xlsx, .xls, .csv (Maks. 2MB)
            </p>

            {/* Input File Manual */}
            <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-dark px-4 py-2 text-xs font-semibold text-white transition hover:bg-dark/90">
              <span>{file ? "Ganti File" : "Pilih File"}</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => validateAndSetFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-xl border border-cream-border py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-cream-light"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="w-1/2 rounded-xl bg-dark py-2.5 text-sm font-semibold text-white transition hover:bg-dark/90 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}