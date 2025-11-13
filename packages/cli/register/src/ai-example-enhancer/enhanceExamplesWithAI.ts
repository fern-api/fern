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
import { AIExampleEnhancerConfig, ExampleEnhancementBatchRequest } from "./types";
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

            // Check if it's an OpenAPI spec
            if (!isOpenApiSpec(specContent)) {
                context.logger.info("Non-OpenAPI spec detected, skipping AI example enhancement");
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
        sourceFilePath
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
    openApiSpec?: string,
    sourceFilePath?: AbsoluteFilePath
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

    // Process all work items in batches (up to 10 per batch)
    const enhancementResults = await processBatchedWorkItems(
        allWorkItems,
        enhancer,
        context,
        organizationId,
        stats,
        enhancedExampleRecords,
        openApiSpec,
        sourceFilePath
    );

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

interface RetryStrategy {
    optimalBatchSize: number;
    useOpenApiSpec: boolean;
    timeoutCount: number;
}

async function processBatchedWorkItems(
    allWorkItems: (EndpointWorkItem & { packageId?: string })[],
    enhancer: LambdaExampleEnhancer,
    context: TaskContext,
    organizationId: string,
    stats: { count: number; total: number },
    enhancedExampleRecords: EnhancedExampleRecord[],
    openApiSpec?: string,
    sourceFilePath?: AbsoluteFilePath
): Promise<Map<string, { enhancedReq?: unknown; enhancedRes?: unknown }>> {
    const enhancementResults = new Map<string, { enhancedReq?: unknown; enhancedRes?: unknown }>();

    // Adaptive retry strategy - starts optimistic, learns from failures
    const retryStrategy: RetryStrategy = {
        optimalBatchSize: 10,
        useOpenApiSpec: !!openApiSpec,
        timeoutCount: 0
    };

    let i = 0;
    while (i < allWorkItems.length) {
        const currentBatchSize = Math.min(retryStrategy.optimalBatchSize, allWorkItems.length - i);
        const batch = allWorkItems.slice(i, i + currentBatchSize);

        const batchNumber = Math.floor(i / 10) + 1; // Use original batch size for numbering
        context.logger.debug(
            `Processing batch ${batchNumber} with ${batch.length} endpoints (strategy: size=${retryStrategy.optimalBatchSize}, spec=${retryStrategy.useOpenApiSpec})`
        );

        let prunedOpenApiSpec: string | undefined;
        if (openApiSpec && retryStrategy.useOpenApiSpec) {
            // Collect all endpoints for this batch
            const endpointsForBatch = batch.map((item) => ({
                path: item.example.path,
                method: item.endpoint.method
            }));

            prunedOpenApiSpec = await pruneOpenAPISpecForBatch(openApiSpec, endpointsForBatch, context);
        } else if (openApiSpec && !retryStrategy.useOpenApiSpec) {
            context.logger.debug("Skipping OpenAPI spec due to previous timeouts (retry strategy adaptation)");
        }

        const batchRequest = {
            openApiSpec: prunedOpenApiSpec,
            endpoints: batch.map((item) => ({
                method: item.endpoint.method,
                endpointPath: item.example.path,
                organizationId,
                operationSummary: item.endpoint.summary,
                operationDescription: item.endpoint.description,
                originalRequestExample: extractExampleValue(item.example.requestBodyV3),
                originalResponseExample: extractExampleValue(item.example.responseBodyV3)
            }))
        };

        // Adaptive retry with strategy adjustments
        let batchSuccess = false;
        let lastError: Error | undefined;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                // Adjust strategy based on attempt
                if (attempt === 2 && !batchSuccess) {
                    // Attempt 2: Reduce batch size if we had a timeout
                    if (lastError?.message.includes("timeout") || lastError?.message.includes("aborted")) {
                        const newBatchSize = Math.max(2, Math.floor(retryStrategy.optimalBatchSize / 2));
                        context.logger.debug(
                            `Attempt ${attempt}: Reducing batch size from ${retryStrategy.optimalBatchSize} to ${newBatchSize} due to timeout`
                        );

                        // If we need to reduce the batch, split and retry
                        if (newBatchSize < batch.length) {
                            retryStrategy.optimalBatchSize = newBatchSize;
                            retryStrategy.timeoutCount++;
                            // Process this batch with reduced size
                            const reducedBatch = batch.slice(0, newBatchSize);
                            const remainingItems = batch.slice(newBatchSize);

                            // Update the batch for this attempt
                            const reducedBatchRequest = {
                                ...batchRequest,
                                endpoints: reducedBatch.map((item) => ({
                                    method: item.endpoint.method,
                                    endpointPath: item.example.path,
                                    organizationId,
                                    operationSummary: item.endpoint.summary,
                                    operationDescription: item.endpoint.description,
                                    originalRequestExample: extractExampleValue(item.example.requestBodyV3),
                                    originalResponseExample: extractExampleValue(item.example.responseBodyV3)
                                }))
                            };

                            const batchResponse = await enhancer.enhanceExamplesBatch(reducedBatchRequest);
                            await processBatchResponse(
                                reducedBatch,
                                batchResponse,
                                enhancementResults,
                                enhancedExampleRecords,
                                stats,
                                context
                            );

                            // Save results incrementally after successful reduced batch
                            if (sourceFilePath && enhancedExampleRecords.length > 0) {
                                try {
                                    await writeAiExamplesOverride({
                                        enhancedExamples: enhancedExampleRecords,
                                        sourceFilePath,
                                        context
                                    });
                                    context.logger.debug(
                                        `Saved ${enhancedExampleRecords.length} examples to ai_overrides after reduced batch completion`
                                    );
                                } catch (error) {
                                    context.logger.warn(`Failed to save incremental results: ${error}`);
                                }
                            }

                            // Add remaining items back to the queue
                            allWorkItems.splice(i + currentBatchSize, 0, ...remainingItems);
                            batchSuccess = true;
                            break;
                        }
                    }
                } else if (attempt === 3 && !batchSuccess) {
                    // Attempt 3: Further reduce batch size (to single endpoint)
                    if (batch.length > 1) {
                        context.logger.debug(
                            `Attempt ${attempt}: Reducing to single endpoint due to repeated failures`
                        );
                        retryStrategy.optimalBatchSize = 1;
                        retryStrategy.timeoutCount++;

                        // Process only the first endpoint
                        const singleBatch = batch.slice(0, 1);
                        const remainingItems = batch.slice(1);

                        // Update the batch for this attempt (keep OpenAPI spec)
                        const singleBatchRequest = {
                            ...batchRequest,
                            endpoints: singleBatch.map((item) => ({
                                method: item.endpoint.method,
                                endpointPath: item.example.path,
                                organizationId,
                                operationSummary: item.endpoint.summary,
                                operationDescription: item.endpoint.description,
                                originalRequestExample: extractExampleValue(item.example.requestBodyV3),
                                originalResponseExample: extractExampleValue(item.example.responseBodyV3)
                            }))
                        };

                        const batchResponse = await enhancer.enhanceExamplesBatch(singleBatchRequest);
                        await processBatchResponse(
                            singleBatch,
                            batchResponse,
                            enhancementResults,
                            enhancedExampleRecords,
                            stats,
                            context
                        );

                        // Save results incrementally after successful single batch
                        if (sourceFilePath && enhancedExampleRecords.length > 0) {
                            try {
                                await writeAiExamplesOverride({
                                    enhancedExamples: enhancedExampleRecords,
                                    sourceFilePath,
                                    context
                                });
                                context.logger.debug(
                                    `Saved ${enhancedExampleRecords.length} examples to ai_overrides after single batch completion`
                                );
                            } catch (error) {
                                context.logger.warn(`Failed to save incremental results: ${error}`);
                            }
                        }

                        // Add remaining items back to the queue
                        allWorkItems.splice(i + currentBatchSize, 0, ...remainingItems);
                        batchSuccess = true;
                        break;
                    }
                }

                const batchResponse = await enhancer.enhanceExamplesBatch(batchRequest);
                await processBatchResponse(
                    batch,
                    batchResponse,
                    enhancementResults,
                    enhancedExampleRecords,
                    stats,
                    context
                );
                batchSuccess = true;

                // Save results incrementally after each successful batch
                if (sourceFilePath && enhancedExampleRecords.length > 0) {
                    try {
                        await writeAiExamplesOverride({
                            enhancedExamples: enhancedExampleRecords,
                            sourceFilePath,
                            context
                        });
                        context.logger.debug(
                            `Saved ${enhancedExampleRecords.length} examples to ai_overrides after batch completion`
                        );
                    } catch (error) {
                        context.logger.warn(`Failed to save incremental results: ${error}`);
                    }
                }
                break;
            } catch (error) {
                lastError = error as Error;
                const isTimeout =
                    error instanceof Error && (error.message.includes("timeout") || error.message.includes("aborted"));

                context.logger.warn(`Batch attempt ${attempt} failed${isTimeout ? " (timeout)" : ""}: ${error}`);

                if (attempt === 3) {
                    // Skip endpoints that fail after all attempts with OpenAPI spec
                    context.logger.warn(`Skipping batch after 3 attempts (keeping OpenAPI spec requirement): ${error}`);
                }
            }
        }

        if (!batchSuccess) {
            context.logger.warn(`Skipping batch of ${batch.length} endpoints after all retry attempts failed`);
        } else {
            // Batch size recovery: gradually increase batch size after successful attempts
            const originalOptimalSize = 10;
            if (retryStrategy.optimalBatchSize < originalOptimalSize) {
                const newBatchSize = Math.min(originalOptimalSize, retryStrategy.optimalBatchSize + 1);
                if (newBatchSize > retryStrategy.optimalBatchSize) {
                    context.logger.debug(
                        `Batch successful - increasing batch size from ${retryStrategy.optimalBatchSize} to ${newBatchSize}`
                    );
                    retryStrategy.optimalBatchSize = newBatchSize;
                }
            }
        }

        // Move to next batch
        i += currentBatchSize;
    }

    return enhancementResults;
}

async function processBatchResponse(
    batch: (EndpointWorkItem & { packageId?: string })[],
    // biome-ignore lint/suspicious/noExplicitAny: batch response structure is dynamic
    batchResponse: any,
    enhancementResults: Map<string, { enhancedReq?: unknown; enhancedRes?: unknown }>,
    enhancedExampleRecords: EnhancedExampleRecord[],
    stats: { count: number; total: number },
    context: TaskContext
): Promise<void> {
    for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const result = batchResponse.results[j];

        if (!item) {
            continue;
        }

        if (result && !result.error) {
            enhancementResults.set(item.endpointKey, {
                enhancedReq: result.enhancedRequestExample,
                enhancedRes: result.enhancedResponseExample
            });

            // Create enhanced example record
            const enhancedExampleRecord: EnhancedExampleRecord = {
                endpoint: item.example.path,
                method: item.endpoint.method,
                pathParameters: item.example.pathParameters,
                queryParameters: item.example.queryParameters,
                headers: item.example.headers,
                requestBody:
                    result.enhancedRequestExample !== extractExampleValue(item.example.requestBodyV3)
                        ? result.enhancedRequestExample
                        : undefined,
                responseBody:
                    result.enhancedResponseExample !== extractExampleValue(item.example.responseBodyV3)
                        ? result.enhancedResponseExample
                        : undefined
            };

            if (enhancedExampleRecord.requestBody !== undefined || enhancedExampleRecord.responseBody !== undefined) {
                enhancedExampleRecords.push(enhancedExampleRecord);
                stats.count++;
                context.logger.info(`Successfully enhanced example for ${item.endpoint.method} ${item.example.path}`);
            }
        } else if (result?.error) {
            context.logger.warn(`Failed to enhance ${item.endpoint.method} ${item.example.path}: ${result.error}`);
        }
    }
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
    // This function is now deprecated - keeping for compatibility
    // New batching logic is in enhancePackageExamples
    const workItems = collectWorkItems(pkg, coveredEndpoints);
    const endpointMap = new Map<string, EndpointV3>();

    for (const item of workItems) {
        endpointMap.set(item.endpointKey, item.endpoint);
    }

    stats.total += workItems.length;

    context.logger.debug(
        `Package has ${pkg.endpoints.length} total endpoints, ${workItems.length} work items after filtering`
    );

    const batchSize = 10;
    const enhancementResults = new Map<string, { enhancedReq?: unknown; enhancedRes?: unknown }>();

    for (let i = 0; i < workItems.length; i += batchSize) {
        const batch = workItems.slice(i, Math.min(i + batchSize, workItems.length));

        context.logger.debug(`Processing batch ${Math.floor(i / batchSize) + 1} with ${batch.length} endpoints`);

        let prunedOpenApiSpec: string | undefined;
        if (openApiSpec) {
            const endpointSelectors = batch.map((item) => ({
                path: item.example.path,
                method: item.endpoint.method
            }));
            prunedOpenApiSpec = await pruneOpenAPISpecForBatch(openApiSpec, endpointSelectors, context);
        }

        const batchRequest: ExampleEnhancementBatchRequest = {
            openApiSpec: prunedOpenApiSpec,
            endpoints: batch.map((item) => ({
                endpointPath: item.example.path,
                method: item.endpoint.method,
                organizationId,
                operationSummary: item.endpoint.summary,
                operationDescription: item.endpoint.description,
                originalRequestExample: extractExampleValue(item.example.requestBodyV3),
                originalResponseExample: extractExampleValue(item.example.responseBodyV3)
            }))
        };

        try {
            const batchResponse = await enhancer.enhanceExamplesBatch(batchRequest);

            for (let j = 0; j < batch.length; j++) {
                const item = batch[j];
                const result = batchResponse.results[j];

                if (!item) {
                    continue;
                }

                if (result && !result.error) {
                    enhancementResults.set(item.endpointKey, {
                        enhancedReq: result.enhancedRequestExample,
                        enhancedRes: result.enhancedResponseExample
                    });
                } else if (result?.error) {
                    context.logger.warn(
                        `Failed to enhance ${item.endpoint.method} ${item.example.path}: ${result.error}`
                    );
                }
            }
        } catch (error) {
            context.logger.warn(`Batch enhancement failed: ${error}`);
        }
    }

    // Apply results to endpoints
    const enhancedEndpoints = pkg.endpoints.map((endpoint) => {
        const endpointV3 = endpoint as unknown as EndpointV3;

        const enhancedExamples = endpointV3.examples.map((example) => {
            const endpointKey = `${endpointV3.method.toLowerCase()}:${example.path}`;
            const result = enhancementResults.get(endpointKey);

            if (!result) {
                return example;
            }

            const originalRequestExample = extractExampleValue(example.requestBodyV3);
            const originalResponseExample = extractExampleValue(example.responseBodyV3);

            const requestChanged =
                result.enhancedReq !== undefined && !deepEqual(result.enhancedReq, originalRequestExample);
            const responseChanged =
                result.enhancedRes !== undefined && !deepEqual(result.enhancedRes, originalResponseExample);

            if (!requestChanged && !responseChanged) {
                context.logger.debug(`AI returned no changes for ${endpointV3.method} ${example.path}`);
                return example;
            }

            const enhancedExampleRecord: EnhancedExampleRecord = {
                endpoint: example.path,
                method: endpointV3.method,
                pathParameters: example.pathParameters,
                queryParameters: example.queryParameters,
                headers: example.headers,
                requestBody: requestChanged ? result.enhancedReq : undefined,
                responseBody: responseChanged ? result.enhancedRes : undefined
            };
            enhancedExampleRecords.push(enhancedExampleRecord);

            const enhancedExample: ExampleV3 = { ...example };

            if (requestChanged && example.requestBodyV3) {
                enhancedExample.requestBody = result.enhancedReq;
                enhancedExample.requestBodyV3 = {
                    ...example.requestBodyV3,
                    value: result.enhancedReq
                };
            }

            if (responseChanged && example.responseBodyV3) {
                enhancedExample.responseBody = result.enhancedRes;
                enhancedExample.responseBodyV3 = {
                    ...example.responseBodyV3,
                    value: result.enhancedRes
                };
            }

            stats.count++;
            context.logger.info(`Successfully enhanced example for ${endpointV3.method} ${example.path}`);
            return enhancedExample;
        });

        return {
            ...endpointV3,
            examples: enhancedExamples
        };
    });

    return {
        ...pkg,
        endpoints: enhancedEndpoints as unknown as FdrCjsSdk.api.v1.register.EndpointDefinition[]
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
