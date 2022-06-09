import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const IdSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        name: z.string(),
        type: z.optional(z.string()),
    }),
]);

export type IdSchema = z.infer<typeof IdSchema>;
