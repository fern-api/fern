import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { AsyncAPIConverter, AsyncAPIConverterContext } from "@fern-api/asyncapi-to-ir";
import { generatorsYml } from "@fern-api/configuration";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { convertIrToFdrApi } from "@fern-api/register";
import { CliError, createMockTaskContext } from "@fern-api/task-context";

import { ErrorCollector } from "@fern-api/v3-importer-commons";

import { OpenAPIWorkspace } from "./OpenAPIWorkspace.js";

/**
 * Converts a parsed AsyncAPI spec (v2 or v3) directly to an FDR API Definition,
 * without requiring filesystem access. This chains:
 * 1. AsyncAPIConverterContext + AsyncAPIConverter to produce Fern IR
 * 2. convertIrToFdrApi() to produce the FDR API Definition
 */
export async function convertAsyncApiSpecToFdrDefinition({
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
    const context = createMockTaskContext();
    const ir = await convertAsyncApiSpecToIr({ spec, settings, generationLanguage });

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
 * Converts a parsed AsyncAPI spec (v2 or v3) to Fern Intermediate Representation (IR),
 * without requiring filesystem access.
 */
async function convertAsyncApiSpecToIr({
    spec,
    settings,
    generationLanguage
}: {
    spec: Record<string, unknown>;
    settings?: OpenAPIWorkspace.Settings;
    generationLanguage?: generatorsYml.GenerationLanguage;
}): Promise<IntermediateRepresentation> {
    const context = createMockTaskContext();
    const openApiSettings = getOpenAPISettings({ options: settings });

    const errorCollector = new ErrorCollector({ logger: context.logger });

    const namespace = (spec as Record<string, unknown>)["x-fern-sdk-namespace"] as string | undefined;

    const converterContext = new AsyncAPIConverterContext({
        namespace,
        generationLanguage: generationLanguage ?? "typescript",
        logger: context.logger,
        smartCasing: false,
        // biome-ignore lint/suspicious/noExplicitAny: AsyncAPI document types are complex union types
        spec: spec as any,
        exampleGenerationArgs: { disabled: false },
        errorCollector,
        enableUniqueErrorsPerEndpoint: false,
        settings: openApiSettings,
        generateV1Examples: false
    });
    const converter = new AsyncAPIConverter({ context: converterContext, audiences: { type: "all" } });
    const result = await converter.convert();

    if (result == null) {
        throw new CliError({
            message: "Failed to convert AsyncAPI spec to intermediate representation",
            code: CliError.Code.IrConversionError
        });
    }

    if (errorCollector.hasErrors()) {
        const errorStats = errorCollector.getErrorStats();
        if (errorStats.numErrors > 0) {
            context.logger.error(`AsyncAPI conversion completed with ${errorStats.numErrors} errors.`);
            await errorCollector.logErrors({ logWarnings: false });
        }
    }

    return result;
}
