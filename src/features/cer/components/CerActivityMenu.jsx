import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

function CerActivityMenu({
  onClose,
  onEdit,
  onDelete,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        onClose();
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-2 top-10 z-50 w-44 rounded-2xl border border-cream-border bg-white p-1.5 shadow-xl"
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition hover:bg-cream-light hover:text-dark"
      >
        <Pencil size={16} />
        Ubah
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
      >
        <Trash2 size={16} />
        Hapus
      </button>
    </div>
  );
}

export default CerActivityMenu;