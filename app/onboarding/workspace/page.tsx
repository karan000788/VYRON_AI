import { createWorkspace } from '@/lib/actions/workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingWorkspacePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your workspace</CardTitle>
          <CardDescription>
            Set up your business to start tracking finances and using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business name</Label>
              <Input id="name" name="name" required placeholder="Acme Pvt Ltd" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN (optional)</Label>
              <Input id="gstin" name="gstin" placeholder="22AAAAA0000A1Z5" />
            </div>
            <Button type="submit" className="w-full">
              Continue to dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
