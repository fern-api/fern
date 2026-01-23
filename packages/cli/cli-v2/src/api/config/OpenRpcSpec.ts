import type { schemas } from "@fern-api/config";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { ApiSpec } from "./ApiSpec";

/**
 * An OpenRPC specification for JSON-RPC APIs.
 */
export interface OpenRpcSpec {
    /** Path to the OpenRPC specification file */
    openrpc: AbsoluteFilePath;

    /** Path to the overrides file */
    overrides?: AbsoluteFilePath;

    /** OpenRPC-specific settings */
    settings?: schemas.OpenRpcSettingsSchema;
}

/**
 * Type guard to check if an ApiSpec is an OpenRpcSpec.
 */
export function isOpenRpcSpec(spec: ApiSpec): spec is OpenRpcSpec {
    return "openrpc" in spec;
}
