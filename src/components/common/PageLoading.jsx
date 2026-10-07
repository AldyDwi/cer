import { LoaderCircle } from "lucide-react";

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-light">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-lime-brand text-xl font-bold text-dark shadow-sm">
          R
        </div>

        {/* Loading indicator */}
        <div className="mt-5 flex items-center gap-2">
          <LoaderCircle
            size={18}
            className="animate-spin text-dark"
          />

          <span className="text-sm font-medium text-gray-500">
            Memuat Reka-CER
          </span>
        </div>
      </div>
    </div>
  );
}

export default PageLoading;