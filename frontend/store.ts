"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const LOCAL_KEY = "coverpepper_ui";

type UIState = {
  selectedLetterId: string | null;
  setSelectedLetterId: (id: string | null) => void;

  templateLetterId: string | null;
  setTemplateLetterId: (id: string | null) => void;

  isGenerateOpen: boolean;
  setGenerateOpen: (v: boolean) => void;

  isUploadOpen: boolean;
  setUploadOpen: (v: boolean) => void;

  isLogoutConfirmOpen: boolean;
  setLogoutConfirmOpen: (v: boolean) => void;

  isDeleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (v: boolean) => void;

  isLoginOpen: boolean;
  setLoginOpen: (v: boolean) => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      selectedLetterId: null,
      setSelectedLetterId: (id) => set({ selectedLetterId: id }),

      templateLetterId: null,
      setTemplateLetterId: (id) => set({ templateLetterId: id }),

      isGenerateOpen: false,
      setGenerateOpen: (v) => set({ isGenerateOpen: v }),

      isUploadOpen: false,
      setUploadOpen: (v) => set({ isUploadOpen: v }),

      isLogoutConfirmOpen: false,
      setLogoutConfirmOpen: (v) => set({ isLogoutConfirmOpen: v }),

      isDeleteConfirmOpen: false,
      setDeleteConfirmOpen: (v) => set({ isDeleteConfirmOpen: v }),

      isLoginOpen: false,
      setLoginOpen: (v) => set({ isLoginOpen: v }),
    }),
    {
      name: LOCAL_KEY, // stored as localStorage["coverpepper_ui"]
      partialize: (state) => ({
        templateLetterId: state.templateLetterId, // only persist what you need
      }),
    }
  )
);
