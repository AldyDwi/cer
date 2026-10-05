import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  PanelLeft,
  PanelLeftOpen,
  FilePlus2,
  BookOpen,
  Users,
  UserCircle,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

function TeacherSidebar({ isOpen, isMobile, onOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [showExpandedContent, setShowExpandedContent] = useState(
    isOpen
  );

  const userMenuRef = useRef(null);
  const previousOpenRef = useRef(isOpen);

  /*
   * Delay 0.5 detik hanya ketika:
   * compact → expanded
   *
   * Pada initial load desktop/tablet,
   * konten langsung ditampilkan.
   */
  useEffect(() => {
    if (isMobile) {
      setShowExpandedContent(isOpen);
      previousOpenRef.current = isOpen;
      return;
    }

    if (!isOpen) {
      setShowExpandedContent(false);
      previousOpenRef.current = false;
      return;
    }

    // Sidebar baru saja dibuka dari compact
    if (!previousOpenRef.current && isOpen) {
      setShowExpandedContent(false);

      const timer = setTimeout(() => {
        setShowExpandedContent(true);
      }, 150);

      previousOpenRef.current = true;

      return () => clearTimeout(timer);
    }

    previousOpenRef.current = isOpen;
  }, [isOpen, isMobile]);

  /*
   * Menutup user popup ketika klik di luar popup
   */
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * Logout
   */
  async function handleLogout() {
    await logout();

    navigate("/login", {
      replace: true,
    });
  }

  /*
   * Navigate ke profile
   */
  function handleProfile() {
    setIsUserMenuOpen(false);

    navigate("/teacher/profile");

    if (isMobile) {
      onClose();
    }
  }

  /*
   * Sidebar width:
   *
   * HP:
   * closed  -> translate keluar
   * opened  -> w-72
   *
   * Tablet/Desktop:
   * closed  -> w-[72px]
   * opened  -> w-72
   */
  const sidebarWidth = isMobile
    ? "w-72"
    : isOpen
      ? "w-72"
      : "w-[72px]";

  const sidebarPosition = isMobile
    ? isOpen
      ? "translate-x-0"
      : "-translate-x-full"
    : "translate-x-0";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex ${sidebarWidth} ${sidebarPosition} flex-col border-r border-cream-border bg-white transition-all duration-300 ease-in-out`}
    >
      {/* =========================================
          HEADER / LOGO
      ========================================== */}
      <div
        className={`flex h-20 shrink-0 items-center border-b border-cream-border ${
          isOpen ? "justify-between px-5" : "justify-center px-2"
        }`}
      >
        {isOpen ? (
          <>
            {/* Logo + Website Name */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dark text-lg font-bold text-lime-brand">
                R
              </div>

              {showExpandedContent && (
                <div className="min-w-0">
                  <h1 className="whitespace-nowrap text-lg font-bold text-dark">
                    Reka-CER
                  </h1>

                  <p className="whitespace-nowrap text-xs text-gray-400">
                    Learning Platform
                  </p>
                </div>
              )}
            </div>

            {/* Close Sidebar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup sidebar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-cream-light hover:text-dark"
            >
              {isMobile ? <X size={20} /> : <PanelLeft size={20} />}
            </button>
          </>
        ) : (
          /* =====================================
             COMPACT LOGO
          ====================================== */
          <button
            type="button"
            onClick={onOpen}
            aria-label="Buka sidebar"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-dark text-lime-brand transition hover:bg-dark/90"
          >
            {/* Logo R */}
            <span className="text-lg font-bold transition group-hover:scale-0">
              R
            </span>

            {/* Icon ketika hover */}
            <PanelLeftOpen
              size={19}
              className="absolute scale-0 transition group-hover:scale-100"
            />

            {/* Tooltip */}
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-dark px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Buka sidebar
            </span>
          </button>
        )}
      </div>

      {/* =========================================
          NAVIGATION
      ========================================== */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {/* Menu Label */}
        {isOpen && (
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>
        )}

        <div className="space-y-2">
          <SidebarItem
            to="/teacher/cer/create"
            icon={<FilePlus2 size={20} />}
            collapsed={!isOpen}
            label="Buat CER"
            onNavigate={isMobile ? onClose : undefined}
          >
            Buat CER
          </SidebarItem>

          <SidebarItem
            to="/teacher/materials"
            icon={<BookOpen size={20} />}
            collapsed={!isOpen}
            label="Materi"
            onNavigate={isMobile ? onClose : undefined}
          >
            Materi
          </SidebarItem>

          <SidebarItem
            to="/teacher/students"
            icon={<Users size={20} />}
            collapsed={!isOpen}
            label="Kelola Student"
            onNavigate={isMobile ? onClose : undefined}
          >
            Mahasiswa
          </SidebarItem>
        </div>

        {/* =====================================
            AKTIVITAS CER
        ====================================== */}
        {isOpen && (
          <div className="mt-8">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Aktivitas CER
            </p>

            <div className="space-y-1">
              <SidebarActivity
                to="/teacher/cer/1"
                onNavigate={isMobile ? onClose : undefined}
              >
                Dampak Deforestasi
              </SidebarActivity>

              <SidebarActivity
                to="/teacher/cer/2"
                onNavigate={isMobile ? onClose : undefined}
              >
                Ekosistem Hutan
              </SidebarActivity>
            </div>
          </div>
        )}
      </nav>

      {/* =========================================
          USER SECTION
      ========================================== */}
      <div
        ref={userMenuRef}
        className={`relative shrink-0 border-t border-cream-border ${
          isOpen ? "p-4" : "p-2"
        }`}
      >
        {/* =====================================
            USER POPUP
        ====================================== */}
        {isUserMenuOpen && (
          <div
            className={`absolute bottom-full z-50 mb-3 overflow-hidden rounded-2xl border border-cream-border bg-white p-2 shadow-xl ${
              isOpen ? "left-4 right-4" : "left-16 w-56"
            }`}
          >
            {/* User Info */}
            <div className="flex items-center gap-3 rounded-xl px-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dark font-semibold text-lime-brand">
                {user?.name?.charAt(0)?.toUpperCase() || "G"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-dark">
                  {user?.name || "Guru Demo"}
                </p>

                <p className="truncate text-xs text-gray-400">
                  @{user?.username || "guru"}
                </p>
              </div>
            </div>

            <div className="my-2 h-px bg-cream-border" />

            {/* Profile */}
            <button
              type="button"
              onClick={handleProfile}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition hover:bg-cream-light"
            >
              <UserCircle size={19} />
              <span>Profil</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={19} />
              <span>Keluar</span>
            </button>
          </div>
        )}

        {/* =====================================
            USER BUTTON
        ====================================== */}
        <button
          type="button"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          aria-label="Menu pengguna"
          className={`group relative flex w-full items-center rounded-2xl text-left transition hover:bg-cream-light ${
            isOpen ? "gap-3 p-3" : "justify-center p-2"
          }`}
        >
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dark font-semibold text-lime-brand">
            {user?.name?.charAt(0)?.toUpperCase() || "G"}
          </div>

          {/* User Info */}
          {isOpen && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-dark">
                {user?.name || "Guru Demo"}
              </p>

              <p className="truncate text-xs text-gray-400">
                {user?.username || "guru"}
              </p>
            </div>
          )}

          {/* Arrow */}
          {isOpen && (
            <ChevronRight
              size={20}
              strokeWidth={2}
              className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                isUserMenuOpen ? "rotate-90" : "rotate-0"
              }`}
            />
          )}

          {/* Tooltip ketika compact */}
          {!isOpen && (
            <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-dark px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {user?.name || "Guru Demo"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

/* =========================================
   SIDEBAR ITEM
========================================= */

function SidebarItem({
  to,
  icon,
  children,
  collapsed,
  label,
  onNavigate,
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      aria-label={label}
      className={({ isActive }) =>
        `group relative flex items-center rounded-xl text-sm font-medium transition ${
          collapsed
            ? "justify-center px-0 py-3"
            : "gap-3 px-3 py-2.5"
        } ${
          isActive
            ? "bg-lime-brand text-dark"
            : "text-gray-600 hover:bg-cream-light hover:text-dark"
        }`
      }
    >
      {icon}

      {/* Text ketika expanded */}
      {!collapsed && <span>{children}</span>}

      {/* Tooltip ketika compact */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-dark px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {label}
        </span>
      )}
    </NavLink>
  );
}

/* =========================================
   SIDEBAR ACTIVITY
========================================= */

function SidebarActivity({ to, children, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `block truncate rounded-xl px-3 py-2.5 text-sm transition ${
          isActive
            ? "bg-cream-light font-medium text-dark"
            : "text-gray-500 hover:bg-cream-light hover:text-dark"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default TeacherSidebar;