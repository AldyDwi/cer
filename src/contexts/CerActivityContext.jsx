import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCerQuizzes } from "../features/cer/services/cerService";

const CerActivityContext = createContext(null);

export function CerActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadActivities() {
    try {
      setLoading(true);

      const response = await getCerQuizzes();

      setActivities(response.data || []);
    } catch (error) {
      console.error(
        "Gagal mengambil aktivitas CER:",
        error
      );

      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  const value = {
    activities,
    loading,
    refreshActivities: loadActivities,
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