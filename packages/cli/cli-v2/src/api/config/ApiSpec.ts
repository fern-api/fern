import type { AsyncApiSpec } from "./AsyncApiSpec.js";
import type { ConjureSpec } from "./ConjureSpec.js";
import type { FernSpec } from "./FernSpec.js";
import type { GraphQlSpec } from "./GraphQlSpec.js";
import type { OpenApiSpec } from "./OpenApiSpec.js";
import type { OpenRpcSpec } from "./OpenRpcSpec.js";
import type { ProtobufSpec } from "./ProtobufSpec.js";

/**
 * An individual API specification.
 */
export type ApiSpec = OpenApiSpec | AsyncApiSpec | ProtobufSpec | FernSpec | ConjureSpec | OpenRpcSpec | GraphQlSpec;

/**
 * The type identifier for each spec format.
 */
export type ApiSpecType = "openapi" | "asyncapi" | "protobuf" | "fern" | "conjure" | "openrpc" | "graphql";
