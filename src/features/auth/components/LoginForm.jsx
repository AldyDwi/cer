import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../contexts/AuthContext";
import { ROLES } from "../../../constants/roles";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError(
        "Username dan password wajib diisi."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await login(
        username,
        password
      );

      const role = response.user.role;

      if (role === ROLES.TEACHER) {
        navigate("/teacher/cer/create", {
          replace: true,
        });

        return;
      }

      if (role === ROLES.STUDENT) {
        navigate("/student", {
          replace: true,
        });

        return;
      }

      setError("Role pengguna tidak dikenali.");
    } catch (error) {
      console.error(error);

      if (error.response?.status === 422) {
        const message =
          error.response?.data?.errors?.username?.[0];

        setError(
          message ||
            "Username atau password salah."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Terjadi kesalahan saat masuk."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* =========================================
          HEADER
      ========================================== */}
      <div className="mb-9">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          Reka-CER
        </p>

        <h2 className="text-3xl font-black tracking-tight text-dark sm:text-4xl">
          Selamat datang!
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
          Masuk untuk melanjutkan aktivitas
          pembelajaran dan rekonstruksi CER.
        </p>
      </div>

      {/* =========================================
          FORM
      ========================================== */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="mb-2.5 block text-sm font-semibold text-dark"
          >
            Username
          </label>

          <div className="group relative">
            <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition-colors duration-200 group-focus-within:text-dark">
              <UserRound size={18} strokeWidth={1.8} />
            </div>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Masukkan username"
              autoComplete="username"
              className="h-13 w-full rounded-2xl border border-cream-border bg-white pl-11 pr-4 text-sm text-dark shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-md focus:border-lime-brand focus:ring-4 focus:ring-lime-brand/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-dark"
            >
              Password
            </label>
          </div>

          <div className="group relative">
            <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition-colors duration-200 group-focus-within:text-dark">
              <LockKeyhole
                size={18}
                strokeWidth={1.8}
              />
            </div>

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Masukkan password"
              autoComplete="current-password"
              className="h-13 w-full rounded-2xl border border-cream-border bg-white pl-11 pr-12 text-sm text-dark shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-md focus:border-lime-brand focus:ring-4 focus:ring-lime-brand/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
              aria-label={
                showPassword
                  ? "Sembunyikan password"
                  : "Tampilkan password"
              }
              className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark"
            >
              {showPassword ? (
                <EyeOff
                  size={18}
                  strokeWidth={1.8}
                />
              ) : (
                <Eye
                  size={18}
                  strokeWidth={1.8}
                />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group mt-2 flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-dark px-5 text-sm font-bold text-white shadow-lg shadow-dark/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-dark/95 hover:shadow-xl hover:shadow-dark/15 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <span>
            {loading
              ? "Memproses..."
              : "Masuk"}
          </span>

          {!loading && (
            <ArrowRight
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          )}
        </button>
      </form>

      {/* =========================================
          FOOTER
      ========================================== */}
      <div className="mt-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-cream-border" />

        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
          Learning Platform
        </span>

        <div className="h-px flex-1 bg-cream-border" />
      </div>
    </div>
  );
}

export default LoginForm;