import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const MultipleBaseUrlsEnvironmentSchema = WithDocsSchema.extend({
    urls: z.record(z.string())
});

export type MultipleBaseUrlsEnvironmentSchema = z.infer<typeof MultipleBaseUrlsEnvironmentSchema>;
