import type { StateCreator } from "zustand";

export const SidebarView = {
  Main: "main",
} as const;

export type SidebarViewType = (typeof SidebarView)[keyof typeof SidebarView];

export interface SidebarSlice {
  view: SidebarViewType;
  searchOpen: boolean;

  setView: (view: SidebarViewType) => void;
  setSearchOpen: (open: boolean) => void;
  handleShowMainView: () => void;
  handleOpenSearch: () => void;
}

export const createSidebarSlice: StateCreator<SidebarSlice> = (set) => ({
  view: SidebarView.Main,
  searchOpen: false,

  setView: (view) => set({ view }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  handleShowMainView: () => set({ view: SidebarView.Main }),
  handleOpenSearch: () => set({ searchOpen: true }),
});
