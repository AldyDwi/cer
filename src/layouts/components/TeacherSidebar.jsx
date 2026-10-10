import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  MoreHorizontal,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../contexts/AuthContext";
import { useCerActivities } from "../../contexts/CerActivityContext";

import CerActivityMenu from "../../features/cer/components/CerActivityMenu";
import EditCerModal from "../../features/cer/components/EditCerModal";
import DeleteCerModal from "../../features/cer/components/DeleteCerModal";

function TeacherSidebar({ isOpen, isMobile, onOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // State untuk mengontrol delay munculnya teks saat sidebar dibuka
  const [showExpandedContent, setShowExpandedContent] = useState(isOpen);

  const userMenuRef = useRef(null);
  const previousOpenRef = useRef(isOpen);

  const {
    activities,
    loading: activitiesLoading,
    refreshActivities,
  } = useCerActivities();

  /*
   * Delay 150ms hanya ketika: compact -> expanded
   * Pada initial load HP/tablet, konten langsung disesuaikan.
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

    // Sidebar baru saja dibuka dari mode compact
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-brand text-lg font-bold text-dark">
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

            {/* Close Sidebar Button */}
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
          /* COMPACT LOGO */
          <button
            type="button"
            onClick={onOpen}
            aria-label="Buka sidebar"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-dark text-lime-brand transition hover:bg-dark/90"
          >
            <span className="text-lg font-bold transition group-hover:scale-0">
              R
            </span>

            <PanelLeftOpen
              size={19}
              className="absolute scale-0 transition group-hover:scale-100"
            />

            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-dark px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Buka sidebar
            </span>
          </button>
        )}
      </div>

      {/* =========================================
          NAVIGATION
      ========================================== */}
      <nav className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-4">
        {/* =====================================
            MENU UTAMA
        ====================================== */}
        <div className="shrink-0">
          {/* Menu Label */}
          {isOpen && showExpandedContent && (
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Menu
            </p>
          )}

          <div className="space-y-2">
            <SidebarItem
              to="/teacher/cer/create"
              icon={<FilePlus2 size={20} />}
              collapsed={!isOpen}
              showText={showExpandedContent}
              label="Buat CER"
              onNavigate={isMobile ? onClose : undefined}
            >
              Buat CER
            </SidebarItem>

            <SidebarItem
              to="/teacher/materials"
              icon={<BookOpen size={20} />}
              collapsed={!isOpen}
              showText={showExpandedContent}
              label="Materi"
              onNavigate={isMobile ? onClose : undefined}
            >
              Materi
            </SidebarItem>

            <SidebarItem
              to="/teacher/students"
              icon={<Users size={20} />}
              collapsed={!isOpen}
              showText={showExpandedContent}
              label="Kelola Student"
              onNavigate={isMobile ? onClose : undefined}
            >
              Mahasiswa
            </SidebarItem>
          </div>
        </div>

        {/* =====================================
            AKTIVITAS CER
        ====================================== */}
        {isOpen && showExpandedContent && (
          <div className="mt-8 flex min-h-0 flex-1 flex-col">
            {/* Label tetap di atas */}
            <p className="mb-3 shrink-0 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Aktivitas CER
            </p>

            {/* Daftar aktivitas dengan scroll */}
            <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
              <div className="space-y-1">
                {activitiesLoading ? (
                  <div className="space-y-2 px-3">
                    <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                  </div>
                ) : activities.length === 0 ? (
                  <p className="px-3 text-sm text-gray-400">
                    Belum ada aktivitas CER.
                  </p>
                ) : (
                  activities.map((activity) => (
                    <SidebarActivity
                      key={activity.id}
                      activity={activity}
                      onUpdated={() => {
                        // 1. Invalidate cache daftar kuis guru (sidebar & list)
                        queryClient.invalidateQueries({
                          queryKey: ["cer-quizzes"],
                        });

                        // 2. Invalidate cache detail kuis yang sedang dibuka guru
                        queryClient.invalidateQueries({
                          queryKey: ["cer-quiz", String(activity.id)],
                        });

                        // 3. Invalidate cache daftar kuis siswa
                        queryClient.invalidateQueries({
                          queryKey: ["student-published-activities"],
                        });

                        // 4. Refresh context jika ada
                        refreshActivities?.();
                      }}
                    />
                  ))
                )}
              </div>
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
        {/* USER POPUP */}
        {isUserMenuOpen && (
          <div
            className={`absolute bottom-full z-50 mb-3 overflow-hidden rounded-2xl border border-cream-border bg-white p-2 shadow-xl ${
              isOpen ? "left-4 right-4" : "left-16 w-56"
            }`}
          >
            <div className="flex items-center gap-3 rounded-xl px-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-brand font-bold text-dark">
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

            <button
              type="button"
              onClick={handleProfile}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition hover:bg-cream-light"
            >
              <UserCircle size={19} />
              <span>Profil</span>
            </button>

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

        {/* USER BUTTON */}
        <button
          type="button"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          aria-label="Menu pengguna"
          className={`group relative flex w-full items-center rounded-2xl text-left transition hover:bg-cream-light ${
            isOpen ? "gap-3 p-3" : "justify-center p-2"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-brand font-bold text-dark">
            {user?.name?.charAt(0)?.toUpperCase() || "G"}
          </div>

          {isOpen && showExpandedContent && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-dark">
                {user?.name || "Guru Demo"}
              </p>

              <p className="truncate text-xs text-gray-400">
                {user?.username || "guru"}
              </p>
            </div>
          )}

          {isOpen && showExpandedContent && (
            <ChevronRight
              size={20}
              strokeWidth={2}
              className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                isUserMenuOpen ? "rotate-90" : "rotate-0"
              }`}
            />
          )}

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
  showText,
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
            ? "bg-lime-brand text-dark font-semibold"
            : "text-gray-600 hover:bg-cream-light hover:text-dark"
        }`
      }
    >
      {icon}

      {!collapsed && showText && (
        <span className="truncate whitespace-nowrap">{children}</span>
      )}

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

function SidebarActivity({ activity, onUpdated }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);

  // Pengecekan apakah path lokasi saat ini sesuai dengan aktivitas ini
  const activityPath = `/teacher/cer/${activity.id}`;
  const isActive = 
    location.pathname === activityPath || 
    location.pathname.startsWith(`${activityPath}/`);

  function handleOpenMenu(event) {
    event.stopPropagation();
    setMenuOpen((previous) => !previous);
  }

  function handleOpenEdit() {
    setMenuOpen(false);
    setModal("edit");
  }

  function handleOpenDelete() {
    setMenuOpen(false);
    setModal("delete");
  }

  function handleCloseModal() {
    setModal(null);
  }

  function handleDeleted() {
    onUpdated?.();

    if (isActive) {
      navigate("/teacher/cer/create");
    }
  }

  return (
    <>
      <div
        className={`group relative flex items-center rounded-xl transition ${
          isActive
            ? "bg-lime-brand text-dark"
            : "text-gray-600 hover:bg-cream-light hover:text-dark"
        }`}
      >
        {/* Nama Aktivitas */}
        <button
          type="button"
          onClick={() => navigate(`/teacher/cer/${activity.id}`)}
          className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm transition ${
            isActive ? "font-semibold text-dark" : "text-gray-600 hover:text-dark"
          }`}
        >
          {activity.title}
        </button>

        {/* Tombol ... */}
        <button
          type="button"
          onClick={handleOpenMenu}
          aria-label="Menu aktivitas"
          className={`mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
            isActive
              ? "text-dark/70 hover:bg-black/10 hover:text-dark"
              : "text-gray-400 hover:bg-white hover:text-dark"
          } ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <MoreHorizontal size={17} />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <CerActivityMenu
            onClose={() => setMenuOpen(false)}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        )}
      </div>

      {modal === "edit" && (
        <EditCerModal
          activity={activity}
          onClose={handleCloseModal}
          onUpdated={onUpdated}
        />
      )}

      {modal === "delete" && (
        <DeleteCerModal
          activity={activity}
          onClose={handleCloseModal}
          onUpdated={handleDeleted}
        />
      )}
    </>
  );
}

export default TeacherSidebar;