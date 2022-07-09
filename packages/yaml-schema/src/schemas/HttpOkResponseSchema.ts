import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpOkResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.optional(z.string()),
    }),
]);

export type HttpOkResponseSchema = z.infer<typeof HttpOkResponseSchema>;
