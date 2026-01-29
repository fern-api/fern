import type { schemas } from "@fern-api/config";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { ApiSpec } from "./ApiSpec";

/**
 * Protobuf definition configuration.
 */
export interface ProtobufDefinition {
    /** Root directory containing proto files */
    root: AbsoluteFilePath;

    /** Target proto file (optional) */
    target?: AbsoluteFilePath;

    /** Path to the overrides file */
    overrides?: AbsoluteFilePath;

    /** Whether to use local generation */
    localGeneration?: boolean;

    /** Whether generated from OpenAPI */
    fromOpenapi?: boolean;

    /** Dependencies (paths to proto directories) */
    dependencies?: AbsoluteFilePath[];
}

/**
 * A Protocol Buffers specification.
 */
export interface ProtobufSpec {
    /** Protobuf definition configuration */
    proto: ProtobufDefinition;

    /** Protobuf-specific settings */
    settings?: schemas.ProtobufSettingsSchema;
}

/**
 * Type guard to check if an ApiSpec is a ProtobufSpec.
 */
export function isProtobufSpec(spec: ApiSpec): spec is ProtobufSpec {
    return "proto" in spec;
}
