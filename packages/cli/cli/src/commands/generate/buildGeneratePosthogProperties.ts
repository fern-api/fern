import { type FernToken, type FernUserToken, getUserIdFromToken } from "@fern-api/auth";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import type { Project } from "@fern-api/project-loader";
import type { FernSdkConfigV1Payload } from "@fern-api/remote-workspace-runner";
import type { AbstractAPIWorkspace } from "@fern-api/workspace-loader";

import { expandGroupFilter } from "./expandGroupFilter.js";
import { filterGenerators } from "./filterGenerators.js";
import { buildAutomationTargeting, selectGeneratorsForAutomation } from "./selectGeneratorsForAutomation.js";

/** The subset of a planned generation needed to describe it in telemetry. */
export interface GenerationTelemetryInput {
    kind: "legacy" | "sdk-config";
    workspace: Pick<AbstractAPIWorkspace<unknown>, "workspaceName" | "generatorsConfiguration">;
    resolvedGroupNames: string[];
    generatorName?: string;
    generatorIndex?: number;
    /** SDK Config generations carry the targets whose requested outputs describe real delivery. */
    sdkConfigV1?: Pick<FernSdkConfigV1Payload, "targets">;
}

/** One generator that `fern generate` is about to run. */
export interface RequestedGeneratorTelemetry {
    workspace: string | undefined;
    kind: GenerationTelemetryInput["kind"];
    group: string;
    name: string;
    version: string;
    outputMode: string;
}

export type GenerateAuthType = "user" | "organization" | "none";

export interface GeneratePosthogProperties {
    /** Retained unchanged for existing dashboards; prefer `requestedGenerators` for new analysis. */
    workspaces: ReturnType<typeof buildPosthogWorkspaces>;
    /** Every generator selected to run, after group, alias, `--generator`, and SDK Config resolution. */
    requestedGenerators: RequestedGeneratorTelemetry[];
    /** Unique, sorted generator names from `requestedGenerators`, for simple PostHog breakdowns. */
    generatorNames: string[];
    /** Which credential authenticated the generation request. */
    authType: GenerateAuthType;
    /** The Fern user ID when a user token authenticated the request; undefined for org tokens. */
    userId: string | undefined;
    /** Whether the `FERN_USE_SDK_GEN_API` environment variable was explicitly set to `true`. */
    fernUseSdkGenApiEnv: boolean;
    /** Whether sdk-gen-api routing is enabled after applying the env var and the build default. */
    sdkGenApiEnabled: boolean;
}

export function buildGeneratePosthogProperties({
    project,
    generations,
    isAutomation,
    groupNames,
    generatorName,
    token,
    fernUseSdkGenApiEnv,
    sdkGenApiEnabled
}: {
    project: Project;
    generations: GenerationTelemetryInput[];
    /** `fern automations generate` drops opted-out generators; report only those that will run. */
    isAutomation: boolean;
    groupNames: string[] | undefined;
    generatorName: string | undefined;
    token: FernToken | undefined;
    fernUseSdkGenApiEnv: string | undefined;
    sdkGenApiEnabled: boolean;
}): GeneratePosthogProperties {
    const requestedGenerators = generations.flatMap((generation) => getRequestedGenerators(generation, isAutomation));
    return {
        workspaces: buildPosthogWorkspaces({ project, groupNames, generatorName }),
        requestedGenerators,
        generatorNames: [...new Set(requestedGenerators.map(({ name }) => name))].sort(),
        ...getAuthProperties(token),
        fernUseSdkGenApiEnv: isTrueEnvValue(fernUseSdkGenApiEnv),
        sdkGenApiEnabled
    };
}

function getRequestedGenerators(
    generation: GenerationTelemetryInput,
    isAutomation: boolean
): RequestedGeneratorTelemetry[] {
    const groups =
        generation.workspace.generatorsConfiguration?.groups.filter((group) =>
            generation.resolvedGroupNames.includes(group.groupName)
        ) ?? [];
    return groups.flatMap((group) => {
        const filtered = filterGenerators({
            generators: group.generators,
            generatorName: generation.generatorName,
            generatorIndex: generation.generatorIndex,
            groupName: group.groupName
        });
        if (!filtered.ok) {
            return [];
        }
        const generators = isAutomation
            ? getAutomationGenerators(generation, filtered.generators)
            : filtered.generators;
        return generators.map((generator) => ({
            workspace: generation.workspace.workspaceName,
            kind: generation.kind,
            group: group.groupName,
            name: generator.name,
            version: generator.version,
            outputMode: getOutputMode(generation, generator)
        }));
    });
}

function getAutomationGenerators(
    generation: GenerationTelemetryInput,
    generators: generatorsYml.GeneratorInvocation[]
): generatorsYml.GeneratorInvocation[] {
    const selection = selectGeneratorsForAutomation({
        generators,
        rootAutorelease: generation.workspace.generatorsConfiguration?.rawConfiguration.autorelease,
        targeting: buildAutomationTargeting({
            generatorIndex: generation.generatorIndex,
            generatorName: generation.generatorName
        })
    });
    switch (selection.type) {
        case "run":
            return selection.generators;
        case "reject-opted-out":
        case "empty-after-skip":
            return [];
        default:
            assertNever(selection);
    }
}

/**
 * SDK Config workspaces use placeholder `downloadFiles` invocations, so their real delivery comes
 * from the matching target's requested output (`download`, `github`, or `publish`).
 */
function getOutputMode(generation: GenerationTelemetryInput, generator: generatorsYml.GeneratorInvocation): string {
    if (generation.kind === "legacy" || generator.sdkConfigTargetIndex == null) {
        return generator.outputMode.type;
    }
    return generation.sdkConfigV1?.targets[generator.sdkConfigTargetIndex]?.requestedOutput?.type ?? "download";
}

function getAuthProperties(token: FernToken | undefined): Pick<GeneratePosthogProperties, "authType" | "userId"> {
    if (token == null) {
        return { authType: "none", userId: undefined };
    }
    switch (token.type) {
        case "user":
            return { authType: "user", userId: tryGetUserIdFromToken(token) };
        case "organization":
            return { authType: "organization", userId: undefined };
        default:
            assertNever(token);
    }
}

/** Telemetry must never fail generation, so a token that cannot be decoded reports no user ID. */
function tryGetUserIdFromToken(token: FernUserToken): string | undefined {
    try {
        return getUserIdFromToken(token);
    } catch {
        return undefined;
    }
}

function isTrueEnvValue(value: string | undefined): boolean {
    return value?.trim().toLowerCase() === "true";
}

/** Builds the legacy `workspaces` array for the posthog event, honoring `--group` / `--generator` filters. */
function buildPosthogWorkspaces({
    project,
    groupNames,
    generatorName
}: {
    project: Project;
    groupNames: string[] | undefined;
    generatorName: string | undefined;
}): Array<{
    name: string | undefined;
    group: string | string[] | undefined;
    generators:
        | Array<
              Array<{
                  name: string;
                  version: string;
                  outputMode: string;
                  config: generatorsYml.GeneratorInvocation["config"];
              }>
          >
        | undefined;
}> {
    return project.apiWorkspaces.map((workspace) => {
        const resolvedGroupNames = expandGroupFilter(groupNames, workspace.generatorsConfiguration);
        return {
            name: workspace.workspaceName,
            group: groupNames != null && groupNames.length === 1 ? groupNames[0] : groupNames,
            generators: workspace.generatorsConfiguration?.groups
                .filter((group) => resolvedGroupNames == null || resolvedGroupNames.includes(group.groupName))
                .map((group) =>
                    group.generators
                        .filter((generator) => generatorName == null || generator.name === generatorName)
                        .map((generator) => ({
                            name: generator.name,
                            version: generator.version,
                            outputMode: generator.outputMode.type,
                            config: generator.config
                        }))
                )
        };
    });
}
