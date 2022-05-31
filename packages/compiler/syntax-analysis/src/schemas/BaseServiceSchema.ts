import { z } from "zod";
import { AuthSchema } from "./AuthSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const BaseServiceSchema = WithDocsSchema.extend({
    auth: AuthSchema,
    "base-path": z.optional(z.string()),
});

export type BaseServiceSchema = z.infer<typeof BaseServiceSchema>;
