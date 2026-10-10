
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  House,
  LogOut,
  UserRound,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  async function handleLogout() {
    setProfileOpen(false);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  }

  const profileName = user?.name || user?.username || "Mahasiswa";
  const initial = profileName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-cream-light/40 text-dark">
      <header className="sticky top-0 z-40 border-b border-cream-border bg-white">
        <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-5 sm:px-7 lg:px-8">

            {/* Kiri: Logo dan Home */}
            <div className="flex h-full items-center gap-8">

            {/* Logo */}
            <button
                type="button"
                onClick={() => navigate("/student")}
                className="flex shrink-0 items-center gap-3"
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-brand text-lg font-extrabold text-dark">
                R
                </span>

                <span className="text-lg font-bold tracking-tight text-dark">
                Reka-CER
                </span>
            </button>

            {/* Home */}
            <NavLink
                to="/student"
                end
                className={({ isActive }) =>
                `relative flex h-full items-center gap-2 text-sm font-semibold transition ${
                    isActive
                    ? "text-dark"
                    : "text-gray-500 hover:text-dark"
                }`
                }
            >
                {({ isActive }) => (
                <>
                    <House size={17} />
                    <span>Home</span>

                    {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.75 rounded-t-full bg-lime-brand" />
                    )}
                </>
                )}
            </NavLink>
            </div>

            {/* Kanan: Profil */}
            <div className="relative" ref={profileRef}>
            <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Menu profil"
                aria-expanded={profileOpen}
                className={`flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-cream-light ${
                profileOpen ? "bg-cream-light" : ""
                }`}
            >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                {initial}
                </span>

                <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                }`}
                />
            </button>

            {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-cream-border bg-white p-2 shadow-lg">
                <div className="border-b border-cream-border px-3 py-3">
                    <p className="truncate text-sm font-semibold text-dark">
                    {profileName}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                    {user?.email || user?.username || "Mahasiswa"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                    setProfileOpen(false);
                    navigate("/student/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition hover:bg-cream-light hover:text-dark"
                >
                    <UserRound size={17} />
                    Profil
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
                >
                    <LogOut size={17} />
                    Keluar
                </button>
                </div>
            )}
            </div>

        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
