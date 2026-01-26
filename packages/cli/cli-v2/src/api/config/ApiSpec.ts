import type { AsyncApiSpec } from "./AsyncApiSpec";
import type { ConjureSpec } from "./ConjureSpec";
import type { FernSpec } from "./FernSpec";
import type { OpenApiSpec } from "./OpenApiSpec";
import type { OpenRpcSpec } from "./OpenRpcSpec";
import type { ProtobufSpec } from "./ProtobufSpec";

/**
 * An individual API specification.
 */
export type ApiSpec = OpenApiSpec | AsyncApiSpec | ProtobufSpec | FernSpec | ConjureSpec | OpenRpcSpec;

/**
 * The type identifier for each spec format.
 */
export type ApiSpecType = "openapi" | "asyncapi" | "protobuf" | "fern" | "conjure" | "openrpc";
