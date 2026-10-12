import { LoaderCircle } from "lucide-react";
import logoImg from "../../assets/logo.png";

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-light">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <img
          src={logoImg}
          alt="Reka-CER Logo"
          className="h-14 w-14 animate-pulse object-contain rounded-2xl"
        />

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