import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ShowState {
  selectedTheaterId: string | null;
  selectedScreenId: string | null;
  selectedMovieId: string | null;
  showCancelled: boolean;
  includeDeleted: boolean;

  setSelectedTheater: (id: string | null) => void;
  setScreen: (id: string | null) => void;
  setMovie: (id: string | null) => void;
  toggleCancelled: () => void;
  toggleIncludeDeleted: () => void;
  clearFilters: () => void;
}

export const useShowStore = create<ShowState>()(
  persist(
    (set) => ({
      selectedTheaterId: null,
      selectedScreenId: null,
      selectedMovieId: null,
      showCancelled: false,
      includeDeleted: false,

      setSelectedTheater: (id) =>
        set({ selectedTheaterId: id, selectedScreenId: null }),
      setScreen: (id) => set({ selectedScreenId: id }),
      setMovie: (id) => set({ selectedMovieId: id }),
      toggleCancelled: () =>
        set((state) => ({ showCancelled: !state.showCancelled })),
      toggleIncludeDeleted: () =>
        set((state) => ({ includeDeleted: !state.includeDeleted })),
      clearFilters: () =>
        set({
          selectedTheaterId: null,
          selectedScreenId: null,
          selectedMovieId: null,
          showCancelled: false,
          includeDeleted: false,
        }),
    }),
    {
      name: "show-manager-filters",
      storage: createJSONStorage(() => localStorage),
      // // Persist ONLY theater and screen selection between refreshes
      partialize: (state) => ({
        selectedTheaterId: state.selectedTheaterId,
        // selectedScreenId: state.selectedScreenId,
      }),
    },
  ),
);
