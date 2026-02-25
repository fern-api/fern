import { z } from "zod";

export const AvailabilitySchema = z.enum([
    "stable",
    "generally-available",
    "in-development",
    "pre-release",
    "deprecated",
    "beta"
]);

export type AvailabilitySchema = z.infer<typeof AvailabilitySchema>;
