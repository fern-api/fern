import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const IdSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        name: z.string(),
        type: z.optional(z.union([z.literal("string"), z.literal("uuid")])),
    }),
]);

export type IdSchema = z.infer<typeof IdSchema>;
