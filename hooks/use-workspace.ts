'use client';

import { useWorkspaceStore } from '@/stores/workspace-store';

export function useWorkspace() {
  const store = useWorkspaceStore();
  return {
    workspaces: store.workspaces,
    active: store.activeWorkspace(),
    activeId: store.activeWorkspaceId,
    setActive: store.setActiveWorkspace,
    isLoading: store.isLoading,
    error: store.error,
  };
}
