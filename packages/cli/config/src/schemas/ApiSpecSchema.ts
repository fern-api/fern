import { z } from "zod";
import { AsyncApiSpecSchema } from "./specs/AsyncApiSpecSchema.js";
import { ConjureSpecSchema } from "./specs/ConjureSpecSchema.js";
import { FernSpecSchema } from "./specs/FernSpecSchema.js";
import { OpenApiSpecSchema } from "./specs/OpenApiSpecSchema.js";
import { OpenRpcSpecSchema } from "./specs/OpenRpcSpecSchema.js";
import { ProtobufSpecSchema } from "./specs/ProtobufSpecSchema.js";

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
