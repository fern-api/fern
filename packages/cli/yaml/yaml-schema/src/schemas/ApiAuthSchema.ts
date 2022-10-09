import { z } from "zod";
import { AnyAuthSchemesSchema } from "./AnyAuthSchemesSchema";
import { AuthSchemeReferenceSchema } from "./AuthSchemeReferenceSchema";

export const ApiAuthSchema = z.union([z.string(), AuthSchemeReferenceSchema, AnyAuthSchemesSchema]);

export type ApiAuthSchema = z.infer<typeof ApiAuthSchema>;
