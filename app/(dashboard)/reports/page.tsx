export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-zinc-400">
        Nightly reports are generated via Inngest. PDF export uses Browserless + Puppeteer.
      </p>
      <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-zinc-500">
        Reports will appear here after the first nightly job run.
      </div>
    </div>
  );
}
