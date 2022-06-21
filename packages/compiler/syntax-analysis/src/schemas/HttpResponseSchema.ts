import { z } from "zod";
import { FailedResponseSchema } from "./FailedResponseSchema";
import { HttpOkResponseSchema } from "./HttpOkResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpResponseSchema = WithDocsSchema.extend({
    encoding: z.optional(z.string()),
    ok: z.optional(HttpOkResponseSchema),
    failed: z.optional(FailedResponseSchema),
});

export type HttpResponseSchema = z.infer<typeof HttpResponseSchema>;
