import { z } from "zod";
import { AuthSchema } from "./AuthSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const BaseServiceSchema = WithDocsSchema.extend({
    auth: AuthSchema,
});

export type BaseServiceSchema = z.infer<typeof BaseServiceSchema>;
