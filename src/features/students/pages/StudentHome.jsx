import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../contexts/AuthContext";

function StudentHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="min-h-screen bg-cream-light">
      <div className="mx-auto max-w-6xl p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between rounded-2xl border border-cream-border bg-white p-5">
          <div>
            <h1 className="text-xl font-bold text-dark">
              Halo, {user?.name || "Student"} 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Selamat datang di REKA-CER.
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>

        {/* Temporary Content */}
        <div className="mt-6 rounded-2xl border border-cream-border bg-white p-6">
          <h2 className="text-lg font-semibold text-dark">
            Student Home
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Halaman student sementara.
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;