import { FernToken } from "@fern-api/auth";
import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { type EndpointSelector, type HttpMethod, OpenAPIPruner } from "@fern-api/openapi-pruner";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import * as yaml from "js-yaml";
import { OpenAPIV3 } from "openapi-types";
import { join } from "path";
import { LambdaExampleEnhancer } from "./lambdaClient";
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

function createSafeFilename(method: string, endpointPath: string): string {
    // Convert method and path to safe filename
    const safeMethod = method.toLowerCase();
    const safePath = endpointPath
        .replace(/[^a-zA-Z0-9]/g, "_") // Replace non-alphanumeric with underscore
        .replace(/_+/g, "_") // Collapse multiple underscores
        .replace(/^_|_$/g, ""); // Remove leading/trailing underscores

    return `${safeMethod}_${safePath}_pruned_spec.yaml`;
}

async function writeSpecToFile(spec: string, filename: string, context: TaskContext): Promise<void> {
    try {
        const outputDir = process.cwd();
        const filePath = join(outputDir, filename);

        // Convert JSON back to YAML for easier reading
        let yamlContent: string;
        try {
            const jsonSpec = JSON.parse(spec);
            yamlContent = yaml.dump(jsonSpec, { indent: 2, lineWidth: -1 });
        } catch {
            // If it's already YAML or parsing fails, use as-is
            yamlContent = spec;
        }

        await writeFile(filePath, yamlContent, "utf-8");
        context.logger.debug(`Wrote pruned OpenAPI spec to: ${filePath}`);
    } catch (error) {
        context.logger.warn(`Failed to write pruned spec to file: ${error}`);
    }
}

function findMatchingOpenAPIPath(examplePath: string, availablePaths: string[]): string | undefined {
    // First try exact match
    if (availablePaths.includes(examplePath)) {
        return examplePath;
    }

    // Try to match path parameters
    // Example: /user/username should match /user/{username}
    for (const openApiPath of availablePaths) {
        // Convert OpenAPI path template to regex
        // /user/{username} -> /user/([^/]+)
        const regexPattern = openApiPath.replace(/\{[^}]+\}/g, "([^/]+)");
        const regex = new RegExp(`^${regexPattern}$`);

        if (regex.test(examplePath)) {
            return openApiPath;
        }
    }

    return undefined;
}

async function pruneOpenAPISpec(
    openApiSpecContent: string,
    endpointPath: string,
    method: string,
    context: TaskContext
): Promise<string | undefined> {
    try {
        // Parse the OpenAPI spec (supports both JSON and YAML)
        let parsedSpec: OpenAPIV3.Document;
        try {
            // Try JSON first
            parsedSpec = JSON.parse(openApiSpecContent);
        } catch {
            // Fall back to YAML
            parsedSpec = yaml.load(openApiSpecContent) as OpenAPIV3.Document;
        }

        // Validate it's a valid OpenAPI spec
        if (!parsedSpec.openapi || !parsedSpec.paths) {
            context.logger.debug("Invalid OpenAPI spec structure, skipping pruning");
            return undefined;
        }

        const availablePaths = Object.keys(parsedSpec.paths);
        context.logger.debug(`OpenAPI spec contains ${availablePaths.length} paths`);
        context.logger.debug(`Available paths: ${availablePaths.join(", ")}`);
        context.logger.debug(`Looking for: ${endpointPath} with method: ${method.toLowerCase()}`);

        // Find the matching OpenAPI path template
        const matchingPath = findMatchingOpenAPIPath(endpointPath, availablePaths);

        if (matchingPath) {
            const pathObj = parsedSpec.paths[matchingPath] as any;
            context.logger.debug(
                `Matched ${endpointPath} to OpenAPI path: ${matchingPath} with methods: ${Object.keys(pathObj).join(", ")}`
            );
        } else {
            context.logger.debug(`No matching OpenAPI path found for ${endpointPath}`);
            return undefined;
        }

        // Create endpoint selector for pruning using the matched path
        const endpoints: EndpointSelector[] = [
            {
                path: matchingPath,
                method: method.toLowerCase() as HttpMethod
            }
        ];

        // Prune the spec to just this endpoint
        const pruner = new OpenAPIPruner({
            document: parsedSpec,
            endpoints
        });

        const result = pruner.prune();

        context.logger.debug(
            `Pruned OpenAPI spec: ${result.statistics.originalEndpoints} → ${result.statistics.prunedEndpoints} endpoints, ` +
                `${result.statistics.originalSchemas} → ${result.statistics.prunedSchemas} schemas`
        );

        // Log what paths are in the pruned result
        const prunedPaths = Object.keys(result.document.paths || {});
        context.logger.debug(`Pruned spec contains paths: ${prunedPaths.join(", ")}`);
        if (prunedPaths.length === 0) {
            context.logger.warn(`Pruning resulted in empty paths! Original selector: ${JSON.stringify(endpoints)}`);
        }

        // Convert back to JSON string
        const prunedSpecJson = JSON.stringify(result.document, null, 2);

        // Write to file for inspection
        const filename = createSafeFilename(method, endpointPath);
        await writeSpecToFile(prunedSpecJson, filename, context);

        return prunedSpecJson;
    } catch (error) {
        context.logger.debug(`Failed to prune OpenAPI spec: ${error}. Using original spec.`);
        return openApiSpecContent;
    }
}

export async function enhanceExamplesWithAI(
    apiDefinition: FdrCjsSdk.api.v1.register.ApiDefinition,
    config: AIExampleEnhancerConfig,
    context: TaskContext,
    token: FernToken,
    organizationId: string,
    sourceFilePath?: AbsoluteFilePath
): Promise<FdrCjsSdk.api.v1.register.ApiDefinition> {
    if (!config.enabled) {
        context.logger.debug("AI example enhancement is disabled");
        return apiDefinition;
    }

    context.logger.info("Starting AI-powered example enhancement...");
    const enhancer = new LambdaExampleEnhancer(config, context, token);

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
        organizationId,
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
    enhancer: LambdaExampleEnhancer,
    context: TaskContext,
    organizationId: string,
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
            organizationId,
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
        organizationId,
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
    enhancer: LambdaExampleEnhancer,
    context: TaskContext,
    organizationId: string,
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
                organizationId,
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
    enhancer: LambdaExampleEnhancer,
    context: TaskContext,
    organizationId: string,
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
                organizationId,
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
    enhancer: LambdaExampleEnhancer,
    context: TaskContext,
    organizationId: string,
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

        // Prune the OpenAPI spec to just this endpoint if available
        let prunedOpenApiSpec: string | undefined;
        if (openApiSpec) {
            prunedOpenApiSpec = await pruneOpenAPISpec(openApiSpec, example.path, endpoint.method, context);
        }

        const enhancementRequest: ExampleEnhancementRequest = {
            endpointPath: example.path,
            method: endpoint.method,
            organizationId,
            operationSummary: endpoint.summary,
            operationDescription: endpoint.description,
            originalRequestExample,
            originalResponseExample,
            openApiSpec: prunedOpenApiSpec
        };

        const enhancedResult = await enhancer.enhanceExample(enhancementRequest);

        const enhancedReq = enhancedResult.enhancedRequestExample;
        const enhancedRes = enhancedResult.enhancedResponseExample;

        const requestChanged = enhancedReq !== undefined && !deepEqual(enhancedReq, originalRequestExample);
        const responseChanged = enhancedRes !== undefined && !deepEqual(enhancedRes, originalResponseExample);

        if (!requestChanged && !responseChanged) {
            context.logger.debug(`AI returned no changes for ${endpoint.method} ${example.path}`);
            return example;
        }

        const enhancedExampleRecord: EnhancedExampleRecord = {
            endpoint: example.path,
            method: endpoint.method,
            pathParameters: example.pathParameters,
            queryParameters: example.queryParameters,
            headers: example.headers,
            requestBody: requestChanged ? enhancedReq : undefined,
            responseBody: responseChanged ? enhancedRes : undefined
        };
        enhancedExampleRecords.push(enhancedExampleRecord);

        const enhancedExample: ExampleV3 = {
            ...example
        };

        if (requestChanged && example.requestBodyV3) {
            enhancedExample.requestBody = enhancedReq;
            enhancedExample.requestBodyV3 = {
                ...example.requestBodyV3,
                value: enhancedReq
            };
        }

        if (responseChanged && example.responseBodyV3) {
            enhancedExample.responseBody = enhancedRes;
            enhancedExample.responseBodyV3 = {
                ...example.responseBodyV3,
                value: enhancedRes
            };
        }

        stats.count++;
        context.logger.info(`Successfully enhanced example for ${endpoint.method} ${example.path}`);
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

function deepEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) {
        return true;
    }

    if (a === null || b === null || a === undefined || b === undefined) {
        return a === b;
    }

    if (typeof a !== typeof b) {
        return false;
    }

    if (typeof a !== "object") {
        return false;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }
        return a.every((item, index) => deepEqual(item, b[index]));
    }

    if (Array.isArray(a) || Array.isArray(b)) {
        return false;
    }

    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;

    const aKeys = Object.keys(aObj).sort();
    const bKeys = Object.keys(bObj).sort();

    if (aKeys.length !== bKeys.length) {
        return false;
    }

    if (!aKeys.every((key, index) => key === bKeys[index])) {
        return false;
    }

    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
}
