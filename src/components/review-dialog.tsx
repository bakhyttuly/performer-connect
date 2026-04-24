import { useEffect, useState, type FormEvent } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { reviewSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  bookingId: string;
  performerId: string;
  performerName: string;
  onPosted?: () => void;
}

export function ReviewDialog({ bookingId, performerId, performerName, onPosted }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyPosted, setAlreadyPosted] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle()
      .then(({ data }) => setAlreadyPosted(!!data));
  }, [open, user, bookingId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = reviewSchema.safeParse({
      booking_id: bookingId,
      performer_id: performerId,
      rating,
      text: text.trim() || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("auth.error.generic"));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      client_id: user.id,
      performer_id: parsed.data.performer_id,
      booking_id: parsed.data.booking_id,
      rating: parsed.data.rating,
      text: parsed.data.text ?? null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("review.posted"));
    setOpen(false);
    onPosted?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outlineGold" size="sm">
          <Star className="h-3.5 w-3.5" />
          {t("review.cta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t("review.title")}</DialogTitle>
          <DialogDescription>{performerName}</DialogDescription>
        </DialogHeader>

        {alreadyPosted ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center text-sm text-primary">
            {t("review.alreadyPosted")}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {t("review.rating")}
              </div>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} stars`}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 transition-transform",
                        n <= rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/40",
                        n === rating && "scale-110",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder={t("review.text")}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                variant="luxe"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                {t("review.submit")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
