import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { Audiences, generatorsYml } from "@fern-api/configuration";
import { CacheManager, IRCacheKey } from "@fern-api/generation-caching";
import { dynamic, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { SourceResolver } from "@fern-api/source-resolver";
import { TaskContext } from "@fern-api/task-context";
import { generateIntermediateRepresentation } from "./generateIntermediateRepresentation";

export declare namespace generateIntermediateRepresentationWithCache {
    interface Args {
        workspace: FernWorkspace;
        generationLanguage: generatorsYml.GenerationLanguage | undefined;
        keywords: string[] | undefined;
        smartCasing: boolean;
        exampleGeneration: {
            disabled: boolean;
            includeOptionalRequestPropertyExamples?: boolean;
            skipAutogenerationIfManualExamplesExist?: boolean;
            skipErrorAutogenerationIfManualErrorExamplesExist?: boolean;
        };
        audiences: Audiences;
        readme: generatorsYml.ReadmeSchema | undefined;
        packageName: string | undefined;
        version: string | undefined;
        context: TaskContext;
        sourceResolver: SourceResolver;
        fdrApiDefinitionId?: string;
        disableDynamicExamples?: boolean;
        dynamicGeneratorConfig?: dynamic.GeneratorConfig;
        cacheEnabled?: boolean;
    }
}

/**
 * Generate intermediate representation with caching support.
 * This function wraps the original generateIntermediateRepresentation with a cache layer
 * to avoid regenerating IR for identical inputs.
 */
export function generateIntermediateRepresentationWithCache(
    args: generateIntermediateRepresentationWithCache.Args
): IntermediateRepresentation {
    const {
        workspace,
        generationLanguage,
        keywords,
        smartCasing,
        exampleGeneration,
        audiences,
        context,
        cacheEnabled = true,
        ...rest
    } = args;

    // If caching is disabled, call original function directly
    if (!cacheEnabled) {
        return generateIntermediateRepresentation(args);
    }

    const cacheManager = new CacheManager({}, context);

    // Prepare cache key inputs
    const cacheKeyInputs: IRCacheKey = {
        workspace,
        generationLanguage,
        keywords: keywords ? new Set(keywords) : undefined,
        smartCasing,
        audiences,
        disableExamples: exampleGeneration.disabled
    };

    // Try to get cached IR
    const cachedIR = cacheManager.getCachedIR(cacheKeyInputs);
    if (cachedIR != null) {
        return cachedIR;
    }

    // Generate new IR if not cached
    const startTime = Date.now();
    const ir = generateIntermediateRepresentation(args);
    const duration = Date.now() - startTime;

    context.logger.debug(`IR generation took ${duration}ms`);

    // Cache the result
    cacheManager.setCachedIR(cacheKeyInputs, ir);

    return ir;
}

/**
 * Backward compatibility - export the original function with the same name
 * but with caching enabled by default.
 */
export function generateIntermediateRepresentationCached(
    args: generateIntermediateRepresentation.Args
): IntermediateRepresentation {
    return generateIntermediateRepresentationWithCache({ ...args, cacheEnabled: true });
}
