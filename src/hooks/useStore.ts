import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  activeModule: string;
  setActiveModule: (v: string) => void;
  // When set, the Students module pre-fills its search with this value (e.g. deep-link from a converted lead).
  studentFocusSearch: string;
  setStudentFocusSearch: (v: string) => void;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  clearToast: () => void;

  // Modals
  modalOpen: boolean;
  modalType: string;
  modalData: any;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useStore = create<AppState>()(
  devtools((set) => ({
    sidebarCollapsed: false,
    setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    activeModule: "dashboard",
    setActiveModule: (v) => set({ activeModule: v }),
    studentFocusSearch: "",
    setStudentFocusSearch: (v) => set({ studentFocusSearch: v }),
    toast: null,
    showToast: (message, type = "info") => {
      set({ toast: { message, type } });
      setTimeout(() => set({ toast: null }), 4000);
    },
    clearToast: () => set({ toast: null }),
    modalOpen: false,
    modalType: "",
    modalData: null,
    openModal: (type, data = null) => set({ modalOpen: true, modalType: type, modalData: data }),
    closeModal: () => set({ modalOpen: false, modalType: "", modalData: null }),
    theme: "light",
    toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  }))
);
