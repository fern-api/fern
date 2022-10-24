import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const AliasSchema = WithDocsSchema.extend({
    type: z.string(),
});

export type AliasSchema = z.infer<typeof AliasSchema>;
