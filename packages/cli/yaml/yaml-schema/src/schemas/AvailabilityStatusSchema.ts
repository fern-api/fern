import { z } from "zod";

export const AvailabilityStatusSchema = z.enum(["in-development", "pre-release", "deprecated", "generally-available"]);

export type AvailabilityStatusSchema = z.infer<typeof AvailabilityStatusSchema>;
