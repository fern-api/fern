import { z } from "zod";
import { AvailabilityUnionSchema } from "./AvailabilityUnionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const DeclarationWithoutDocsSchema = z.strictObject({
    availability: AvailabilityUnionSchema,
    audiences: z.optional(z.array(z.string()))
});

export type DeclarationWithoutDocsSchema = z.infer<typeof DeclarationWithoutDocsSchema>;

export const DeclarationSchema = WithDocsSchema.extend(DeclarationWithoutDocsSchema.shape);

export type DeclarationSchema = z.infer<typeof DeclarationSchema>;
