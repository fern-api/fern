import { generatorsYml } from "@fern-api/configuration";
import { replaceEnvVariables } from "@fern-api/core-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";

function githubPublishInfo(invocation: generatorsYml.GeneratorInvocation): FernFiddle.GithubPublishInfo | undefined {
    const outputMode = invocation.outputMode;
    if (outputMode.type === "github") {
        return outputMode.publishInfo;
    }
    if (outputMode.type === "githubV2") {
        return outputMode.githubV2.publishInfo;
    }
    return undefined;
}

/**
 * NuGet and RubyGems are the registries whose GitHub `api-key` names a repository secret rather
 * than carrying a credential, so they are the only ones held back from substitution.
 */
function namesWorkflowSecret(
    publishInfo: FernFiddle.GithubPublishInfo
): publishInfo is FernFiddle.GithubPublishInfo.Nuget | FernFiddle.GithubPublishInfo.Rubygems {
    return publishInfo.type === "nuget" || publishInfo.type === "rubygems";
}

/** The `api-key` expression to hold back, or undefined when there is nothing to preserve. */
function workflowApiKeyExpression(invocation: generatorsYml.GeneratorInvocation): string | undefined {
    const publishInfo = githubPublishInfo(invocation);
    if (publishInfo == null || !namesWorkflowSecret(publishInfo)) {
        return undefined;
    }
    return publishInfo.apiKey;
}

/** Rebuilds the invocation with `update` applied to whichever GitHub output mode carries publish info. */
function withGithubPublishInfo(
    invocation: generatorsYml.GeneratorInvocation,
    update: (publishInfo: FernFiddle.GithubPublishInfo) => FernFiddle.GithubPublishInfo
): generatorsYml.GeneratorInvocation {
    const outputMode = invocation.outputMode;
    if (outputMode.type === "github" && outputMode.publishInfo != null) {
        return { ...invocation, outputMode: { ...outputMode, publishInfo: update(outputMode.publishInfo) } };
    }
    if (outputMode.type === "githubV2" && outputMode.githubV2.publishInfo != null) {
        return {
            ...invocation,
            outputMode: {
                ...outputMode,
                githubV2: { ...outputMode.githubV2, publishInfo: update(outputMode.githubV2.publishInfo) }
            }
        };
    }
    return invocation;
}

function withApiKey(
    publishInfo: FernFiddle.GithubPublishInfo,
    apiKey: string | undefined
): FernFiddle.GithubPublishInfo {
    if (!namesWorkflowSecret(publishInfo)) {
        return publishInfo;
    }
    return { ...publishInfo, apiKey };
}

/**
 * Substitutes environment variables in a generator invocation, except for a GitHub NuGet or
 * RubyGems `api-key`.
 *
 * That value names a repository secret the generated release workflow reads; it is not a local
 * credential. Substituting it would demand a local environment variable that by design only exists
 * as a GitHub secret, failing generation outright under the default `--require-env-vars`, and it
 * would replace the one thing sdk-gen-api needs with a key it must never receive. So the expression
 * is held back across substitution and restored afterwards.
 *
 * Only sdk-gen-api gets the expression. Any generator that falls back to Fiddle is handed the
 * substituted value again by `substituteWorkflowApiKey`, so the legacy route behaves as before.
 * Fern's generated C# workflow reads `api-key` only to choose between trusted publishing and its
 * `NUGET_API_TOKEN` secret, unless the expression survives to `getGeneratorConfig`, which would
 * turn it into the workflow's secret name. That is why the legacy route must not see it.
 */
export function replaceEnvVariablesPreservingWorkflowApiKey(
    invocation: generatorsYml.GeneratorInvocation,
    context: { onError: (message?: string) => unknown | void | never },
    options: { substituteAsEmpty?: boolean } = {}
): generatorsYml.GeneratorInvocation {
    const apiKey = workflowApiKeyExpression(invocation);
    if (apiKey == null) {
        return replaceEnvVariables(invocation, context, options);
    }
    const held = withGithubPublishInfo(invocation, (publishInfo) => withApiKey(publishInfo, undefined));
    const resolved = replaceEnvVariables(held, context, options);
    return withGithubPublishInfo(resolved, (publishInfo) => withApiKey(publishInfo, apiKey));
}

/**
 * The counterpart for generation that does not go through sdk-gen-api. Fiddle has no use for the
 * secret name and reads `api-key` the way it always did, so its invocation gets the substituted
 * value. Without this, a legacy C# run would start naming `MY_NUGET_KEY` as its workflow secret
 * instead of falling back to `NUGET_API_TOKEN`, and a RubyGems run would hand Fiddle a `${...}`.
 */
export function substituteWorkflowApiKey(
    invocation: generatorsYml.GeneratorInvocation,
    context: { onError: (message?: string) => unknown | void | never },
    options: { substituteAsEmpty?: boolean } = {}
): generatorsYml.GeneratorInvocation {
    const apiKey = workflowApiKeyExpression(invocation);
    if (apiKey == null) {
        return invocation;
    }
    const substituted = replaceEnvVariables(apiKey, context, options);
    return withGithubPublishInfo(invocation, (publishInfo) => withApiKey(publishInfo, substituted));
}
