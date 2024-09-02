import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const SingleBaseUrlEnvironmentSchema = WithDocsSchema.extend({
    url: z.string(),
    audiences: z.optional(z.array(z.string()))
});

export type SingleBaseUrlEnvironmentSchema = z.infer<typeof SingleBaseUrlEnvironmentSchema>;
