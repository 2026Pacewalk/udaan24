import { useStore } from "@/hooks/useStore";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function Toast() {
  const { toast, clearToast } = useStore();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-green-600" />,
    error: <AlertCircle className="w-4 h-4 text-red-600" />,
    info: <Info className="w-4 h-4 text-blue-600" />,
  };

  const borders = {
    success: "border-l-4 border-green-500",
    error: "border-l-4 border-red-500",
    info: "border-l-4 border-blue-500",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300] animate-slide-up">
      <div className={`bg-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[300px] ${borders[toast.type]}`}>
        {icons[toast.type]}
        <p className="text-[14px] text-[#1B2A4A] flex-1">{toast.message}</p>
        <button onClick={clearToast} className="text-[#718096] hover:text-[#1B2A4A]">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
