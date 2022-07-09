import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const EnumSchema = WithDocsSchema.extend({
    enum: z.array(
        z.union([
            z.string(),
            WithDocsSchema.extend({
                name: z.optional(z.string()),
                value: z.string(),
            }),
        ])
    ),
});

export type EnumSchema = z.infer<typeof EnumSchema>;
