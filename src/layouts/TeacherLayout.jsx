import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import TeacherSidebar from "./components/TeacherSidebar";
import { CerActivityProvider } from "../contexts/CerActivityContext";

function TeacherLayout() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < 768
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth >= 1024
  );

  const location = useLocation();

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <CerActivityProvider>
      <div className="min-h-screen bg-cream-light">
        {/* =========================================
            MOBILE NAVBAR
        ========================================== */}
        {isMobile && (
          <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-cream-border bg-white px-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark text-base font-bold text-lime-brand">
                R
              </div>

              <span className="text-base font-bold text-dark">
                Reka-CER
              </span>
            </div>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Buka sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-dark transition hover:bg-cream-light"
            >
              <Menu size={22} />
            </button>
          </header>
        )}

        {/* =========================================
            MOBILE OVERLAY
        ========================================== */}
        {isMobile && isSidebarOpen && (
          <button
            type="button"
            aria-label="Tutup sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/30"
          />
        )}

        {/* =========================================
            SIDEBAR
        ========================================== */}
        <TeacherSidebar
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          onOpen={() => setIsSidebarOpen(true)}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* =========================================
            MAIN CONTENT
        ========================================== */}
        <main
          className={`min-h-screen transition-[padding] duration-300 ${
            isMobile
              ? "pl-0 pt-16"
              : isSidebarOpen
                ? "pl-72"
                : "pl-18"
          }`}
        >
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </CerActivityProvider>
  );
}

export default TeacherLayout;