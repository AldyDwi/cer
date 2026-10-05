import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import TeacherLayout from "../layouts/TeacherLayout";
import RoleRoute from "./RoleRoute";
import GuestRoute from "./GuestRoute";
import StudentHome from "../features/students/pages/StudentHome";
import MaterialsPage from "../features/materials/pages/MaterialsPage";
import StudentsPage from "../features/students/pages/StudentsPage";

import { ROLES } from "../constants/roles";

function AppRoutes() {
  return (
    <Routes>
      {/* =========================================
          LOGIN
      ========================================== */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      {/* =========================================
          ROOT
      ========================================== */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* =========================================
          TEACHER
      ========================================== */}
      <Route
        element={
          <RoleRoute allowedRoles={[ROLES.TEACHER]}>
            <TeacherLayout />
          </RoleRoute>
        }
      >
        <Route
          path="/teacher/cer/create"
          element={
            <div>
              <h1 className="text-2xl font-bold text-dark">
                Buat CER
              </h1>

              <p className="mt-2 text-gray-500">
                Buat aktivitas CER baru.
              </p>
            </div>
          }
        />

        <Route
          path="/teacher/materials"
          element={<MaterialsPage />}
        />

        <Route
          path="/teacher/students"
          element={<StudentsPage />}
        />

        <Route
          path="/teacher/profile"
          element={
            <div>
              <h1 className="text-2xl font-bold text-dark">
                Profil
              </h1>

              <p className="mt-2 text-gray-500">
                Kelola informasi profil guru.
              </p>
            </div>
          }
        />

        <Route
          path="/teacher/cer/:id"
          element={
            <div>
              <h1 className="text-2xl font-bold text-dark">
                Kelola CER
              </h1>
            </div>
          }
        />
      </Route>

      {/* =========================================
          STUDENT
      ========================================== */}
      <Route
        path="/student"
        element={
            <RoleRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentHome />
            </RoleRoute>
        }
      />

      {/* =========================================
          UNKNOWN ROUTE
      ========================================== */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;