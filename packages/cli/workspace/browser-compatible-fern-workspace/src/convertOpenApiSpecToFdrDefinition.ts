import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { OpenAPI3_1Converter, OpenAPIConverterContext3_1 } from "@fern-api/openapi-to-ir";
import { convertIrToFdrApi } from "@fern-api/register";
import { createMockTaskContext } from "@fern-api/task-context";
import { ErrorCollector } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";

import { InMemoryOpenAPILoader } from "./InMemoryOpenAPILoader.js";
import { OpenAPIWorkspace } from "./OpenAPIWorkspace.js";

/**
 * Converts a parsed OpenAPI 3.1 spec directly to an FDR API Definition,
 * without requiring filesystem access. This chains:
 * 1. InMemoryOpenAPILoader.loadDocument() to prepare the document
 * 2. OpenAPIConverterContext3_1 + OpenAPI3_1Converter to produce Fern IR
 * 3. convertIrToFdrApi() to produce the FDR API Definition
 */
export async function convertOpenApiSpecToFdrDefinition({
    spec,
    apiName,
    overrides,
    settings,
    generationLanguage
}: {
    spec: OpenAPIV3_1.Document;
    apiName?: string;
    overrides?: Partial<OpenAPIV3_1.Document>;
    settings?: OpenAPIWorkspace.Settings;
    generationLanguage?: generatorsYml.GenerationLanguage;
}): Promise<FdrAPI.api.v1.register.ApiDefinition> {
    const context = createMockTaskContext();
    const ir = await convertOpenApiSpecToIr({ spec, overrides, settings, generationLanguage });

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
 * Converts a parsed OpenAPI 3.1 spec to Fern Intermediate Representation (IR),
 * without requiring filesystem access.
 */
async function convertOpenApiSpecToIr({
    spec,
    overrides,
    settings,
    generationLanguage
}: {
    spec: OpenAPIV3_1.Document;
    overrides?: Partial<OpenAPIV3_1.Document>;
    settings?: OpenAPIWorkspace.Settings;
    generationLanguage?: generatorsYml.GenerationLanguage;
}): Promise<IntermediateRepresentation> {
    const context = createMockTaskContext();
    const loader = new InMemoryOpenAPILoader();
    const document = loader.loadDocument({
        parsed: spec,
        overrides,
        settings
    });

    const openApiSettings = getOpenAPISettings({ options: document.settings });

    const errorCollector = new ErrorCollector({ logger: context.logger });

    const openApiSpec = document.value as OpenAPIV3_1.Document;
    const namespace = (openApiSpec as Record<string, unknown>)["x-fern-sdk-namespace"] as string | undefined;

    const converterContext = new OpenAPIConverterContext3_1({
        namespace,
        generationLanguage: generationLanguage ?? "typescript",
        logger: context.logger,
        smartCasing: false,
        spec: openApiSpec,
        exampleGenerationArgs: { disabled: false },
        errorCollector,
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        settings: openApiSettings
    });
    const converter = new OpenAPI3_1Converter({ context: converterContext, audiences: { type: "all" } });
    const result = await converter.convert();

    if (result == null) {
        throw new Error("Failed to convert OpenAPI spec to intermediate representation");
    }

    if (errorCollector.hasErrors()) {
        const errorStats = errorCollector.getErrorStats();
        if (errorStats.numErrors > 0) {
            context.logger.error(`API conversion completed with ${errorStats.numErrors} errors.`);
            await errorCollector.logErrors({ logWarnings: false });
        }
    }

    return result;
}
