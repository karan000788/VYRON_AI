import { createClient } from '@/lib/supabase/client';

export class RealtimeManager {
  private static supabase: ReturnType<typeof createClient> | null = null;
  private static channel: any = null;
  private static listeners: Set<(payload: any) => void> = new Set();

  private static getClient() {
    if (!this.supabase) {
      this.supabase = createClient();
    }

    return this.supabase;
  }

  static subscribe(businessId: string, callback: (payload: any) => void) {
    if (typeof window === 'undefined') {
      return () => {};
    }

    this.listeners.add(callback);
    
    if (!this.channel) {
      this.channel = this.getClient()
        .channel(`workspace-${businessId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', filter: `business_id=eq.${businessId}` },
          (payload) => {
            this.listeners.forEach((listener) => {
              try {
                listener(payload);
              } catch (err) {
                console.error('Error in realtime listener:', err);
              }
            });
          }
        )
        .subscribe((status) => {
          console.log(`Supabase Realtime status for ${businessId}:`, status);
        });
    }

    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0 && this.channel) {
        this.channel.unsubscribe();
        this.channel = null;
      }
    };
  }
}
