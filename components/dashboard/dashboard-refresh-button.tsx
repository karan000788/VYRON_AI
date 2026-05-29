'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardRefreshButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => window.location.reload()}
      className="gap-2"
      aria-label="Refresh dashboard data"
    >
      <RefreshCw className="h-4 w-4" />
      Refresh
    </Button>
  );
}
