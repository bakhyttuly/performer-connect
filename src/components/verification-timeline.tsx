import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type VerificationStatus = "pending" | "approved" | "rejected";

const steps: VerificationStatus[] = ["pending", "approved"];

interface Props {
  status: VerificationStatus;
  rejectionReason?: string | null;
  className?: string;
}

export function VerificationTimeline({ status, rejectionReason, className }: Props) {
  const { t } = useI18n();

  if (status === "rejected") {
    return (
      <div className={cn("card-luxe rounded-2xl p-6", className)}>
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-destructive">
              {t("verify.statusLabel")}
            </div>
            <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
              {t("verify.status.rejected")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {rejectionReason ?? t("verify.rejectedNoReason")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("card-luxe rounded-2xl p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">
            {t("verify.statusLabel")}
          </div>
          <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
            {t(`verify.status.${status}`)}
          </h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <ol className="relative mt-6 space-y-5">
        {steps.map((step, idx) => {
          const reachedIndex = status === "approved" ? 1 : 0;
          const reached = idx <= reachedIndex;
          const current = idx === reachedIndex && status !== "approved";
          return (
            <li key={step} className="flex items-start gap-3">
              <div
                className={cn(
                  "relative grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all",
                  reached
                    ? "bg-[image:var(--gradient-gold)] text-primary-foreground shadow-[var(--shadow-gold)]"
                    : "border border-border/60 bg-background text-muted-foreground",
                  current && "ring-4 ring-primary/20",
                )}
              >
                {reached ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                {idx < steps.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-1/2 top-7 h-5 w-px -translate-x-1/2",
                      reached && idx < reachedIndex ? "bg-primary/60" : "bg-border/60",
                    )}
                  />
                )}
              </div>
              <div className="pt-0.5">
                <div
                  className={cn(
                    "text-sm font-medium",
                    reached ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t(`verify.step.${step}.title`)}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {t(`verify.step.${step}.desc`)}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function StatusBadge({ status }: { status: VerificationStatus }) {
  const { t } = useI18n();
  const cls =
    status === "approved"
      ? "bg-primary/15 text-primary"
      : status === "rejected"
        ? "bg-destructive/15 text-destructive"
        : "bg-muted text-muted-foreground";
  const Icon = status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : Clock;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider", cls)}>
      <Icon className="h-3 w-3" />
      {t(`verify.status.${status}`)}
    </span>
  );
}
