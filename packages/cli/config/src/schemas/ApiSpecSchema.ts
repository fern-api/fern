import { z } from "zod";
import { AsyncApiSpecSchema } from "./specs/AsyncApiSpecSchema";
import { ConjureSpecSchema } from "./specs/ConjureSpecSchema";
import { FernSpecSchema } from "./specs/FernSpecSchema";
import { OpenApiSpecSchema } from "./specs/OpenApiSpecSchema";
import { OpenRpcSpecSchema } from "./specs/OpenRpcSpecSchema";
import { ProtobufSpecSchema } from "./specs/ProtobufSpecSchema";

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
