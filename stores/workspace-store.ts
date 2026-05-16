import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MembershipRole } from '@/types/database';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: MembershipRole;
  logoUrl?: string | null;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  activeWorkspace: () => Workspace | null;
  clear: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      isLoading: false,
      error: null,

      setWorkspaces: (workspaces) => {
        const current = get().activeWorkspaceId;
        const stillValid = workspaces.some((w) => w.id === current);
        set({
          workspaces,
          activeWorkspaceId: stillValid
            ? current
            : workspaces[0]?.id ?? null,
        });
      },

      setActiveWorkspace: (id) => {
        if (!get().workspaces.some((w) => w.id === id)) return;
        set({ activeWorkspaceId: id });
        if (typeof document !== 'undefined') {
          document.cookie = `vyron_workspace=${id}; path=/; max-age=31536000; SameSite=Lax`;
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      activeWorkspace: () => {
        const { workspaces, activeWorkspaceId } = get();
        return workspaces.find((w) => w.id === activeWorkspaceId) ?? null;
      },

      clear: () =>
        set({
          workspaces: [],
          activeWorkspaceId: null,
          error: null,
        }),
    }),
    {
      name: 'vyron-workspace',
      partialize: (s) => ({ activeWorkspaceId: s.activeWorkspaceId }),
    }
  )
);
