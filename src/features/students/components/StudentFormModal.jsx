import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

function StudentFormModal({
  mode,
  student,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && student) {
      setName(student.name || "");
      setUsername(student.username || "");
      setEmail(student.email || "");
      setPassword("");
      setClassName(student.class_name || "");
    } else {
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setClassName("");
    }
  }, [isEdit, student]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!username.trim()) {
      setError("Username wajib diisi.");
      return;
    }

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (!isEdit && !password.trim()) {
      setError("Password wajib diisi.");
      return;
    }

    if (password && password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (!className.trim()) {
      setError("Kelas wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        class_name: className.trim(),
      };

      /*
       * Password hanya dikirim jika:
       * - tambah student
       * - atau update password
       */
      if (password.trim()) {
        data.password = password;
      }

      await onSubmit(data);
    } catch (err) {
      const errors = err.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];

        setError(
          firstError || "Data tidak valid."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Terjadi kesalahan."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cream-border px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-dark">
              {isEdit
                ? "Ubah Mahasiswa"
                : "Tambah Mahasiswa"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isEdit
                ? "Perbarui data mahasiswa."
                : "Tambahkan akun mahasiswa baru."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Nama */}
            <FormField
              label="Nama"
              value={name}
              onChange={setName}
              placeholder="Masukkan nama mahasiswa"
            />

            {/* Username */}
            <FormField
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="Masukkan username"
            />

            {/* Email */}
            <FormField
              label="Akun / Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="contoh@email.com"
            />

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">
                Password
                {isEdit && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    kosongkan jika tidak ingin mengubah
                  </span>
                )}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder={
                    isEdit
                      ? "Masukkan password baru"
                      : "Masukkan password"
                  }
                  className="w-full rounded-xl border border-cream-border bg-white px-4 py-3 pr-11 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-dark"
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Kelas */}
            <FormField
              label="Kelas"
              value={className}
              onChange={setClassName}
              placeholder="Contoh: TI-4A"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-cream-border px-6 py-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : isEdit
                  ? "Update"
                  : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-dark">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-cream-border bg-white px-4 py-3 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
      />
    </div>
  );
}

export default StudentFormModal;