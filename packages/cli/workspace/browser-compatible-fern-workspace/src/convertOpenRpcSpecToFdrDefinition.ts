import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { OpenRPCConverter, OpenRPCConverterContext3_1 } from "@fern-api/openrpc-to-ir";
import { convertIrToFdrApi } from "@fern-api/register";
import { createMockTaskContext } from "@fern-api/task-context";
import { ErrorCollector } from "@fern-api/v3-importer-commons";
import { OpenrpcDocument } from "@open-rpc/meta-schema";

import { OpenAPIWorkspace } from "./OpenAPIWorkspace.js";

/**
 * Converts a parsed OpenRPC spec directly to an FDR API Definition,
 * without requiring filesystem access. This chains:
 * 1. OpenRPCConverterContext3_1 + OpenRPCConverter to produce Fern IR
 * 2. convertIrToFdrApi() to produce the FDR API Definition
 */
export async function convertOpenRpcSpecToFdrDefinition({
    spec,
    apiName,
    namespace,
    settings,
    generationLanguage
}: {
    spec: OpenrpcDocument;
    apiName?: string;
    namespace?: string;
    settings?: OpenAPIWorkspace.Settings;
    generationLanguage?: generatorsYml.GenerationLanguage;
}): Promise<FdrAPI.api.v1.register.ApiDefinition> {
    const context = createMockTaskContext();
    const ir = await convertOpenRpcSpecToIr({ spec, namespace, settings, generationLanguage });

    return convertIrToFdrApi({
        ir,
        snippetsConfig: {
            typescriptSdk: undefined,
            pythonSdk: undefined,
            javaSdk: undefined,
            rubySdk: undefined,
            goSdk: undefined,
            csharpSdk: undefined,
            phpSdk: undefined,
            swiftSdk: undefined,
            rustSdk: undefined
        },
        context,
        apiNameOverride: apiName
    });
}

/**
 * Converts a parsed OpenRPC spec to Fern Intermediate Representation (IR),
 * without requiring filesystem access.
 */
async function convertOpenRpcSpecToIr({
    spec,
    namespace,
    settings,
    generationLanguage
}: {
    spec: OpenrpcDocument;
    namespace?: string;
    settings?: OpenAPIWorkspace.Settings;
    generationLanguage?: generatorsYml.GenerationLanguage;
}): Promise<IntermediateRepresentation> {
    const context = createMockTaskContext();
    const openApiSettings = getOpenAPISettings({ options: settings });

    const errorCollector = new ErrorCollector({ logger: context.logger });

    const converterContext = new OpenRPCConverterContext3_1({
        namespace,
        generationLanguage: generationLanguage ?? "typescript",
        logger: context.logger,
        smartCasing: false,
        spec,
        exampleGenerationArgs: { disabled: false },
        errorCollector,
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        settings: openApiSettings
    });

    const converter = new OpenRPCConverter({ context: converterContext, audiences: { type: "all" } });
    const result = await converter.convert();

    if (result == null) {
        throw new Error("Failed to convert OpenRPC spec to intermediate representation");
    }

    if (errorCollector.hasErrors()) {
        const errorStats = errorCollector.getErrorStats();
        if (errorStats.numErrors > 0) {
            context.logger.error(`OpenRPC conversion completed with ${errorStats.numErrors} errors.`);
            await errorCollector.logErrors({ logWarnings: false });
        }
    }

    return result;
}
