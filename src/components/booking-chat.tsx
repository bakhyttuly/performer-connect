import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Msg {
  id: string;
  booking_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface Props {
  bookingId: string;
  /** Optional — used to label the other side */
  counterpartyName?: string;
}

/** Realtime chat scoped to a single booking. */
export function BookingChat({ bookingId, counterpartyName }: Props) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("booking_messages")
      .select("id, booking_id, sender_id, body, created_at")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast.error(error.message);
        setMessages((data as Msg[]) ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`booking-chat-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking_messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const body = text.trim();
    if (!body || body.length > 2000) return;
    setSending(true);
    const { error } = await supabase.from("booking_messages").insert({
      booking_id: bookingId,
      sender_id: user.id,
      body,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setText("");
  };

  if (!user) return null;

  const dateFmt = (iso: string) =>
    new Date(iso).toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex h-full min-h-[360px] flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border border-border/40 bg-background/40 p-4">
        {loading ? (
          <div className="grid h-full place-items-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
            {t("chat.empty")}
            {counterpartyName && (
              <span className="mt-1 text-foreground/70">{counterpartyName}</span>
            )}
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div
                key={m.id}
                className={cn("flex w-full", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                    mine
                      ? "bg-[image:var(--gradient-gold)] text-primary-foreground"
                      : "border border-border/50 bg-muted/40 text-foreground",
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div
                    className={cn(
                      "mt-1 text-[10px] uppercase tracking-wider",
                      mine ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {dateFmt(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat.placeholder")}
          maxLength={2000}
          disabled={sending}
        />
        <Button
          type="submit"
          variant="luxe"
          size="icon"
          disabled={sending || !text.trim()}
          aria-label={t("chat.send")}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
