import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import TeacherLayout from "../layouts/TeacherLayout";
import StudentLayout from "../layouts/StudentLayout";
import RoleRoute from "./RoleRoute";
import GuestRoute from "./GuestRoute";
import MaterialsPage from "../features/materials/pages/MaterialsPage";
import StudentsPage from "../features/students/pages/StudentsPage";
import CreateCerPage from "../features/cer/pages/CreateCerPage";
import ManageCerPage from "../features/cer/pages/ManageCerPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import GradeRecapPage from "../features/cer/pages/GradeRecapPage";
import StudentActivitiesPage from "../features/quiz/pages/StudentActivitiesPage";
import StudentCerAttemptPage from "../features/quiz/pages/StudentCerAttemptPage";
import StudentCerReviewPage from "../features/quiz/pages/StudentCerReviewPage";

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
          element={<CreateCerPage />}
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
          element={<ProfilePage />}
        />

        <Route
          path="/teacher/cer/:id"
          element={<ManageCerPage />}
        />

        <Route
          path="/teacher/cer/:id/grades"
          element={<GradeRecapPage />}
        />
      </Route>

      {/* =========================================
          STUDENT
      ========================================== */}
      <Route
        path="/student"
        element={
          <RoleRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentLayout />
          </RoleRoute>
        }
      >
        <Route index element={<StudentActivitiesPage />} />

        <Route 
          path="profile" 
          element={<ProfilePage />} 
        />

        <Route
          path="/student/cer/:id/attempt"
          element={<StudentCerAttemptPage />}
        />
      </Route>

      <Route
        path="/student/cer/:id/review"
        element={<StudentCerReviewPage />}
      />
    </Routes>
  );
}

export default AppRoutes;