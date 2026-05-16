export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Document center</h1>
      <p className="text-zinc-400">Files stored in Supabase Storage</p>
      <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-zinc-500">
        Upload contracts, reports, and attachments per workspace.
      </div>
    </div>
  );
}
