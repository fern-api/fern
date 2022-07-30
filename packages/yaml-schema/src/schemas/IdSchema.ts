import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const IdSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        name: z.string(),
        type: z.union([z.literal("string"), z.literal("uuid")]).optional(),
    }),
]);

export type IdSchema = z.infer<typeof IdSchema>;
