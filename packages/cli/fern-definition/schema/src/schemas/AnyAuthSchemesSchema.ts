import { z } from "zod";
import { AuthSchemeReferenceSchema } from "./AuthSchemeReferenceSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const AnyAuthSchemesSchema = WithDocsSchema.extend({
    any: z.array(z.union([z.string(), AuthSchemeReferenceSchema]))
});

export type AnyAuthSchemesSchema = z.infer<typeof AnyAuthSchemesSchema>;
