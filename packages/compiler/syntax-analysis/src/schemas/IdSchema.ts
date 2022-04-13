import { z } from "zod";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const IdSchema = z.union([
    z.string(),
    z
        .strictObject({
            name: z.string(),
            type: z.optional(z.string()),
        })
        .merge(WithDocsSchema),
]);

export type IdSchema = z.infer<typeof IdSchema>;
