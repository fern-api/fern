import { FdrAPI } from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { OpenAPIV3_1 } from "openapi-types";

import { convertAsyncApiSpecToFdrDefinition, convertAsyncApiSpecToIr } from "./convertAsyncApiSpecToFdrDefinition.js";
import { convertOpenApiSpecToFdrDefinition, convertOpenApiSpecToIr } from "./convertOpenApiSpecToFdrDefinition.js";
import { convertOpenRpcSpecToFdrDefinition, convertOpenRpcSpecToIr } from "./convertOpenRpcSpecToFdrDefinition.js";
import { OpenAPIWorkspace } from "./OpenAPIWorkspace.js";

/**
 * Supported API spec types for in-memory conversion.
 *
 * Note: Protobuf and GraphQL are NOT supported in-memory because they require
 * filesystem access and/or external tools (buf, protoc-gen-fern).
 */
export type ApiSpec =
    | { type: "openapi"; spec: OpenAPIV3_1.Document; overrides?: Partial<OpenAPIV3_1.Document> }
    | { type: "asyncapi"; spec: Record<string, unknown> }
    | { type: "openrpc"; spec: OpenrpcDocument; namespace?: string };

/**
 * Converts any supported API spec (OpenAPI 3.1, AsyncAPI v2/v3, or OpenRPC)
 * directly to an FDR API Definition, without requiring filesystem access.
 *
 * This is the unified entry point that dispatches to the appropriate converter
 * based on the spec type.
 *
 * Supported spec types:
 * - `openapi`: OpenAPI 3.1 documents
 * - `asyncapi`: AsyncAPI v2 and v3 documents
 * - `openrpc`: OpenRPC 1.x documents
 *
 * Not supported (require filesystem/CLI):
 * - Protobuf (requires `buf generate` + `protoc-gen-fern`)
 * - GraphQL (requires filesystem access)
 */
export async function convertApiSpecToFdrDefinition({
    apiSpec,
    context,
    apiName,
    settings
}: {
    apiSpec: ApiSpec;
    context: TaskContext;
    apiName?: string;
    settings?: OpenAPIWorkspace.Settings;
}): Promise<FdrAPI.api.v1.register.ApiDefinition> {
    switch (apiSpec.type) {
        case "openapi":
            return convertOpenApiSpecToFdrDefinition({
                spec: apiSpec.spec,
                context,
                apiName,
                overrides: apiSpec.overrides,
                settings
            });
        case "asyncapi":
            return convertAsyncApiSpecToFdrDefinition({
                spec: apiSpec.spec,
                context,
                apiName,
                settings
            });
        case "openrpc":
            return convertOpenRpcSpecToFdrDefinition({
                spec: apiSpec.spec,
                context,
                apiName,
                namespace: apiSpec.namespace,
                settings
            });
    }
}

/**
 * Converts any supported API spec to Fern Intermediate Representation (IR),
 * without requiring filesystem access.
 */
export async function convertApiSpecToIr({
    apiSpec,
    context,
    settings
}: {
    apiSpec: ApiSpec;
    context: TaskContext;
    settings?: OpenAPIWorkspace.Settings;
}): Promise<IntermediateRepresentation> {
    switch (apiSpec.type) {
        case "openapi":
            return convertOpenApiSpecToIr({
                spec: apiSpec.spec,
                context,
                overrides: apiSpec.overrides,
                settings
            });
        case "asyncapi":
            return convertAsyncApiSpecToIr({
                spec: apiSpec.spec,
                context,
                settings
            });
        case "openrpc":
            return convertOpenRpcSpecToIr({
                spec: apiSpec.spec,
                context,
                namespace: apiSpec.namespace,
                settings
            });
    }
}
