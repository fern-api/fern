import { z } from "zod";
import { AvailabilitySchema } from "./AvailabilitySchema";
import { AvailabilityStatusSchema } from "./AvailabilityStatusSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const DeclarationSchema = WithDocsSchema.extend({
    availability: z.optional(z.union([AvailabilityStatusSchema, AvailabilitySchema])),
});

export type DeclarationSchema = z.infer<typeof DeclarationSchema>;
