import { X } from "lucide-react";
import { useStore } from "@/hooks/useStore";

export default function CrudModal({ title, children }: { title: string; children: React.ReactNode }) {
  const { modalOpen, closeModal } = useStore();
  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={closeModal}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(27,42,74,0.2)] w-full max-w-[600px] max-h-[85vh] overflow-y-auto z-10" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#E8EDF5] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="font-body text-[16px] font-semibold text-[#1B2A4A]">{title}</h3>
          <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-[#E8EDF5] flex items-center justify-center">
            <X className="w-4 h-4 text-[#718096]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
