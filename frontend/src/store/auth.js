import { create } from 'zustand';

// Hydrate from localStorage so a refresh keeps the session.
function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem('accessToken') || null,
  user: readUser(),
  hydrated: false,

  setAuth: ({ accessToken, user }) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set((s) => ({
      accessToken: accessToken ?? s.accessToken,
      user: user ?? s.user,
    }));
  },

  setHydrated: () => set({ hydrated: true }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ accessToken: null, user: null });
  },
}));

export default useAuthStore;
