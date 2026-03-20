import { generatorsYml } from "@fern-api/configuration";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { OpenAPIV3_1 } from "openapi-types";

import { convertAsyncApiSpecToFdrDefinition } from "./convertAsyncApiSpecToFdrDefinition.js";
import { convertOpenApiSpecToFdrDefinition } from "./convertOpenApiSpecToFdrDefinition.js";
import { convertOpenRpcSpecToFdrDefinition } from "./convertOpenRpcSpecToFdrDefinition.js";
import { OpenAPIWorkspace } from "./OpenAPIWorkspace.js";

/**
 * Detected API spec type.
 *
 * Note: Protobuf and GraphQL are NOT supported in-memory because they require
 * filesystem access and/or external tools (buf, protoc-gen-fern).
 */
type ApiSpecType = "openapi" | "asyncapi" | "openrpc";

/**
 * Supported API spec types for in-memory conversion (when you want to explicitly specify the type).
 */
type ApiSpec =
    | { type: "openapi"; spec: OpenAPIV3_1.Document; overrides?: Partial<OpenAPIV3_1.Document> }
    | { type: "asyncapi"; spec: Record<string, unknown> }
    | { type: "openrpc"; spec: OpenrpcDocument; namespace?: string };

/**
 * Detects the type of an API spec from a parsed JSON document.
 *
 * Detection logic (matches the Fern CLI's OpenAPILoader):
 * - `spec.openapi` exists (e.g. "3.1.0", "3.0.3") → OpenAPI
 * - `spec.swagger` exists (e.g. "2.0") → OpenAPI (Swagger v2, will need conversion)
 * - `spec.asyncapi` exists (e.g. "2.6.0", "3.0.0") → AsyncAPI
 * - `spec.openrpc` exists (e.g. "1.0.0") → OpenRPC
 *
 * @returns The detected spec type, or undefined if the document doesn't match any known format.
 */
function detectApiSpecType(spec: Record<string, unknown>): ApiSpecType | undefined {
    if (typeof spec.openapi === "string" || typeof spec.swagger === "string") {
        return "openapi";
    }
    if (typeof spec.asyncapi === "string") {
        return "asyncapi";
    }
    if (typeof spec.openrpc === "string") {
        return "openrpc";
    }
    return undefined;
}

/**
 * Simplified entry point: converts any supported API spec to an FDR API Definition.
 * Automatically detects the spec type from the document contents.
 *
 * Usage:
 * ```ts
 * const apiDef = await apiSpecToFdr({ spec: parsedDocument });
 * ```
 *
 * Supports OpenAPI 3.x, Swagger 2.0, AsyncAPI v2/v3, and OpenRPC 1.x.
 * Swagger 2.0 documents will throw — convert them to OpenAPI 3.x first.
 *
 * Not supported (require filesystem/CLI):
 * - Protobuf (requires `buf generate` + `protoc-gen-fern`)
 * - GraphQL (requires filesystem access)
 */
export async function apiSpecToFdr({
    spec,
    apiName,
    settings,
    generationLanguage
}: {
    spec: Record<string, unknown>;
    apiName?: string;
    settings?: OpenAPIWorkspace.Settings;
    generationLanguage?: generatorsYml.GenerationLanguage;
}): Promise<FdrAPI.api.v1.register.ApiDefinition> {
    const detectedType = detectApiSpecType(spec);

    if (detectedType == null) {
        throw new Error(
            "Unable to detect API spec type. Expected a document with an 'openapi', 'swagger', 'asyncapi', or 'openrpc' top-level field."
        );
    }

    switch (detectedType) {
        case "openapi": {
            if (typeof spec.swagger === "string") {
                throw new Error(
                    `Swagger v2.0 is not supported. Please convert your spec to OpenAPI 3.x first. Detected swagger version: ${spec.swagger}`
                );
            }
            return convertOpenApiSpecToFdrDefinition({
                spec: spec as unknown as OpenAPIV3_1.Document,
                apiName,
                settings,
                generationLanguage
            });
        }
        case "asyncapi":
            return convertAsyncApiSpecToFdrDefinition({
                spec,
                apiName,
                settings,
                generationLanguage
            });
        case "openrpc":
            return convertOpenRpcSpecToFdrDefinition({
                spec: spec as unknown as OpenrpcDocument,
                apiName,
                settings,
                generationLanguage
            });
    }
}

/**
 * Converts any supported API spec (OpenAPI 3.1, AsyncAPI v2/v3, or OpenRPC)
 * directly to an FDR API Definition, without requiring filesystem access.
 *
 * This is the explicit-type entry point where the caller specifies the spec type
 * via the `apiSpec.type` discriminant. For auto-detection, use `apiSpecToFdr()` instead.
 */
async function convertApiSpecToFdrDefinition({
    apiSpec,
    apiName,
    settings,
    generationLanguage
}: {
    apiSpec: ApiSpec;
    apiName?: string;
    settings?: OpenAPIWorkspace.Settings;
    generationLanguage?: generatorsYml.GenerationLanguage;
}): Promise<FdrAPI.api.v1.register.ApiDefinition> {
    switch (apiSpec.type) {
        case "openapi":
            return convertOpenApiSpecToFdrDefinition({
                spec: apiSpec.spec,
                apiName,
                overrides: apiSpec.overrides,
                settings,
                generationLanguage
            });
        case "asyncapi":
            return convertAsyncApiSpecToFdrDefinition({
                spec: apiSpec.spec,
                apiName,
                settings,
                generationLanguage
            });
        case "openrpc":
            return convertOpenRpcSpecToFdrDefinition({
                spec: apiSpec.spec,
                apiName,
                namespace: apiSpec.namespace,
                settings,
                generationLanguage
            });
    }
}
