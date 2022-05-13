import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const BaseServiceSchema = WithDocsSchema.extend({
    "base-path": z.optional(z.string()),
});

export type BaseServiceSchema = z.infer<typeof BaseServiceSchema>;
