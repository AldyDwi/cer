import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

function LoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await login(
                form.username,
                form.password
            );

            const user = response.user;

            if (user.role === "teacher") {
                navigate("/teacher/cer/create");
            } else if (user.role === "student") {
                navigate("/student");
            } else {
                setError("Role pengguna tidak dikenali.");
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setError(
                    error.response?.data?.message ||
                    "Username atau password salah."
                );
            } else {
                setError(
                    "Terjadi kesalahan. Pastikan server sedang berjalan."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-dark"
                >
                    Username
                </label>

                <input
                    id="username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    autoComplete="username"
                    disabled={loading}
                    required
                    className="w-full rounded-2xl border border-cream-border bg-white px-4 py-3.5 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-4 focus:ring-lime-brand/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-dark"
                >
                    Password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    className="w-full rounded-2xl border border-cream-border bg-white px-4 py-3.5 text-sm text-dark outline-none transition placeholder:text-gray-400 focus:border-lime-brand focus:ring-4 focus:ring-lime-brand/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-dark px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
                {loading ? "Memproses..." : "Masuk"}
            </button>
        </form>
    );
}

export default LoginForm;