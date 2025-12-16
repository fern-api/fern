import { FernToken } from "@fern-api/auth";
import { Examples } from "@fern-api/core-utils";
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
import { removeInvalidAiExamples, validateAiExamplesFromFile } from "./validateAiExamples";
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

    // Wrap the entire AI enhancement pipeline in try-catch to prevent CLI crashes
    try {
        return await performAIEnhancement(
            apiDefinition,
            config,
            context,
            token,
            organizationId,
            sourceFilePath,
            apiName
        );
    } catch (error) {
        context.logger.debug(
            `AI example enhancement failed with error: ${error}. Continuing with original API definition to prevent CLI crash.`
        );
        context.logger.debug(
            `Full AI enhancement error stack: ${error instanceof Error ? error.stack : String(error)}`
        );

        // Return original API definition to ensure CLI can continue
        return apiDefinition;
    }
}

async function performAIEnhancement(
    apiDefinition: FdrCjsSdk.api.v1.register.ApiDefinition,
    config: AIExampleEnhancerConfig,
    context: TaskContext,
    token: FernToken,
    organizationId: string,
    sourceFilePath?: AbsoluteFilePath,
    apiName?: string
): Promise<FdrCjsSdk.api.v1.register.ApiDefinition> {
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

    const enhancer = new LambdaExampleEnhancer(config, context, token, organizationId);
    const circuitBreaker = new CircuitBreaker();

    let openApiSpec: string | undefined;
    let endpointsNeedingRegeneration = new Set<string>();

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

            // Load original coverage before cleanup to know which endpoints to preserve
            const originalCoveredEndpoints = await loadExistingOverrideCoverage(sourceFilePath, context);

            // Clean up stale AI examples before processing
            try {
                const validationResult = await validateAiExamplesFromFile({
                    sourceFilePath,
                    context
                });

                if (validationResult.invalidCount > 0) {
                    // Track which endpoints had invalid examples removed
                    for (const { example } of validationResult.invalidExamples) {
                        const endpointKey = `${example.method.toLowerCase()}:${example.endpointPath}`;
                        endpointsNeedingRegeneration.add(endpointKey);
                    }

                    const cleanupResult = await removeInvalidAiExamples({
                        sourceFilePath,
                        context
                    });

                    context.logger.info(
                        `Removed ${cleanupResult.removedCount} stale AI examples, ${endpointsNeedingRegeneration.size} endpoints will be regenerated`
                    );
                } else {
                    context.logger.debug("No stale AI examples found to remove");
                }
            } catch (error) {
                context.logger.debug(`Failed to clean up stale AI examples: ${error}`);
            }
        } catch (error) {
            context.logger.debug(`Failed to read OpenAPI spec file: ${error}`);
        }
    }

    // Create final coverage set: exclude endpoints that need regeneration from original coverage
    let coveredEndpoints = new Set<string>();
    if (sourceFilePath != null) {
        const currentCoveredEndpoints = await loadExistingOverrideCoverage(sourceFilePath, context);

        // Only include endpoints in coverage if they weren't removed due to being stale
        for (const endpoint of currentCoveredEndpoints) {
            if (!endpointsNeedingRegeneration.has(endpoint)) {
                coveredEndpoints.add(endpoint);
            }
        }

        if (endpointsNeedingRegeneration.size > 0) {
            context.logger.debug(
                `Coverage adjusted: ${currentCoveredEndpoints.size} total, ${coveredEndpoints.size} preserved, ${endpointsNeedingRegeneration.size} marked for regeneration`
            );
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
        endpointsNeedingRegeneration,
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

    // Log final statistics including total endpoint count
    const finalTotalEndpointCount = countTotalEndpoints(enhancedApiDefinition);
    context.logger.debug(
        `AI Enhancement Summary - Total endpoints in API: ${finalTotalEndpointCount}, Enhanced: ${examplesEnhanced.count}/${examplesEnhanced.total}, Covered: ${coveredEndpoints.size}`
    );

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
    endpointsNeedingRegeneration: Set<string>,
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
            coveredEndpoints,
            endpointsNeedingRegeneration,
            context
        );
        allWorkItems.push(...packageWorkItems.map((item) => ({ ...item, packageId })));
    }

    // Collect from root package
    const rootWorkItems = collectWorkItems(
        apiDefinition.rootPackage,
        coveredEndpoints,
        endpointsNeedingRegeneration,
        context
    );
    allWorkItems.push(...rootWorkItems.map((item) => ({ ...item, packageId: "root" })));

    // Count total endpoints for logging
    const totalEndpointCount = countTotalEndpoints(apiDefinition);

    stats.total += allWorkItems.length;
    context.logger.debug(
        `AI Examples Enhancement: ${allWorkItems.length} endpoints need enhancement out of ${totalEndpointCount} total endpoints (${coveredEndpoints.size} already covered)`
    );
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

    // Log completion summary
    context.logger.debug(
        `AI Examples Enhancement Complete: ${apiStats?.count || 0}/${allWorkItems.length} endpoints enhanced successfully (${totalEndpointCount} total endpoints in API)`
    );

    return {
        ...apiDefinition,
        subpackages: enhancedSubpackages,
        rootPackage: enhancedRootPackage
    };
}

function countTotalEndpoints(apiDefinition: FdrCjsSdk.api.v1.register.ApiDefinition): number {
    let totalCount = 0;

    // Count endpoints in root package
    totalCount += apiDefinition.rootPackage.endpoints.length;

    // Count endpoints in all subpackages
    for (const subpackage of Object.values(apiDefinition.subpackages)) {
        totalCount += (subpackage as unknown as FdrCjsSdk.api.v1.register.ApiDefinitionPackage).endpoints.length;
    }

    return totalCount;
}

function collectWorkItems(
    pkg: FdrCjsSdk.api.v1.register.ApiDefinitionPackage,
    coveredEndpoints: Set<string>,
    endpointsNeedingRegeneration?: Set<string>,
    context?: TaskContext
): EndpointWorkItem[] {
    const workItems: EndpointWorkItem[] = [];
    const processedEndpoints = new Set<string>();

    // Tracking for filtering statistics
    const filteringStats = {
        totalEndpoints: pkg.endpoints.length,
        alreadyCovered: 0,
        notAutogenerated: 0,
        noExistingExamples: 0,
        alreadyProcessed: 0,
        noExamples: 0,
        processed: 0
    };

    for (const endpoint of pkg.endpoints) {
        const endpointV3 = endpoint as unknown as EndpointV3;

        // Check if endpoint already has human-specified examples in v2Examples
        const hasHumanExamples = hasUserSpecifiedV2Examples(endpointV3);
        if (hasHumanExamples) {
            // Skip this endpoint - it already has human examples that shouldn't be overridden
            continue;
        }

        for (const example of endpointV3.examples) {
            const endpointKey = `${endpointV3.method.toLowerCase()}:${example.path}`;

            // Skip if we already processed this endpoint
            if (processedEndpoints.has(endpointKey)) {
                filteringStats.alreadyProcessed++;
                context?.logger.debug(
                    `Endpoint ${endpointV3.method.toUpperCase()} ${example.path} skipped: already processed in this run`
                );
                continue;
            }

            // Force regeneration for stale endpoints, even if they have coverage
            const needsRegeneration = endpointsNeedingRegeneration?.has(endpointKey);

            if (!needsRegeneration && coveredEndpoints.has(endpointKey)) {
                filteringStats.alreadyCovered++;
                context?.logger.debug(
                    `Endpoint ${endpointV3.method.toUpperCase()} ${example.path} skipped: already covered (has AI-enhanced examples)`
                );
                continue;
            }

            if (!needsRegeneration && !isExampleAutogenerated(example, context, endpointKey)) {
                filteringStats.notAutogenerated++;
                context?.logger.debug(
                    `Endpoint ${endpointV3.method.toUpperCase()} ${example.path} skipped: has human-written examples (not auto-generated)`
                );
                continue;
            }

            const originalRequestExample = extractExampleValue(example.requestBodyV3);
            const originalResponseExample = extractExampleValue(example.responseBodyV3);

            // For stale endpoints, we allow regeneration even without existing examples
            if (!needsRegeneration && !originalRequestExample && !originalResponseExample) {
                filteringStats.noExistingExamples++;
                context?.logger.debug(
                    `Endpoint ${endpointV3.method.toUpperCase()} ${example.path} skipped: no existing request/response examples to enhance`
                );
                continue;
            }

            workItems.push({
                endpoint: endpointV3,
                example,
                endpointKey
            });

            filteringStats.processed++;
            context?.logger.debug(
                `Endpoint ${endpointV3.method.toUpperCase()} ${example.path} selected for AI enhancement`
            );

            processedEndpoints.add(endpointKey);
            break; // Only process first example per endpoint
        }
    }

    // Log filtering statistics summary
    if (context) {
        context.logger.debug(
            `Endpoint Filtering Results: ${filteringStats.processed}/${filteringStats.totalEndpoints} endpoints selected for AI enhancement`
        );
        context.logger.debug(
            `Filtering breakdown - Already covered: ${filteringStats.alreadyCovered}, ` +
                `Not auto-generated: ${filteringStats.notAutogenerated}, ` +
                `No existing examples: ${filteringStats.noExistingExamples}, ` +
                `No examples at all: ${filteringStats.noExamples}, ` +
                `Already processed: ${filteringStats.alreadyProcessed}, ` +
                `Selected: ${filteringStats.processed}`
        );
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

function isExampleAutogenerated(example: ExampleV3, context?: TaskContext, endpointKey?: string): boolean {
    // Use percentage-based detection: if at least 30% of values are auto-generated, consider it auto-generated
    const AUTOGENERATION_THRESHOLD = 0.3;

    const requestValue = extractExampleValue(example.requestBodyV3);
    const responseValue = extractExampleValue(example.responseBodyV3);

    const requestStats = countAutogeneratedValues(requestValue, context, `${endpointKey}:request`);
    const responseStats = countAutogeneratedValues(responseValue, context, `${endpointKey}:response`);

    const totalValues = requestStats.total + responseStats.total;
    const autogeneratedValues = requestStats.autogenerated + responseStats.autogenerated;

    // Handle edge case where there are no values at all
    if (totalValues === 0) {
        return true; // Consider empty/null examples as auto-generated
    }

    const autogeneratedPercentage = autogeneratedValues / totalValues;
    const isAutogenerated = autogeneratedPercentage >= AUTOGENERATION_THRESHOLD;

    if (context && endpointKey) {
        if (isAutogenerated) {
            context.logger.debug(
                `Endpoint ${endpointKey} considered auto-generated: ${autogeneratedValues}/${totalValues} (${(autogeneratedPercentage * 100).toFixed(1)}%) values are generic`
            );
        } else {
            context.logger.debug(
                `Endpoint ${endpointKey} flagged as human-written: only ${autogeneratedValues}/${totalValues} (${(autogeneratedPercentage * 100).toFixed(1)}%) values are generic (threshold: ${AUTOGENERATION_THRESHOLD * 100}%)`
            );
        }
    }

    return isAutogenerated;
}

function countAutogeneratedValues(
    obj: unknown,
    context?: TaskContext,
    path?: string
): { autogenerated: number; total: number } {
    if (obj === null || obj === undefined) {
        return { autogenerated: 0, total: 0 }; // Don't count null/undefined as values
    }

    if (typeof obj === "string") {
        const isGeneric =
            obj === Examples.STRING ||
            obj === Examples.BASE64 ||
            obj === Examples.DATE ||
            obj === Examples.DATE_TIME ||
            obj === Examples.UUID ||
            obj === Examples.BIG_INTEGER ||
            Examples.SAMPLE_STRINGS.includes(obj) ||
            obj === ""; // Keep empty string as generic

        if (!isGeneric && context && path) {
            context.logger.debug(`Non-generic string found at ${path}: "${obj}"`);
        }

        return { autogenerated: isGeneric ? 1 : 0, total: 1 };
    }

    if (typeof obj === "number") {
        const isGeneric =
            obj === Examples.DOUBLE ||
            obj === Examples.FLOAT ||
            obj === Examples.INT ||
            obj === Examples.INT64 ||
            obj === Examples.UINT ||
            obj === Examples.UINT64 ||
            obj === 0; // Keep 0 as generic

        if (!isGeneric && context && path) {
            context.logger.debug(`Non-generic number found at ${path}: ${obj}`);
        }

        return { autogenerated: isGeneric ? 1 : 0, total: 1 };
    }

    if (typeof obj === "boolean") {
        const isGeneric = obj === Examples.BOOLEAN;

        if (!isGeneric && context && path) {
            context.logger.debug(`Non-generic boolean found at ${path}: ${obj}`);
        }

        return { autogenerated: isGeneric ? 1 : 0, total: 1 };
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return { autogenerated: 0, total: 0 }; // Empty arrays don't contribute to the count
        }

        let totalAutogenerated = 0;
        let totalValues = 0;

        obj.forEach((item, index) => {
            const itemStats = countAutogeneratedValues(item, context, path ? `${path}[${index}]` : undefined);
            totalAutogenerated += itemStats.autogenerated;
            totalValues += itemStats.total;
        });

        return { autogenerated: totalAutogenerated, total: totalValues };
    }

    if (typeof obj === "object") {
        let totalAutogenerated = 0;
        let totalValues = 0;

        Object.entries(obj).forEach(([key, value]) => {
            const valueStats = countAutogeneratedValues(value, context, path ? `${path}.${key}` : undefined);
            totalAutogenerated += valueStats.autogenerated;
            totalValues += valueStats.total;
        });

        return { autogenerated: totalAutogenerated, total: totalValues };
    }

    if (context && path) {
        context.logger.debug(`Unknown type at ${path}: ${typeof obj} = ${obj}`);
    }

    // Unknown types count as non-generic
    return { autogenerated: 0, total: 1 };
}

function isFromAutogeneratedValues(obj: unknown, context?: TaskContext, path?: string): boolean {
    if (obj === null || obj === undefined) {
        return true;
    }

    if (typeof obj === "string") {
        const isGeneric =
            obj === Examples.STRING ||
            obj === Examples.BASE64 ||
            obj === Examples.DATE ||
            obj === Examples.DATE_TIME ||
            obj === Examples.UUID ||
            obj === Examples.BIG_INTEGER ||
            Examples.SAMPLE_STRINGS.includes(obj) ||
            obj === ""; // Keep empty string as generic

        if (!isGeneric && context && path) {
            context.logger.debug(`Non-generic string found at ${path}: "${obj}"`);
        }
        return isGeneric;
    }

    if (typeof obj === "number") {
        const isGeneric =
            obj === Examples.DOUBLE ||
            obj === Examples.FLOAT ||
            obj === Examples.INT ||
            obj === Examples.INT64 ||
            obj === Examples.UINT ||
            obj === Examples.UINT64 ||
            obj === 0; // Keep 0 as generic

        if (!isGeneric && context && path) {
            context.logger.debug(`Non-generic number found at ${path}: ${obj}`);
        }
        return isGeneric;
    }

    if (typeof obj === "boolean") {
        const isGeneric = obj === Examples.BOOLEAN;

        if (!isGeneric && context && path) {
            context.logger.debug(`Non-generic boolean found at ${path}: ${obj}`);
        }
        return isGeneric;
    }

    if (Array.isArray(obj)) {
        // All items in array must be autogenerated values for array to be considered autogenerated
        if (obj.length === 0) {
            return true;
        }

        const allGeneric = obj.every((item, index) =>
            isFromAutogeneratedValues(item, context, path ? `${path}[${index}]` : undefined)
        );

        if (!allGeneric && context && path) {
            context.logger.debug(`Array at ${path} contains non-generic values`);
        }

        return allGeneric;
    }

    if (typeof obj === "object") {
        // All values in object must be autogenerated for object to be considered autogenerated
        const entries = Object.entries(obj);
        const allGeneric = entries.every(([key, value]) =>
            isFromAutogeneratedValues(value, context, path ? `${path}.${key}` : undefined)
        );

        if (!allGeneric && context && path) {
            context.logger.debug(`Object at ${path} contains non-generic values`);
        }

        return allGeneric;
    }

    if (context && path) {
        context.logger.debug(`Unknown type at ${path}: ${typeof obj} = ${obj}`);
    }

    return false;
}

/**
 * Check if an endpoint has user-specified examples in v2Examples structure.
 * This prevents AI enhancement from overriding human-provided OpenAPI examples.
 */
function hasUserSpecifiedV2Examples(endpointV3: EndpointV3): boolean {
    try {
        // Cast to any to access v2Examples properties that aren't in the type definition
        // biome-ignore lint/suspicious/noExplicitAny: accessing v2Examples properties not in type definition
        const endpoint = endpointV3 as any;

        // Check if endpoint has v2Examples structure with user-specified examples
        if (
            endpoint.v2Examples?.userSpecifiedExamples &&
            typeof endpoint.v2Examples.userSpecifiedExamples === "object"
        ) {
            const userExamples = endpoint.v2Examples.userSpecifiedExamples;
            return Object.keys(userExamples).length > 0;
        }

        // Also check v2Responses for user-specified examples (response-specific examples)
        if (endpoint.v2Responses?.responses) {
            for (const response of endpoint.v2Responses.responses) {
                if (
                    response.body?.v2Examples?.userSpecifiedExamples &&
                    typeof response.body.v2Examples.userSpecifiedExamples === "object"
                ) {
                    const responseUserExamples = response.body.v2Examples.userSpecifiedExamples;
                    if (Object.keys(responseUserExamples).length > 0) {
                        return true;
                    }
                }
            }
        }

        return false;
    } catch (error) {
        // If there's any error checking the structure, default to false (allow AI enhancement)
        return false;
    }
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
