import { PublicFooter } from '@/components/layout/public-footer';
import { PublicNav } from '@/components/layout/public-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-extrabold">Contact VYRON AI</h1>
        <p className="mt-3 text-zinc-400">Business email: support@vyron.ai · Response time: within 24 hours</p>
        <form className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea id="message" name="message" required className="min-h-32 w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-cyan-500" />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </main>
      <PublicFooter />
    </div>
  );
}
