import { z } from "zod";
import { AvailabilitySchema } from "./AvailabilitySchema";
import { AvailabilityStatusSchema } from "./AvailabilityStatusSchema";

export const AvailabilityUnionSchema = z.optional(z.union([AvailabilityStatusSchema, AvailabilitySchema]));

export type AvailabilityUnionSchema = z.infer<typeof AvailabilityUnionSchema>;
