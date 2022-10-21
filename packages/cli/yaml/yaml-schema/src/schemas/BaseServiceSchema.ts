import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";

export const BaseServiceSchema = DeclarationSchema.extend({
    auth: z.boolean(),
});

export type BaseServiceSchema = z.infer<typeof BaseServiceSchema>;
