import { z } from "zod";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const HttpErrorSchema = WithDocsSchema.extend({
    type: z.string(),
    statusCode: z.number(),
});

export type HttpErrorSchema = z.infer<typeof HttpErrorSchema>;
