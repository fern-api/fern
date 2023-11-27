import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const AuthSchemeReferenceSchema = WithDocsSchema.extend({
    scheme: z.string()
});

export type AuthSchemeReferenceSchema = z.infer<typeof AuthSchemeReferenceSchema>;
