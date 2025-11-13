import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { OpenAIExampleEnhancer } from "./openaiClient";
import { AIExampleEnhancerConfig, ExampleEnhancementRequest } from "./types";
import {
    EnhancedExampleRecord,
    loadExistingOverrideCoverage,
    writeAiExamplesOverride
} from "./writeAiExamplesOverride";

interface BodyV3 {
    type?: "json" | "stream" | "sse" | "filename";
    value?: unknown;
}

interface ExampleV3 {
    name?: string;
    description?: string;
    path: string;
    pathParameters?: Record<string, unknown>;
    queryParameters?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    requestBodyV3?: BodyV3;
    responseBodyV3?: BodyV3;
    requestBody?: unknown;
    responseBody?: unknown;
}

interface EndpointV3 {
    method: string;
    summary?: string;
    description?: string;
    examples: ExampleV3[];
}

export async function enhanceExamplesWithAI(
    apiDefinition: FdrCjsSdk.api.v1.register.ApiDefinition,
    config: AIExampleEnhancerConfig,
    context: TaskContext,
    sourceFilePath?: AbsoluteFilePath
): Promise<FdrCjsSdk.api.v1.register.ApiDefinition> {
    if (!config.enabled) {
        context.logger.debug("AI example enhancement is disabled");
        return apiDefinition;
    }

    context.logger.info("Starting AI-powered example enhancement...");
    const enhancer = new OpenAIExampleEnhancer(config, context);

    const coveredEndpoints =
        sourceFilePath != null ? await loadExistingOverrideCoverage(sourceFilePath, context) : new Set<string>();

    let openApiSpec: string | undefined;
    if (sourceFilePath != null) {
        try {
            const specContent = await readFile(sourceFilePath, "utf-8");
            if (specContent.length < 1500000) {
                openApiSpec = specContent;
                context.logger.debug(`Loaded OpenAPI spec (${specContent.length} characters) for AI enhancement`);
            } else {
                context.logger.debug(
                    `OpenAPI spec too large (${specContent.length} characters), skipping spec context for AI enhancement`
                );
            }
        } catch (error) {
            context.logger.debug(`Failed to read OpenAPI spec file: ${error}`);
        }
    }

    const examplesEnhanced = { count: 0, total: 0 };
    const enhancedExampleRecords: EnhancedExampleRecord[] = [];

    const enhancedApiDefinition = await enhancePackageExamples(
        apiDefinition,
        enhancer,
        context,
        examplesEnhanced,
        enhancedExampleRecords,
        coveredEndpoints,
        openApiSpec
    );

    context.logger.info(
        `AI example enhancement completed: ${examplesEnhanced.count}/${examplesEnhanced.total} examples enhanced`
    );

    if (enhancedExampleRecords.length > 0 && sourceFilePath != null) {
        try {
            await writeAiExamplesOverride({
                enhancedExamples: enhancedExampleRecords,
                sourceFilePath,
                context
            });
        } catch (error) {
            context.logger.warn(`Failed to write AI examples override file: ${error}`);
        }
    }

    return enhancedApiDefinition;
}

async function enhancePackageExamples(
    apiDefinition: FdrCjsSdk.api.v1.register.ApiDefinition,
    enhancer: OpenAIExampleEnhancer,
    context: TaskContext,
    stats: { count: number; total: number },
    enhancedExampleRecords: EnhancedExampleRecord[],
    coveredEndpoints: Set<string>,
    openApiSpec?: string
): Promise<FdrCjsSdk.api.v1.register.ApiDefinition> {
    const enhancedSubpackages: Record<string, FdrCjsSdk.api.v1.register.ApiDefinitionSubpackage> = {};

    for (const [packageId, subpackage] of Object.entries(apiDefinition.subpackages)) {
        const enhancedPackage = await enhancePackageEndpoints(
            subpackage as unknown as FdrCjsSdk.api.v1.register.ApiDefinitionPackage,
            enhancer,
            context,
            stats,
            enhancedExampleRecords,
            coveredEndpoints,
            openApiSpec
        );
        enhancedSubpackages[packageId] =
            enhancedPackage as unknown as FdrCjsSdk.api.v1.register.ApiDefinitionSubpackage;
    }

    const enhancedRootPackage = await enhancePackageEndpoints(
        apiDefinition.rootPackage,
        enhancer,
        context,
        stats,
        enhancedExampleRecords,
        coveredEndpoints,
        openApiSpec
    );

    return {
        ...apiDefinition,
        subpackages: enhancedSubpackages,
        rootPackage: enhancedRootPackage
    };
}

async function enhancePackageEndpoints(
    pkg: FdrCjsSdk.api.v1.register.ApiDefinitionPackage,
    enhancer: OpenAIExampleEnhancer,
    context: TaskContext,
    stats: { count: number; total: number },
    enhancedExampleRecords: EnhancedExampleRecord[],
    coveredEndpoints: Set<string>,
    openApiSpec?: string
): Promise<FdrCjsSdk.api.v1.register.ApiDefinitionPackage> {
    const enhancedEndpoints = await Promise.all(
        pkg.endpoints.map(async (endpoint) => {
            return await enhanceEndpointExamples(
                endpoint as unknown as EndpointV3,
                enhancer,
                context,
                stats,
                enhancedExampleRecords,
                coveredEndpoints,
                openApiSpec
            );
        })
    );

    return {
        ...pkg,
        endpoints: enhancedEndpoints as unknown as FdrCjsSdk.api.v1.register.EndpointDefinition[]
    };
}

async function enhanceEndpointExamples(
    endpoint: EndpointV3,
    enhancer: OpenAIExampleEnhancer,
    context: TaskContext,
    stats: { count: number; total: number },
    enhancedExampleRecords: EnhancedExampleRecord[],
    coveredEndpoints: Set<string>,
    openApiSpec?: string
): Promise<EndpointV3> {
    const enhancedExamples = await Promise.all(
        endpoint.examples.map(async (example) => {
            return await enhanceSingleExample(
                example,
                endpoint,
                enhancer,
                context,
                stats,
                enhancedExampleRecords,
                coveredEndpoints,
                openApiSpec
            );
        })
    );

    return {
        ...endpoint,
        examples: enhancedExamples
    };
}

async function enhanceSingleExample(
    example: ExampleV3,
    endpoint: EndpointV3,
    enhancer: OpenAIExampleEnhancer,
    context: TaskContext,
    stats: { count: number; total: number },
    enhancedExampleRecords: EnhancedExampleRecord[],
    coveredEndpoints: Set<string>,
    openApiSpec?: string
): Promise<ExampleV3> {
    stats.total++;

    const endpointKey = `${endpoint.method.toLowerCase()}:${example.path}`;
    if (coveredEndpoints.has(endpointKey)) {
        context.logger.debug(`Skipping ${endpoint.method} ${example.path} - already in ai_examples_override.yml`);
        return example;
    }

    const isAutogenerated = isExampleAutogenerated(example);

    if (!isAutogenerated) {
        context.logger.debug(`Skipping user-provided example for ${endpoint.method} ${example.path}`);
        return example;
    }

    context.logger.debug(`Enhancing autogenerated example for ${endpoint.method} ${example.path}`);

    try {
        const originalRequestExample = extractExampleValue(example.requestBodyV3);
        const originalResponseExample = extractExampleValue(example.responseBodyV3);

        if (!originalRequestExample && !originalResponseExample) {
            context.logger.debug(`No examples to enhance for ${endpoint.method} ${example.path}`);
            return example;
        }

        const enhancementRequest: ExampleEnhancementRequest = {
            endpointPath: example.path,
            method: endpoint.method,
            operationSummary: endpoint.summary,
            operationDescription: endpoint.description,
            originalRequestExample,
            originalResponseExample,
            openApiSpec
        };

        const enhancedResult = await enhancer.enhanceExample(enhancementRequest);

        const enhancedExampleRecord: EnhancedExampleRecord = {
            endpoint: example.path,
            method: endpoint.method,
            pathParameters: example.pathParameters,
            queryParameters: example.queryParameters,
            headers: example.headers,
            requestBody: enhancedResult.enhancedRequestExample,
            responseBody: enhancedResult.enhancedResponseExample
        };
        enhancedExampleRecords.push(enhancedExampleRecord);

        const enhancedExample: ExampleV3 = {
            ...example
        };

        if (enhancedResult.enhancedRequestExample && example.requestBodyV3) {
            enhancedExample.requestBody = enhancedResult.enhancedRequestExample;
            enhancedExample.requestBodyV3 = {
                ...example.requestBodyV3,
                value: enhancedResult.enhancedRequestExample
            };
        }

        if (enhancedResult.enhancedResponseExample && example.responseBodyV3) {
            enhancedExample.responseBody = enhancedResult.enhancedResponseExample;
            enhancedExample.responseBodyV3 = {
                ...example.responseBodyV3,
                value: enhancedResult.enhancedResponseExample
            };
        }

        stats.count++;
        context.logger.info(`✨ Successfully enhanced example for ${endpoint.method} ${example.path}`);
        return enhancedExample;
    } catch (error) {
        context.logger.warn(`Failed to enhance example for ${endpoint.method} ${example.path}: ${error}`);
        return example;
    }
}

function isExampleAutogenerated(example: ExampleV3): boolean {
    const hasGenericName = !example.name || example.name === "" || example.name === "Example";
    const hasEmptyDescription = !example.description || example.description === "";

    const requestHasGenericValues = hasGenericValues(extractExampleValue(example.requestBodyV3));
    const responseHasGenericValues = hasGenericValues(extractExampleValue(example.responseBodyV3));

    return hasGenericName && hasEmptyDescription && (requestHasGenericValues || responseHasGenericValues);
}

function hasGenericValues(obj: unknown): boolean {
    if (obj === null || obj === undefined) {
        return false;
    }

    if (typeof obj === "string") {
        return obj === "string" || obj === "String" || obj === "";
    }

    if (typeof obj === "number") {
        return obj === 1 || obj === 0;
    }

    if (Array.isArray(obj)) {
        return obj.length > 0 && obj.some((item) => hasGenericValues(item));
    }

    if (typeof obj === "object") {
        return Object.values(obj).some((value) => hasGenericValues(value));
    }

    return false;
}

function extractExampleValue(bodyV3: BodyV3 | undefined): unknown {
    if (!bodyV3) {
        return undefined;
    }

    switch (bodyV3.type) {
        case "json":
        case "stream":
        case "sse":
            return bodyV3.value;
        case "filename":
            return undefined;
        default:
            return bodyV3.value;
    }
}
