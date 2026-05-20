import type { PublishTarget } from "@fern-api/remote-workspace-runner";

import type { GeneratorRunCounts } from "../commands/automations/generate/GeneratorRunResult.js";
import type { JsonValue } from "./automationTelemetryEvent.js";

export type GeneratorFailureSource = "fiddle" | "cli";

export type GeneratorCompletedOutcome = "pr_created" | "no_diff" | "published" | "pushed";

export function generatorIdentityAttributes(args: {
    generatorName: string;
    groupName: string;
    apiName: string | undefined;
    sdkRepoUrl: string | undefined;
}): Record<string, JsonValue> {
    return {
        generator_name: args.generatorName,
        group_name: args.groupName,
        ...(args.apiName != null ? { api_name: args.apiName } : {}),
        ...(args.sdkRepoUrl != null ? { sdk_repo_url: args.sdkRepoUrl } : {})
    };
}

export function deriveGeneratorCompletedOutcome(args: {
    pullRequestUrl: string | undefined;
    noChangesDetected: boolean | undefined;
    publishTarget: PublishTarget | undefined;
}): GeneratorCompletedOutcome {
    if (args.noChangesDetected === true) {
        return "no_diff";
    }
    if (args.pullRequestUrl != null) {
        return "pr_created";
    }
    if (args.publishTarget != null) {
        return "published";
    }
    return "pushed";
}

export function generatorCompletedAttributes(args: {
    generatorName: string;
    groupName: string;
    apiName: string | undefined;
    sdkRepoUrl: string | undefined;
    version: string | null;
    pullRequestUrl: string | undefined;
    noChangesDetected: boolean | undefined;
    publishTarget: PublishTarget | undefined;
}): Record<string, JsonValue> {
    return {
        ...generatorIdentityAttributes(args),
        outcome: deriveGeneratorCompletedOutcome(args),
        ...(args.version != null ? { version: args.version } : {}),
        ...(args.pullRequestUrl != null ? { pull_request_url: args.pullRequestUrl } : {}),
        ...(args.noChangesDetected === true ? { no_diff_skipped: true } : {}),
        ...(args.publishTarget != null ? { publish_target: args.publishTarget.registry } : {})
    };
}

export function generatorFailedAttributes(args: {
    generatorName: string;
    groupName: string;
    apiName: string | undefined;
    sdkRepoUrl: string | undefined;
    errorMessage: string;
    failureSource: GeneratorFailureSource;
}): Record<string, JsonValue> {
    return {
        ...generatorIdentityAttributes(args),
        error_message: args.errorMessage,
        failure_source: args.failureSource
    };
}

export function generatorSkippedAttributes(args: {
    generatorName: string;
    groupName: string;
    apiName: string | undefined;
    sdkRepoUrl: string | undefined;
    skipReason: string;
}): Record<string, JsonValue> {
    return {
        ...generatorIdentityAttributes(args),
        skip_reason: args.skipReason
    };
}

export function generationRunAttributes(counts: GeneratorRunCounts): Record<string, JsonValue> {
    return {
        succeeded: counts.succeeded,
        failed: counts.failed,
        skipped: counts.skipped
    };
}
