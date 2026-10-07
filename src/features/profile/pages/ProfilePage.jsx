import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Save,
  User,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../../../contexts/AuthContext";

function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    class_name: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      class_name: user.class_name || "",
      password: "",
      password_confirmation: "",
    });
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    /*
     * Jika password kosong, kirim null.
     * Backend akan mempertahankan password lama.
     */
    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      class_name:
        user.role === "student"
          ? form.class_name.trim()
          : null,
      password: form.password
        ? form.password
        : null,
      password_confirmation:
        form.password_confirmation
          ? form.password_confirmation
          : null,
    };

    try {
      const response =
        await updateProfile(payload);

      setSuccess(
        response.message ||
          "Profil berhasil diperbarui."
      );

      /*
       * Kosongkan password setelah berhasil.
       */
      setForm((prev) => ({
        ...prev,
        password: "",
        password_confirmation: "",
      }));
    } catch (error) {
      console.error(error);

      const errors =
        error.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(
          errors
        )[0];

        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : "Data yang dimasukkan tidak valid."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Gagal memperbarui profil."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* =========================================
          HEADER
      ========================================== */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-dark lg:text-3xl">
          Profil
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Kelola informasi akun dan password Anda.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* =========================================
            PROFILE INFORMATION
        ========================================== */}
        <section className="overflow-hidden rounded-3xl border border-cream-border bg-white shadow-sm">
          <div className="border-b border-cream-border px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-brand text-dark">
                <UserCircle size={20} />
              </div>

              <div>
                <h2 className="text-base font-bold text-dark">
                  Informasi Profil
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Perbarui informasi akun Anda.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-7 lg:grid-cols-2">
            {/* Nama */}
            <InputField
              label="Nama"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama"
              icon={<User size={17} />}
            />

            {/* Username */}
            <InputField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              icon={<UserCircle size={17} />}
            />

            {/* Email */}
            <InputField
              label="Akun / Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contoh@email.com"
              icon={<Mail size={17} />}
            />

            {/* Kelas - student */}
            {user.role === "student" && (
              <InputField
                label="Kelas"
                name="class_name"
                value={form.class_name}
                onChange={handleChange}
                placeholder="Contoh: TI-4A"
                icon={<User size={17} />}
              />
            )}
          </div>
        </section>

        {/* =========================================
            PASSWORD
        ========================================== */}
        <section className="overflow-hidden rounded-3xl border border-cream-border bg-white shadow-sm">
          <div className="border-b border-cream-border px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <KeyRound size={20} />
              </div>

              <div>
                <h2 className="text-base font-bold text-dark">
                  Ubah Password
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Kosongkan kedua form jika tidak ingin
                  mengubah password.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-7 lg:grid-cols-2">
            {/* Password Baru */}
            <PasswordField
              label="Password Baru"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password baru"
              visible={showPassword}
              onToggle={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
            />

            {/* Konfirmasi */}
            <PasswordField
              label="Konfirmasi Password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Ulangi password baru"
              visible={showConfirmation}
              onToggle={() =>
                setShowConfirmation(
                  (prev) => !prev
                )
              }
            />
          </div>
        </section>

        {/* =========================================
            MESSAGE
        ========================================== */}
        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* =========================================
            SUBMIT
        ========================================== */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {loading
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-dark"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-cream-border bg-white pl-11 pr-4 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-dark"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <KeyRound size={17} />
        </span>

        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-cream-border bg-white px-11 pr-12 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/20"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-cream-light hover:text-dark"
          aria-label={
            visible
              ? "Sembunyikan password"
              : "Tampilkan password"
          }
        >
          {visible ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;