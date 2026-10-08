import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /*
       * Data dianggap fresh selama 5 menit.
       *
       * Selama fresh:
       * - pindah halaman tidak perlu GET ulang
       * - data langsung diambil dari cache
       */
      staleTime: 1000 * 60 * 5,

      /*
       * Cache tetap disimpan di memory selama 24 jam
       * setelah query tidak digunakan.
       */
      gcTime: 1000 * 60 * 60 * 24,

      /*
       * Jangan otomatis GET hanya karena window
       * kembali mendapatkan focus.
       */
      refetchOnWindowFocus: false,

      /*
       * Jangan GET ulang setiap component mount
       * jika data masih fresh.
       */
      refetchOnMount: true,

      /*
       * Jika gagal request, coba 1 kali lagi.
       */
      retry: 1,
    },
  },
});