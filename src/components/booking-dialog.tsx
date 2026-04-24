import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  MessageCircle,
  Loader2,
  MapPin,
  Users,
  Phone,
  User,
  Wallet,
} from "lucide-react";
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
  initialDate?: string | null;
  initialSlot?: string | null;
  renderTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

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
      event_type: form.get("event_type") || undefined,
      guests_count: form.get("guests_count") || undefined,
      contact_name: form.get("contact_name") || undefined,
      contact_phone: form.get("contact_phone") || undefined,
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
      event_type: parsed.data.event_type ?? null,
      guests_count: parsed.data.guests_count ?? null,
      contact_name: parsed.data.contact_name ?? null,
      contact_phone: parsed.data.contact_phone ?? null,
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
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {t("booking.title")}
          </DialogTitle>
          <DialogDescription>
            {t("booking.subtitle")}{" "}
            <span className="text-foreground">{performerName}</span>
          </DialogDescription>
        </DialogHeader>

        {!isRealPerformer ? (
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("booking.demoOnly")}
            </p>
          </div>
        ) : !user ? (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("booking.signInRequired")}
            </p>
            <Button
              className="mt-4"
              variant="luxe"
              onClick={() => navigate({ to: "/auth" })}
            >
              {t("nav.signin")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section: event */}
            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-primary">
                {t("booking.section.event")}
              </div>
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
                <input
                  type="hidden"
                  name="event_date"
                  value={pickedDate ?? defaultDate}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="event_type">
                    <CalendarIcon className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                    {t("booking.eventType")}
                  </Label>
                  <Input
                    id="event_type"
                    name="event_type"
                    maxLength={80}
                    placeholder={t("booking.eventTypePh")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guests_count">
                    <Users className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                    {t("booking.guests")}
                  </Label>
                  <Input
                    id="guests_count"
                    name="guests_count"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="120"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">
                  <MapPin className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                  {t("booking.location")}
                </Label>
                <Input
                  id="location"
                  name="location"
                  required
                  minLength={2}
                  maxLength={160}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget">
                  <Wallet className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                  {t("booking.budget")} (USD)
                </Label>
                <Input id="budget" name="budget" type="number" min={50} step={50} />
              </div>
            </div>

            {/* Section: contact */}
            <div className="space-y-3 border-t border-border/30 pt-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-primary">
                {t("booking.section.contact")}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contact_name">
                    <User className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                    {t("booking.contactName")}
                  </Label>
                  <Input id="contact_name" name="contact_name" maxLength={80} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact_phone">
                    <Phone className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                    {t("booking.contactPhone")}
                  </Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    maxLength={40}
                  />
                </div>
              </div>
            </div>

            {/* Section: brief */}
            <div className="space-y-3 border-t border-border/30 pt-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-primary">
                {t("booking.section.brief")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">{t("booking.message")}</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={3}
                  maxLength={1000}
                  placeholder={t("booking.eventTypePh")}
                />
              </div>
            </div>

            <p className="rounded-lg bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              {t("booking.summary.label")}
            </p>

            <DialogFooter>
              <Button
                type="submit"
                variant="luxe"
                size="lg"
                disabled={submitting || !pickedDate}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarIcon className="h-4 w-4" />
                )}
                {t("booking.send")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
