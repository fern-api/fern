import { z } from "zod";

export const AvailabilitySchema = z.enum(["stable", "ga", "inDevelopment", "preRelease", "deprecated", "beta"]);

export type AvailabilitySchema = z.infer<typeof AvailabilitySchema>;
