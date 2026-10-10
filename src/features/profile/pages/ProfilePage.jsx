
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Save,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();

  const isStudent = user?.role === "student";

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    class_name: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setForm({
      name: user?.name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      class_name: user?.class_name ?? "",
    });
  }, [user]);

  const initial = (
    form.name || form.username || "M"
  ).charAt(0).toUpperCase();

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const response = await api.patch("/profile", {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
      });

      const updatedUser = response.data?.user ?? response.data;

      if (updatedUser && typeof updatedUser === "object") {
        setForm((previous) => ({
          ...previous,
          name: updatedUser.name ?? previous.name,
          username: updatedUser.username ?? previous.username,
          email: updatedUser.email ?? previous.email,
          class_name: updatedUser.class_name ?? previous.class_name,
        }));
      }

      await checkAuth();

      setProfileMessage("Profil berhasil diperbarui.");
    } catch (error) {
      const errors = error.response?.data?.errors;

      setProfileError(
        errors
          ? Object.values(errors).flat().join(" ")
          : error.response?.data?.message ||
              "Gagal memperbarui profil. Silakan coba lagi."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();

    setSavingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError("Konfirmasi password tidak sama.");
      setSavingPassword(false);
      return;
    }

    try {
      await api.patch("/profile/password", {
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      });

      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });

      setPasswordMessage("Password berhasil diperbarui.");
    } catch (error) {
      const errors = error.response?.data?.errors;

      setPasswordError(
        errors
          ? Object.values(errors).flat().join(" ")
          : error.response?.data?.message ||
              "Gagal mengganti password. Silakan coba lagi."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-cream-light/40">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-7 sm:py-10">

        {/* Header */}
        <button
          type="button"
          onClick={() => navigate("/student")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-dark"
        >
          <ArrowLeft size={17} />
          Kembali ke Home
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-dark sm:text-3xl">
            Profil Saya
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            Kelola informasi akun dan keamanan akun Reka-CER kamu.
          </p>
        </div>

        {/* Profile summary */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-cream-border bg-white">
          <div className="h-24 bg-linear-to-r from-lime-200 via-lime-300 to-lime-brand" />

          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-10 mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-violet-100 text-2xl font-bold text-violet-600 shadow-sm">
                {initial}
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-lime-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                <Check size={14} />
                Mahasiswa
              </span>
            </div>

            <h2 className="text-xl font-bold text-dark">
              {form.name || "Nama mahasiswa"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              @{form.username || "username"}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg bg-cream-light px-3 py-2 text-sm text-gray-600">
                <Mail size={15} />
                {form.email || "Email belum diisi"}
              </span>

              {isStudent && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-cream-light px-3 py-2 text-sm text-gray-600">
                  <UserRound size={15} />
                  Kelas {form.class_name || "-"}
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Edit profile */}
          <section className="rounded-2xl border border-cream-border bg-white p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-dark">
                <UserRound size={19} />
              </div>

              <div>
                <h2 className="font-bold text-dark">
                  Informasi Akun
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Perbarui informasi dasar akunmu.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Field
                label="Nama Lengkap"
                name="name"
                value={form.name}
                onChange={handleProfileChange}
                placeholder="Masukkan nama lengkap"
                required
              />

              <Field
                label="Username"
                name="username"
                value={form.username}
                onChange={handleProfileChange}
                placeholder="Masukkan username"
                required
              />

              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleProfileChange}
                placeholder="nama@email.com"
                required
              />

              {isStudent && (
                <Field
                  label="Kelas"
                  name="class_name"
                  value={form.class_name}
                  onChange={() => {}}
                  placeholder="Kelas mahasiswa"
                  disabled
                />
              )}

              {profileMessage && (
                <Feedback type="success" message={profileMessage} />
              )}

              {profileError && (
                <Feedback type="error" message={profileError} />
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-brand px-4 py-3 text-sm font-semibold text-dark transition hover:bg-lime-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}

                {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </section>

          {/* Change password */}
          <section className="rounded-2xl border border-cream-border bg-white p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <LockKeyhole size={19} />
              </div>

              <div>
                <h2 className="font-bold text-dark">
                  Keamanan Akun
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Ganti password untuk menjaga keamanan akun.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <PasswordField
                label="Password Saat Ini"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword((value) => !value)
                }
                required
              />

              <PasswordField
                label="Password Baru"
                name="password"
                value={passwordForm.password}
                onChange={handlePasswordChange}
                visible={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                required
              />

              <PasswordField
                label="Konfirmasi Password Baru"
                name="password_confirmation"
                value={passwordForm.password_confirmation}
                onChange={handlePasswordChange}
                visible={showConfirmation}
                onToggle={() =>
                  setShowConfirmation((value) => !value)
                }
                required
              />

              <p className="text-xs leading-5 text-gray-400">
                Gunakan password yang kuat dan jangan membagikannya
                kepada orang lain.
              </p>

              {passwordMessage && (
                <Feedback type="success" message={passwordMessage} />
              )}

              {passwordError && (
                <Feedback type="error" message={passwordError} />
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cream-border bg-white px-4 py-3 text-sm font-semibold text-dark transition hover:bg-cream-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <KeyRound size={17} />
                )}

                {savingPassword
                  ? "Memperbarui..."
                  : "Ganti Password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full rounded-xl border border-cream-border bg-white px-3.5 py-3 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand disabled:cursor-not-allowed disabled:bg-cream-light disabled:text-gray-500"
      />
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  required,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete="current-password"
          required={required}
          className="w-full rounded-xl border border-cream-border bg-white px-3.5 py-3 pr-11 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-dark"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

function Feedback({ type, message }) {
  const success = type === "success";

  return (
    <div
      role="status"
      className={`rounded-xl border px-3.5 py-3 text-sm ${
        success
          ? "border-lime-200 bg-lime-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      {message}
    </div>
  );
}
