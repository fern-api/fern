import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const AliasSchema = z
    .strictObject({
        alias: z.string(),
    })
    .merge(WithDocsSchema);

export type AliasSchema = z.infer<typeof AliasSchema>;
