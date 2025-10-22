import { FernVenusApi } from "@fern-api/fern-venus-sdk";
import { ApiRegistrationCacheKey, ApiRegistrationCacheValue, CacheManager } from "@fern-api/generation-caching";
import { TaskContext } from "@fern-api/task-context";
import * as crypto from "crypto";

export interface RegisterApiWithCacheArgs {
    fdr: FernVenusApi.GeneratorsClient;
    orgId: FernVenusApi.OrgId;
    apiId: FernVenusApi.ApiId;
    definition: any; // FdrApiDefinition
    sources?: any; // FdrApiDefinitionSources
    context: TaskContext;
    cacheEnabled?: boolean;
}

/**
 * Register API definition with FDR service, with caching to avoid duplicate registrations.
 * This function wraps the FDR registerApiDefinition call with a cache layer.
 */
export async function registerApiWithCache({
    fdr,
    orgId,
    apiId,
    definition,
    sources,
    context,
    cacheEnabled = true
}: RegisterApiWithCacheArgs): Promise<{
    apiDefinitionId: string;
    sourceUploads?: any;
}> {
    // If caching is disabled, call FDR directly
    if (!cacheEnabled) {
        const response = await fdr.api.v1.register.registerApiDefinition({
            orgId,
            apiId,
            definition,
            sources
        });

        if (!response.ok) {
            throw new Error(`Failed to register API definition: ${JSON.stringify(response.error.content)}`);
        }

        return {
            apiDefinitionId: response.body.apiDefinitionId,
            sourceUploads: response.body.sources
        };
    }

    const cacheManager = new CacheManager({}, context);

    // Prepare cache key inputs
    const cacheKeyInputs: ApiRegistrationCacheKey = {
        orgId: orgId,
        apiId: apiId,
        apiDefinitionHash: hashObject(definition),
        sourcesHash: sources ? hashObject(sources) : undefined
    };

    // Try to get cached registration
    const cachedRegistration = cacheManager.getCachedApiRegistration(cacheKeyInputs);
    if (cachedRegistration != null) {
        context.logger.debug(`Using cached API registration for ${apiId}`);
        return cachedRegistration;
    }

    // Register with FDR if not cached
    context.logger.debug(`Registering API definition for ${apiId}...`);
    const startTime = Date.now();

    const response = await fdr.api.v1.register.registerApiDefinition({
        orgId,
        apiId,
        definition,
        sources
    });

    const duration = Date.now() - startTime;
    context.logger.debug(`API registration took ${duration}ms`);

    if (!response.ok) {
        throw new Error(`Failed to register API definition: ${JSON.stringify(response.error.content)}`);
    }

    const result: ApiRegistrationCacheValue = {
        apiDefinitionId: response.body.apiDefinitionId,
        sourceUploads: response.body.sources
    };

    // Cache the result
    cacheManager.setCachedApiRegistration(cacheKeyInputs, result);

    return result;
}

/**
 * Create a consistent hash for any object
 */
function hashObject(obj: any): string {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(obj, Object.keys(obj).sort()));
    return hash.digest("hex");
}
