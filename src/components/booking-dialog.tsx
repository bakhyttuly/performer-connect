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
import { AvailabilityCalendar } from "@/components/availability-calendar";
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
  /** Pre-selected date (YYYY-MM-DD) coming from the page calendar */
  initialDate?: string | null;
  /** Pre-selected time slot like "20:00" */
  initialSlot?: string | null;
  /** Render trigger? Set to false when the dialog is opened externally. */
  renderTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Booking dialog — only works for real (UUID) performers. Otherwise shows a demo notice. */
export function BookingDialog({
  performerId,
  performerName,
  initialDate,
  initialSlot,
  renderTrigger = true,
  open: openProp,
  onOpenChange,
}: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (openProp === undefined) setInternalOpen(v);
  };
  const [submitting, setSubmitting] = useState(false);

  const isRealPerformer = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(performerId);

  // Default date: 30 days from now (deterministic — set on mount only)
  const [defaultDate, setDefaultDate] = useState("");
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDefaultDate(d.toISOString().slice(0, 10));
  }, []);

  const [pickedDate, setPickedDate] = useState<string | null>(initialDate ?? null);
  const [pickedSlot, setPickedSlot] = useState<string | null>(initialSlot ?? null);

  useEffect(() => {
    if (open) {
      setPickedDate(initialDate ?? null);
      setPickedSlot(initialSlot ?? null);
    }
  }, [open, initialDate, initialSlot]);

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
    const dateValue = pickedDate ?? (form.get("event_date") as string | null);
    const messageRaw = (form.get("message") as string | null) ?? "";
    const slotNote = pickedSlot ? `[${pickedSlot}] ` : "";
    const composedMessage = (slotNote + messageRaw).trim() || undefined;

    const parsed = bookingRequestSchema.safeParse({
      performer_id: performerId,
      event_date: dateValue,
      location: form.get("location"),
      budget: form.get("budget") || undefined,
      message: composedMessage,
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
      {renderTrigger && (
        <DialogTrigger asChild>
          <Button variant="luxe" size="lg" className="w-full">
            <CalendarIcon className="h-4 w-4" />
            {t("profile.book")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
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
              <Label>{t("booking.date")}</Label>
              <div className="rounded-xl border border-border/40 p-3">
                <AvailabilityCalendar
                  performerId={performerId}
                  value={pickedDate}
                  slot={pickedSlot}
                  onChange={(d, s) => {
                    setPickedDate(d);
                    setPickedSlot(s);
                  }}
                />
              </div>
              {/* Hidden fallback for native form */}
              <input
                type="hidden"
                name="event_date"
                value={pickedDate ?? defaultDate}
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
              <Button
                type="submit"
                variant="luxe"
                size="lg"
                disabled={submitting || !pickedDate}
                className="w-full"
              >
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
