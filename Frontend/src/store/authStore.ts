import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
}

export interface AuthState {
  userId: string | null;
  userInfo: UserInfo | null;
  accessToken: string | null;
  isVerified: boolean;
  role: string | null;
  selectedTheaterId: string | null;
  activeLocation: string | null;

  setUserId: (id: string | null) => void;
  setUserInfo: (info: UserInfo | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsVerified: (status: boolean) => void;
  setRole: (role: string) => void;
  setActiveLocation: (location: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      userInfo: null,
      accessToken: null,
      isVerified: false,
      role: null,
      selectedTheaterId: null,
      activeLocation: "Mumbai",

      setUserId: (id) => set({ userId: id }),
      setUserInfo: (info) => set({ userInfo: info }),
      setAccessToken: (token) => set({ accessToken: token }),
      setIsVerified: (status) => set({ isVerified: status }),
      setRole: (role) => set({ role: role }),
      setActiveLocation: (location) => set({ activeLocation: location }),

      clearAuth: () =>
        set({
          userId: null,
          accessToken: null,
          isVerified: false,
          selectedTheaterId: null,
          activeLocation: null,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userId: state.userId,
        userInfo: state.userInfo,
        isVerified: state.isVerified,
        role: state.role,
        activeLocation: state.activeLocation,
      }),
    },
  ),
);
