'use client';

import { ChevronDown, Building2 } from 'lucide-react';
import { useWorkspace } from '@/hooks/use-workspace';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function WorkspaceSwitcher() {
  const { workspaces, active, setActive } = useWorkspace();

  if (!workspaces.length) {
    return (
      <span className="text-sm text-zinc-500">No workspace</span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <Building2 className="h-4 w-4 text-cyan-400" />
          <span className="max-w-[140px] truncate">{active?.name ?? 'Select workspace'}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 border-white/10 bg-zinc-900">
        {workspaces.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onClick={() => setActive(w.id)}
            className={w.id === active?.id ? 'bg-white/10' : ''}
          >
            <span className="truncate">{w.name}</span>
            <span className="ml-auto text-xs text-zinc-500 capitalize">{w.role}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
