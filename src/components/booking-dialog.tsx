import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Calendar as CalendarIcon, MessageCircle, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { bookingRequestSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Props {
  performerId: string;
  performerName: string;
}

/** Booking dialog — only works for real (UUID) performers. Otherwise shows a demo notice. */
export function BookingDialog({ performerId, performerName }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isRealPerformer = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(performerId);

  // Default date: 30 days from now (deterministic — set on mount only)
  const [defaultDate, setDefaultDate] = useState("");
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDefaultDate(d.toISOString().slice(0, 10));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!isRealPerformer) {
      toast.error(t("booking.demoOnly"));
      return;
    }
    const form = new FormData(e.currentTarget);
    const parsed = bookingRequestSchema.safeParse({
      performer_id: performerId,
      event_date: form.get("event_date"),
      location: form.get("location"),
      budget: form.get("budget") || undefined,
      message: form.get("message") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("auth.error.generic"));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      performer_id: parsed.data.performer_id,
      client_id: user.id,
      event_date: parsed.data.event_date,
      location: parsed.data.location,
      budget: parsed.data.budget,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("booking.sent"));
    setOpen(false);
    navigate({ to: "/bookings" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="luxe" size="lg" className="w-full">
          <CalendarIcon className="h-4 w-4" />
          {t("profile.book")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {t("booking.title")}
          </DialogTitle>
          <DialogDescription>
            {t("booking.subtitle")} <span className="text-foreground">{performerName}</span>
          </DialogDescription>
        </DialogHeader>

        {!isRealPerformer ? (
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">{t("booking.demoOnly")}</p>
          </div>
        ) : !user ? (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
            <p className="text-sm text-muted-foreground">{t("booking.signInRequired")}</p>
            <Button
              className="mt-4"
              variant="luxe"
              onClick={() => navigate({ to: "/auth" })}
            >
              {t("nav.signin")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="event_date">{t("booking.date")}</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                required
                defaultValue={defaultDate}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">{t("booking.location")}</Label>
              <Input id="location" name="location" required minLength={2} maxLength={160} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">{t("booking.budget")} (USD)</Label>
              <Input id="budget" name="budget" type="number" min={50} step={50} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">{t("booking.message")}</Label>
              <Textarea id="message" name="message" rows={3} maxLength={1000} />
            </div>
            <DialogFooter>
              <Button type="submit" variant="luxe" size="lg" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
                {t("booking.send")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
