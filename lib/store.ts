import { userDetail } from '@/types/types';
import create from 'zustand';

interface UserState {
  userDetail: userDetail | null;
  setUserDetail: (user: userDetail) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userDetail: null,
  setUserDetail: (userDetail) => set(() => ({ userDetail })),
}));