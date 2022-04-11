import { z } from "zod";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const BaseServiceSchema = WithDocsSchema.extend({
    name: z.optional(z.string()),
    "base-path": z.optional(z.string()),
});

export type BaseServiceSchema = z.infer<typeof BaseServiceSchema>;
