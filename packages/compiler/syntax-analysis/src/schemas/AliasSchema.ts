import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const AliasSchema = WithDocsSchema.extend({
    alias: z.string(),
});

export type AliasSchema = z.infer<typeof AliasSchema>;
