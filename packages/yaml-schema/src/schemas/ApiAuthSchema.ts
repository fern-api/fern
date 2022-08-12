import { z } from "zod";
import { AllAuthSchemesSchema } from "./AllAuthSchemesSchema";
import { AnyAuthSchemesSchema } from "./AnyAuthSchemesSchema";
import { AuthSchemeReferenceSchema } from "./AuthSchemeReferenceSchema";

export const ApiAuthSchema = z.union([
    z.string(),
    AuthSchemeReferenceSchema,
    AnyAuthSchemesSchema,
    AllAuthSchemesSchema,
]);

export type ApiAuthSchema = z.infer<typeof ApiAuthSchema>;
