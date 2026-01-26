import { z } from "zod";
import { AsyncApiSpecSchema } from "./AsyncApiSpecSchema";
import { ConjureSpecSchema } from "./ConjureSpecSchema";
import { FernSpecSchema } from "./FernSpecSchema";
import { OpenApiSpecSchema } from "./OpenApiSpecSchema";
import { OpenRpcSpecSchema } from "./OpenRpcSpecSchema";
import { ProtobufSpecSchema } from "./ProtobufSpecSchema";

/**
 * An API spec schema is a discriminated union of all supported spec types.
 * Each spec type is identified by its unique key (openapi, asyncapi, etc.).
 */
export const ApiSpecSchema = z.union([
    OpenApiSpecSchema,
    AsyncApiSpecSchema,
    ProtobufSpecSchema,
    FernSpecSchema,
    ConjureSpecSchema,
    OpenRpcSpecSchema
]);

export type ApiSpecSchema = z.infer<typeof ApiSpecSchema>;
