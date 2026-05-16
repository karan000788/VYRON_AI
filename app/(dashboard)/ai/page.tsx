import { CopilotChat } from '@/components/ai/copilot-chat';

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Copilot</h1>
        <p className="text-zinc-400">Business assistant with quota enforcement</p>
      </div>
      <CopilotChat />
    </div>
  );
}
