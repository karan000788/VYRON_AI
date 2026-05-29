import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 bg-white/5" />
          <Skeleton className="h-4 w-40 bg-white/5" />
        </div>
        <Skeleton className="h-9 w-28 bg-white/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-28 rounded-xl bg-white/5" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl bg-white/5" />
    </div>
  );
}
