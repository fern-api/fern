import { z } from "zod";
import { AuthSchemeReferenceSchema } from "./AuthSchemeReferenceSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const AllAuthSchemesSchema = WithDocsSchema.extend({
    all: z.array(z.union([z.string(), AuthSchemeReferenceSchema])),
});

export type AllAuthSchemesSchema = z.infer<typeof AllAuthSchemesSchema>;
