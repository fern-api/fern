import { z } from "zod";
import { AvailabilityStatusSchema } from "./AvailabilityStatusSchema";

export const AvailabilitySchema = z.strictObject({
    status: AvailabilityStatusSchema,
    message: z.optional(z.string())
});

export type AvailabilitySchema = z.infer<typeof AvailabilitySchema>;
