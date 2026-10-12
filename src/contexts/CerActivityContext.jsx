import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { getCerQuizzes } from "../features/cer/services/cerService";

const CerActivityContext = createContext(null);

export function CerActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parameter isInitial untuk membedakan initial load dan background refresh
  const loadActivities = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }

      const response = await getCerQuizzes();

      setActivities(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil aktivitas CER:", error);
      setActivities([]);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadActivities(true); // Memuat pertama kali dengan indikator loading
  }, [loadActivities]);

  const value = {
    activities,
    loading,
    refreshActivities: () => loadActivities(false), // Refresh tanpa memicu skeleton loader
  };

  return (
    <CerActivityContext.Provider value={value}>
      {children}
    </CerActivityContext.Provider>
  );
}

export function useCerActivities() {
  const context = useContext(CerActivityContext);

  if (!context) {
    throw new Error(
      "useCerActivities harus digunakan di dalam CerActivityProvider."
    );
  }

  return context;
}