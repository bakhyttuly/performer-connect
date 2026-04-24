import { z } from "zod";

export const performerApplicationSchema = z.object({
  stage_name: z.string().trim().min(2, "Stage name too short").max(80),
  category: z.enum(["singer", "dj", "band", "host", "magic", "show"]),
  tagline: z.string().trim().min(4).max(120),
  description: z.string().trim().min(20).max(2000),
  city: z.string().trim().min(2).max(80),
  price_from: z.coerce.number().int().min(50).max(1_000_000),
});

export type PerformerApplicationInput = z.infer<typeof performerApplicationSchema>;

export const bookingRequestSchema = z.object({
  performer_id: z.string().uuid(),
  event_date: z.string().min(8),
  location: z.string().trim().min(2).max(160),
  event_type: z.string().trim().max(80).optional(),
  guests_count: z.coerce.number().int().min(1).max(100000).optional(),
  contact_name: z.string().trim().min(2).max(80).optional(),
  contact_phone: z.string().trim().min(4).max(40).optional(),
  budget: z.coerce.number().int().min(50).max(1_000_000).optional(),
  message: z.string().trim().max(1000).optional(),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  performer_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(4).max(1000).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
