import { FernToken } from "@fern-api/auth";
import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { type EndpointSelector, type HttpMethod, OpenAPIPruner } from "@fern-api/openapi-pruner";
import { TaskContext } from "@fern-api/task-context";
import boxen from "boxen";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import * as yaml from "js-yaml";
import { OpenAPIV3 } from "openapi-types";
import { join } from "path";
import { LambdaExampleEnhancer } from "./lambdaClient";
import { SpinnerStatusCoordinator } from "./spinnerStatusCoordinator";
import { AIExampleEnhancerConfig } from "./types";
import {
    EnhancedExampleRecord,
    loadExistingOverrideCoverage,
    writeAiExamplesOverride
} from "./writeAiExamplesOverride";

// Circuit breaker for AI enhancement to prevent excessive failures
class CircuitBreaker {
    private failureCount = 0;
    private readonly failureThreshold = 30;
    private isOpen = false;

    public recordFailure(): void {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold) {
            this.isOpen = true;
        }
    }

    public recordSuccess(): void {
        // Reset on success to allow recovery
        this.failureCount = 0;
        this.isOpen = false;
    }

    public shouldSkip(): boolean {
        return this.isOpen;
    }

    public getFailureCount(): number {
        return this.failureCount;
    }

    public getThreshold(): number {
        return this.failureThreshold;
    }
}

// Static flag to ensure the informative message is only logged once per process
let hasLoggedInfoMessage = false;

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

interface EndpointWorkItem {
    endpoint: EndpointV3;
    example: ExampleV3;
    endpointKey: string;
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

function isOpenApiSpec(specContent: string): boolean {
    try {
        // Try parsing as JSON first
        try {
            const jsonSpec = JSON.parse(specContent);
            return !!(jsonSpec.openapi || jsonSpec.swagger);
        } catch {
            // Fall back to YAML
            const yamlSpec = yaml.load(specContent) as Record<string, unknown>;
            return !!(yamlSpec?.openapi || yamlSpec?.swagger);
        }
    } catch {
        return false;
    }
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
        context.logger.debug(`Failed to write pruned spec to file: ${error}`);
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

async function pruneOpenAPISpecForBatch(
    openApiSpecContent: string,
    endpointSelectors: Array<{ path: string; method: string }>,
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

        // Map each endpoint to its OpenAPI path template
        const mappedSelectors: EndpointSelector[] = [];
        for (const selector of endpointSelectors) {
            const matchingPath = findMatchingOpenAPIPath(selector.path, availablePaths);
            if (matchingPath) {
                mappedSelectors.push({
                    path: matchingPath,
                    method: selector.method.toLowerCase() as HttpMethod
                });
                context.logger.debug(`Mapped ${selector.path} to OpenAPI path: ${matchingPath}`);
            } else {
                context.logger.debug(`No matching OpenAPI path found for ${selector.path}`);
            }
        }

        if (mappedSelectors.length === 0) {
            context.logger.debug("No endpoints matched in OpenAPI spec");
            return undefined;
        }

        // Prune the spec to just these endpoints
        const pruner = new OpenAPIPruner({
            document: parsedSpec,
            endpoints: mappedSelectors
        });

        const result = pruner.prune();

        context.logger.debug(
            `Pruned OpenAPI spec for batch: ${result.statistics.originalEndpoints} → ${result.statistics.prunedEndpoints} endpoints, ` +
                `${result.statistics.originalSchemas} → ${result.statistics.prunedSchemas} schemas`
        );

        // Convert back to JSON string
        const prunedSpecJson = JSON.stringify(result.document, null, 2);

        // Check if pruned spec is still too large (1.5MB limit)
        if (prunedSpecJson.length > 1500000) {
            context.logger.debug(
                `Pruned OpenAPI spec still too large (${prunedSpecJson.length} characters), skipping spec context for AI enhancement`
            );
            return undefined;
        }

        context.logger.debug(`Pruned spec size: ${prunedSpecJson.length} characters (within limit)`);

        // Create descriptive filename for the batch
        const endpointNames = mappedSelectors.map(
            (s) => `${(s.method || "unknown").toUpperCase()}_${s.path.replace(/\//g, "_").replace(/[{}]/g, "")}`
        );
        const filename = `batch_${mappedSelectors.length}endpoints_${endpointNames.join("_").substring(0, 100)}_pruned_spec.yaml`;

        // Write to file for inspection - DISABLED
        // await writeSpecToFile(prunedSpecJson, filename, context);

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
    sourceFilePath?: AbsoluteFilePath,
    apiName?: string
): Promise<FdrCjsSdk.api.v1.register.ApiDefinition> {
    if (!config.enabled) {
        context.logger.debug("AI example enhancement is disabled");
        return apiDefinition;
    }

    // Log informative message only once per process
    if (!hasLoggedInfoMessage) {
        const message =
            chalk.blue("Notice: new feature added (experimental)!\n\n") +
            "We are generating realistic examples for endpoints in your spec.\n" +
            "This will not override your current examples. Please wait a moment.\n\n" +
            "Future runs will use saved examples. If you wish to override the content of the\n" +
            "examples, please edit and commit auto-generated `ai_examples_override.yml` files.";
        const boxedMessage = boxen(message, {
            padding: 1,
            textAlignment: "left",
            borderColor: "blue",
            borderStyle: "round"
        });
        context.logger.info("\n" + boxedMessage + "\n");
        hasLoggedInfoMessage = true;
    }

    const enhancer = new LambdaExampleEnhancer(config, context, token);
    const circuitBreaker = new CircuitBreaker();

    const coveredEndpoints =
        sourceFilePath != null ? await loadExistingOverrideCoverage(sourceFilePath, context) : new Set<string>();

    let openApiSpec: string | undefined;
    if (sourceFilePath != null) {
        try {
            const specContent = await readFile(sourceFilePath, "utf-8");

            // Check if it's an OpenAPI spec
            if (!isOpenApiSpec(specContent)) {
                context.logger.debug("Non-OpenAPI spec detected, skipping AI example enhancement");
                return apiDefinition;
            }

            openApiSpec = specContent;
            context.logger.debug(`Loaded OpenAPI spec (${specContent.length} characters) for AI enhancement`);
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
        openApiSpec,
        sourceFilePath,
        apiName,
        circuitBreaker
    );

    if (enhancedExampleRecords.length > 0 && sourceFilePath != null) {
        try {
            await writeAiExamplesOverride({
                enhancedExamples: enhancedExampleRecords,
                sourceFilePath,
                context
            });
        } catch (error) {
            context.logger.debug(`Failed to write AI examples override file: ${error}`);
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
    openApiSpec?: string,
    sourceFilePath?: AbsoluteFilePath,
    apiName?: string,
    circuitBreaker?: CircuitBreaker
): Promise<FdrCjsSdk.api.v1.register.ApiDefinition> {
    // Collect all work items from all packages first
    const allWorkItems: (EndpointWorkItem & { packageId?: string })[] = [];

    // Collect from subpackages
    for (const [packageId, subpackage] of Object.entries(apiDefinition.subpackages)) {
        const packageWorkItems = collectWorkItems(
            subpackage as unknown as FdrCjsSdk.api.v1.register.ApiDefinitionPackage,
            coveredEndpoints
        );
        allWorkItems.push(...packageWorkItems.map((item) => ({ ...item, packageId })));
    }

    // Collect from root package
    const rootWorkItems = collectWorkItems(apiDefinition.rootPackage, coveredEndpoints);
    allWorkItems.push(...rootWorkItems.map((item) => ({ ...item, packageId: "root" })));

    stats.total += allWorkItems.length;
    context.logger.debug(`Collected ${allWorkItems.length} work items across all packages`);

    const coordinator = SpinnerStatusCoordinator.getInstance();
    const statusId = coordinator.create(apiName || "API", allWorkItems.length);

    const apiStats = { count: 0, total: allWorkItems.length };

    const enhancementResults = await processEndpointsConcurrently(
        allWorkItems,
        enhancer,
        context,
        organizationId,
        stats,
        enhancedExampleRecords,
        openApiSpec,
        sourceFilePath,
        statusId,
        apiStats,
        circuitBreaker
    );

    coordinator.finish(statusId);

    // Apply results back to packages
    const enhancedSubpackages: Record<string, FdrCjsSdk.api.v1.register.ApiDefinitionSubpackage> = {};

    for (const [packageId, subpackage] of Object.entries(apiDefinition.subpackages)) {
        const enhancedPackage = applyEnhancementResults(
            subpackage as unknown as FdrCjsSdk.api.v1.register.ApiDefinitionPackage,
            enhancementResults
        );
        enhancedSubpackages[packageId] =
            enhancedPackage as unknown as FdrCjsSdk.api.v1.register.ApiDefinitionSubpackage;
    }

    const enhancedRootPackage = applyEnhancementResults(apiDefinition.rootPackage, enhancementResults);

    return {
        ...apiDefinition,
        subpackages: enhancedSubpackages,
        rootPackage: enhancedRootPackage
    };
}

function collectWorkItems(
    pkg: FdrCjsSdk.api.v1.register.ApiDefinitionPackage,
    coveredEndpoints: Set<string>
): EndpointWorkItem[] {
    const workItems: EndpointWorkItem[] = [];

    for (const endpoint of pkg.endpoints) {
        const endpointV3 = endpoint as unknown as EndpointV3;

        for (const example of endpointV3.examples) {
            const endpointKey = `${endpointV3.method.toLowerCase()}:${example.path}`;

            if (coveredEndpoints.has(endpointKey)) {
                continue;
            }

            if (!isExampleAutogenerated(example)) {
                continue;
            }

            const originalRequestExample = extractExampleValue(example.requestBodyV3);
            const originalResponseExample = extractExampleValue(example.responseBodyV3);
            if (!originalRequestExample && !originalResponseExample) {
                continue;
            }

            workItems.push({
                endpoint: endpointV3,
                example,
                endpointKey
            });
            break; // Only process first autogenerated example per endpoint
        }
    }

    return workItems;
}

async function processEndpointsConcurrently(
    allWorkItems: (EndpointWorkItem & { packageId?: string })[],
    enhancer: LambdaExampleEnhancer,
    context: TaskContext,
    organizationId: string,
    stats: { count: number; total: number },
    enhancedExampleRecords: EnhancedExampleRecord[],
    openApiSpec?: string,
    sourceFilePath?: AbsoluteFilePath,
    statusId?: string,
    apiStats?: { count: number; total: number },
    circuitBreaker?: CircuitBreaker
): Promise<Map<string, { enhancedReq?: unknown; enhancedRes?: unknown }>> {
    const enhancementResults = new Map<string, { enhancedReq?: unknown; enhancedRes?: unknown }>();

    // Process endpoints concurrently (1 Lambda call per endpoint)
    const maxConcurrentRequests = parseInt(process.env.FERN_AI_MAX_CONCURRENT || "25", 10);

    context.logger.debug(
        `Processing ${allWorkItems.length} endpoints with max ${maxConcurrentRequests} concurrent Lambda calls`
    );

    // Check circuit breaker before processing
    if (circuitBreaker?.shouldSkip()) {
        context.logger.debug(
            `Circuit breaker is open after ${circuitBreaker.getFailureCount()} failures (threshold: ${circuitBreaker.getThreshold()}). Skipping AI enhancement for remaining endpoints.`
        );
        return enhancementResults;
    }

    // Process all work items concurrently in chunks
    for (let i = 0; i < allWorkItems.length; i += maxConcurrentRequests) {
        const chunk = allWorkItems.slice(i, i + maxConcurrentRequests);
        const chunkNumber = Math.floor(i / maxConcurrentRequests) + 1;

        context.logger.debug(`Processing chunk ${chunkNumber} with ${chunk.length} endpoints concurrently`);

        // Check circuit breaker before processing each chunk
        if (circuitBreaker?.shouldSkip()) {
            context.logger.debug(`Circuit breaker opened during processing. Stopping at chunk ${chunkNumber}.`);
            break;
        }

        // Process each endpoint concurrently
        const endpointPromises = chunk.map((workItem, index) =>
            processEndpoint(
                workItem,
                enhancer,
                context,
                organizationId,
                stats,
                enhancedExampleRecords,
                openApiSpec,
                sourceFilePath,
                statusId,
                apiStats,
                i + index + 1,
                circuitBreaker
            )
        );

        // Wait for all endpoints in this chunk to complete
        const results = await Promise.allSettled(endpointPromises);

        // Process results
        for (let j = 0; j < results.length; j++) {
            const result = results[j];
            if (!result) {
                continue;
            }

            if (result.status === "fulfilled" && result.value) {
                const { endpointKey, enhancedReq, enhancedRes } = result.value;
                enhancementResults.set(endpointKey, { enhancedReq, enhancedRes });
            } else if (result.status === "rejected") {
                context.logger.debug(`Endpoint ${i + j + 1} failed: ${result.reason}`);
            }
        }

        // Save incrementally after each chunk
        if (sourceFilePath && enhancedExampleRecords.length > 0) {
            try {
                await writeAiExamplesOverride({
                    enhancedExamples: enhancedExampleRecords,
                    sourceFilePath,
                    context
                });
                context.logger.debug(`Saved ${enhancedExampleRecords.length} examples after chunk ${chunkNumber}`);
            } catch (error) {
                context.logger.debug(`Failed to save incremental results: ${error}`);
            }
        }
    }

    return enhancementResults;
}

async function processEndpoint(
    workItem: EndpointWorkItem & { packageId?: string },
    enhancer: LambdaExampleEnhancer,
    context: TaskContext,
    organizationId: string,
    stats: { count: number; total: number },
    enhancedExampleRecords: EnhancedExampleRecord[],
    openApiSpec?: string,
    sourceFilePath?: AbsoluteFilePath,
    statusId?: string,
    apiStats?: { count: number; total: number },
    endpointNumber?: number,
    circuitBreaker?: CircuitBreaker
): Promise<{ endpointKey: string; enhancedReq?: unknown; enhancedRes?: unknown } | null> {
    const endpointKey = workItem.endpointKey;

    context.logger.debug(`Processing endpoint ${endpointNumber}: ${workItem.endpoint.method} ${workItem.example.path}`);

    // Prune OpenAPI spec for just this endpoint
    let prunedOpenApiSpec: string | undefined;
    if (openApiSpec) {
        prunedOpenApiSpec = await pruneOpenAPISpecForBatch(
            openApiSpec,
            [{ path: workItem.example.path, method: workItem.endpoint.method }],
            context
        );
    }

    // Create single-endpoint request
    const request = {
        method: workItem.endpoint.method,
        endpointPath: workItem.example.path,
        organizationId,
        operationSummary: workItem.endpoint.summary,
        operationDescription: workItem.endpoint.description,
        originalRequestExample: extractExampleValue(workItem.example.requestBodyV3),
        originalResponseExample: extractExampleValue(workItem.example.responseBodyV3),
        pathParameters: workItem.example.pathParameters,
        queryParameters: workItem.example.queryParameters,
        headers: workItem.example.headers,
        openApiSpec: prunedOpenApiSpec
    };

    // Simple retry (2 attempts max) - Lambda client handles retries internally but we add one more layer
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const result = await enhancer.enhanceExample(request);

            // Record success in circuit breaker
            circuitBreaker?.recordSuccess();

            // Check if anything was actually enhanced
            const requestChanged = result.enhancedRequestExample !== request.originalRequestExample;
            const responseChanged = result.enhancedResponseExample !== request.originalResponseExample;

            if (requestChanged || responseChanged) {
                // Create enhanced example record
                const enhancedExampleRecord: EnhancedExampleRecord = {
                    endpoint: workItem.example.path,
                    method: workItem.endpoint.method,
                    pathParameters: workItem.example.pathParameters,
                    queryParameters: workItem.example.queryParameters,
                    headers: workItem.example.headers,
                    requestBody: requestChanged ? result.enhancedRequestExample : undefined,
                    responseBody: responseChanged ? result.enhancedResponseExample : undefined
                };

                enhancedExampleRecords.push(enhancedExampleRecord);
                stats.count++;
                if (apiStats) {
                    apiStats.count++;
                }
                context.logger.debug(`Successfully enhanced ${workItem.endpoint.method} ${workItem.example.path}`);

                // Update progress
                if (statusId && apiStats) {
                    const coordinator = SpinnerStatusCoordinator.getInstance();
                    coordinator.update(statusId, apiStats.count);
                }

                return {
                    endpointKey,
                    enhancedReq: result.enhancedRequestExample,
                    enhancedRes: result.enhancedResponseExample
                };
            }

            // If nothing changed, still return success (just no enhancement needed)
            context.logger.debug(`No changes needed for ${workItem.endpoint.method} ${workItem.example.path}`);
            return {
                endpointKey,
                enhancedReq: result.enhancedRequestExample,
                enhancedRes: result.enhancedResponseExample
            };
        } catch (error) {
            // Record failure in circuit breaker
            circuitBreaker?.recordFailure();

            context.logger.debug(
                `Endpoint ${workItem.endpoint.method} ${workItem.example.path} attempt ${attempt} failed: ${error}`
            );

            if (attempt < 2) {
                // Simple backoff before retry
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
        }
    }

    // All attempts failed
    context.logger.debug(`Failed to enhance ${workItem.endpoint.method} ${workItem.example.path} after all attempts`);
    return null;
}

function applyEnhancementResults(
    pkg: FdrCjsSdk.api.v1.register.ApiDefinitionPackage,
    enhancementResults: Map<string, { enhancedReq?: unknown; enhancedRes?: unknown }>
): FdrCjsSdk.api.v1.register.ApiDefinitionPackage {
    const enhancedEndpoints = pkg.endpoints.map((endpoint) => {
        const endpointV3 = endpoint as unknown as EndpointV3;

        const enhancedExamples = endpointV3.examples.map((example) => {
            const endpointKey = `${endpointV3.method.toLowerCase()}:${example.path}`;
            const enhancementResult = enhancementResults.get(endpointKey);

            if (enhancementResult) {
                const enhancedExample: ExampleV3 = {
                    ...example
                };

                if (enhancementResult.enhancedReq !== undefined && example.requestBodyV3) {
                    enhancedExample.requestBody = enhancementResult.enhancedReq;
                    enhancedExample.requestBodyV3 = {
                        ...example.requestBodyV3,
                        value: enhancementResult.enhancedReq
                    };
                }

                if (enhancementResult.enhancedRes !== undefined && example.responseBodyV3) {
                    enhancedExample.responseBody = enhancementResult.enhancedRes;
                    enhancedExample.responseBodyV3 = {
                        ...example.responseBodyV3,
                        value: enhancementResult.enhancedRes
                    };
                }

                return enhancedExample;
            }

            return example;
        });

        return {
            ...endpoint,
            examples: enhancedExamples
        } as unknown as FdrCjsSdk.api.v1.register.EndpointDefinition;
    });

    return {
        ...pkg,
        endpoints: enhancedEndpoints
    };
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
