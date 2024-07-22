import { z } from "zod";
import { AvailabilityUnionSchema } from "./AvailabilityUnionSchema";

export const WithAvailabilitySchema = z.strictObject({
    availability: AvailabilityUnionSchema
});

export type WithAvailabilitySchema = z.infer<typeof WithAvailabilitySchema>;
