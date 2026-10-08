import { type FernToken, getUserIdFromToken } from "@fern-api/auth";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import type { CliReleaseEnvironment } from "@fern-api/posthog-manager";
import type { Project } from "@fern-api/project-loader";
import type { AbstractAPIWorkspace } from "@fern-api/workspace-loader";

import { expandGroupFilter } from "./expandGroupFilter.js";
import { filterGenerators } from "./filterGenerators.js";

/** The subset of a planned generation needed to describe it in telemetry. */
export interface GenerationTelemetryInput {
    kind: "legacy" | "sdk-config";
    workspace: Pick<AbstractAPIWorkspace<unknown>, "workspaceName" | "generatorsConfiguration">;
    resolvedGroupNames: string[];
    generatorName?: string;
    generatorIndex?: number;
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
    /**
     * The `use-sdk-gen-api` feature flag value for this org and release environment. Undefined for
     * local (Docker) generation, which never routes through sdk-gen-api, so no flag request is made.
     */
    sdkGenApiEnabled: boolean | undefined;
    /** The CLI distribution (`prod`, `pre-prod`, `beta`, ...) the flag was evaluated for. */
    cliReleaseEnvironment: CliReleaseEnvironment;
}

export function buildGeneratePosthogProperties({
    project,
    generations,
    groupNames,
    generatorName,
    token,
    sdkGenApiEnabled,
    cliReleaseEnvironment
}: {
    project: Project;
    generations: GenerationTelemetryInput[];
    groupNames: string[] | undefined;
    generatorName: string | undefined;
    token: FernToken | undefined;
    sdkGenApiEnabled: boolean | undefined;
    cliReleaseEnvironment: CliReleaseEnvironment;
}): GeneratePosthogProperties {
    const requestedGenerators = generations.flatMap(getRequestedGenerators);
    return {
        workspaces: buildPosthogWorkspaces({ project, groupNames, generatorName }),
        requestedGenerators,
        generatorNames: [...new Set(requestedGenerators.map(({ name }) => name))].sort(),
        ...getAuthProperties(token),
        sdkGenApiEnabled,
        cliReleaseEnvironment
    };
}

function getRequestedGenerators(generation: GenerationTelemetryInput): RequestedGeneratorTelemetry[] {
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
        return filtered.generators.map((generator) => ({
            workspace: generation.workspace.workspaceName,
            kind: generation.kind,
            group: group.groupName,
            name: generator.name,
            version: generator.version,
            outputMode: generator.outputMode.type
        }));
    });
}

function getAuthProperties(token: FernToken | undefined): Pick<GeneratePosthogProperties, "authType" | "userId"> {
    if (token == null) {
        return { authType: "none", userId: undefined };
    }
    switch (token.type) {
        case "user":
            return { authType: "user", userId: getUserIdFromToken(token) };
        case "organization":
            return { authType: "organization", userId: undefined };
        default:
            assertNever(token);
    }
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
