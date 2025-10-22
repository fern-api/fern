import { APIV1Write } from "@fern-api/fdr-sdk";
import { ApiRegistrationCacheKey, ApiRegistrationCacheValue, CacheManager } from "@fern-api/generation-caching";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import * as crypto from "crypto";

export interface PlaygroundConfig {
    oauth?: any;
}

export type RegisterApiFn = (opts: {
    ir: IntermediateRepresentation;
    snippetsConfig: APIV1Write.SnippetsConfig;
    playgroundConfig?: PlaygroundConfig;
    apiName?: string;
    workspace?: FernWorkspace;
}) => Promise<string> | string;

export interface CreateCachedRegisterApiFnArgs {
    originalRegisterApiFn: RegisterApiFn;
    taskContext: TaskContext;
    orgId: string;
    cacheEnabled?: boolean;
}

/**
 * Creates a cached version of a registerApi function.
 * This wrapper adds caching to avoid duplicate API registrations for the same inputs.
 */
export function createCachedRegisterApiFn({
    originalRegisterApiFn,
    taskContext,
    orgId,
    cacheEnabled = true
}: CreateCachedRegisterApiFnArgs): RegisterApiFn {
    return async (opts) => {
        const { ir, snippetsConfig, playgroundConfig, apiName, workspace } = opts;

        // If caching is disabled, call original function directly
        if (!cacheEnabled) {
            const result = await originalRegisterApiFn(opts);
            return result;
        }

        const cacheManager = new CacheManager({}, taskContext);

        // Create cache key based on all inputs that affect the registration
        const cacheKeyInputs: ApiRegistrationCacheKey = {
            orgId,
            apiId: apiName ?? ir.apiName.originalName,
            apiDefinitionHash: hashIrForRegistration(ir),
            sourcesHash: hashRegistrationInputs({
                snippetsConfig,
                playgroundConfig,
                apiName,
                workspaceId: workspace?.workspaceId
            })
        };

        // Try to get cached registration
        const cachedRegistration = cacheManager.getCachedApiRegistration(cacheKeyInputs);
        if (cachedRegistration != null) {
            taskContext.logger.debug(`Using cached API registration for ${apiName ?? ir.apiName.originalName}`);
            return cachedRegistration.apiDefinitionId;
        }

        // Register API if not cached
        taskContext.logger.debug(`Registering API ${apiName ?? ir.apiName.originalName}...`);
        const startTime = Date.now();

        const apiDefinitionId = await originalRegisterApiFn(opts);

        const duration = Date.now() - startTime;
        taskContext.logger.debug(`API registration took ${duration}ms`);

        // Cache the result
        const result: ApiRegistrationCacheValue = {
            apiDefinitionId,
            sourceUploads: undefined // docs flow doesn't use source uploads
        };

        cacheManager.setCachedApiRegistration(cacheKeyInputs, result);

        return apiDefinitionId;
    };
}

/**
 * Create a hash of the IR that focuses on the parts relevant to API registration.
 * This excludes volatile data like timestamps but includes the core API definition.
 */
function hashIrForRegistration(ir: IntermediateRepresentation): string {
    // Create a stable representation of the IR for hashing
    const relevantParts = {
        apiName: ir.apiName,
        apiDisplayName: ir.apiDisplayName,
        apiDocs: ir.apiDocs,
        auth: ir.auth,
        headers: ir.headers,
        idempotencyHeaders: ir.idempotencyHeaders,
        types: ir.types,
        services: ir.services,
        webhookGroups: ir.webhookGroups,
        websocketChannels: ir.websocketChannels,
        errors: ir.errors,
        subpackages: ir.subpackages,
        rootPackage: ir.rootPackage,
        constants: ir.constants,
        environments: ir.environments,
        basePath: ir.basePath,
        pathParameters: ir.pathParameters,
        errorDiscriminationStrategy: ir.errorDiscriminationStrategy,
        sdkConfig: ir.sdkConfig
        // Exclude: fdrApiDefinitionId, sourceConfig, readmeConfig (these can vary)
    };

    return hashObject(relevantParts);
}

/**
 * Hash the additional registration inputs (snippetsConfig, playgroundConfig, etc.)
 */
function hashRegistrationInputs(inputs: {
    snippetsConfig: APIV1Write.SnippetsConfig;
    playgroundConfig?: PlaygroundConfig;
    apiName?: string;
    workspaceId?: string;
}): string {
    return hashObject(inputs);
}

/**
 * Create a consistent hash for any object
 */
function hashObject(obj: any): string {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(obj, Object.keys(obj || {}).sort()));
    return hash.digest("hex");
}
