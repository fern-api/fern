import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const AliasSchema = WithDocsSchema.extend({
    alias: z.optional(z.string()).default("void"),
});

export type AliasSchema = z.infer<typeof AliasSchema>;
