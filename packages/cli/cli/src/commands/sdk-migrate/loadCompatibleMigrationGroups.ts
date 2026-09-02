import {
    type AbstractAPIWorkspace,
    type FernDefinition,
    type FernWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { CliError } from "@fern-api/task-context";

import type { CliContext } from "../../cli-context/CliContext.js";
import { type ResolvedMigrationSourceSpec, resolveMigrationSourceSpecs } from "./projectMigrationSource.js";

interface LoadedGenerator {
    fernWorkspace: FernWorkspace;
    generator: generatorsYml.GeneratorInvocation;
    group: generatorsYml.GeneratorGroup;
    sourceSpecs: ResolvedMigrationSourceSpec[];
}

export async function loadCompatibleMigrationGroups({
    workspace,
    groups,
    cliContext
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    groups: generatorsYml.GeneratorGroup[];
    cliContext: CliContext;
}): Promise<{
    fernWorkspace: FernWorkspace;
    group: generatorsYml.GeneratorGroup;
    sourceSpecs: ResolvedMigrationSourceSpec[];
}> {
    const emptyGroup = groups.find((group) => group.generators.length === 0);
    if (emptyGroup != null) {
        throw new CliError({
            message: `SDK group '${emptyGroup.groupName}' does not contain any generators.`,
            code: CliError.Code.ConfigError
        });
    }

    const loaded = await cliContext.runTask(async (context) => {
        const result: LoadedGenerator[] = [];
        const workspaceLoads = new Map<string, Promise<FernWorkspace>>();
        for (const group of groups) {
            for (const generator of group.generators) {
                const settings = getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generator);
                const specs = generator.apiOverride?.specs;
                const loadKey = stableJson({ settings, specs });
                let workspaceLoad = workspaceLoads.get(loadKey);
                if (workspaceLoad == null) {
                    workspaceLoad = workspace.toFernWorkspace({ context }, settings, specs);
                    workspaceLoads.set(loadKey, workspaceLoad);
                }
                const fernWorkspace = await workspaceLoad;
                const sourceSpecs = resolveMigrationSourceSpecs({
                    workspace,
                    fernWorkspace,
                    generator
                });
                result.push({ fernWorkspace, generator, group, sourceSpecs });
            }
        }
        return result;
    });

    const baseline = loaded[0];
    if (baseline == null) {
        throw new CliError({
            message: "No SDK generator groups were selected.",
            code: CliError.Code.ConfigError
        });
    }
    const baselineFingerprint = migrationInputFingerprint(baseline);
    const mismatch = loaded.find((candidate) => migrationInputFingerprint(candidate) !== baselineFingerprint);
    if (mismatch != null) {
        throw new CliError({
            message: `SDK targets '${targetName(baseline)}' and '${targetName(mismatch)}' resolve to different API schemas. Migrate them into separate SDK Config files.`,
            code: CliError.Code.ConfigError
        });
    }

    return {
        fernWorkspace: baseline.fernWorkspace,
        sourceSpecs: baseline.sourceSpecs,
        group: {
            groupName: groups.map((group) => group.groupName).join("+"),
            audiences: baseline.group.audiences,
            generators: groups.flatMap((group) => group.generators),
            reviewers: undefined
        }
    };
}

function migrationInputFingerprint(input: LoadedGenerator): string {
    return stableJson({
        apiSchema: apiSchemaFingerprint(input.fernWorkspace.definition, input.group.audiences),
        sourceSpecs: input.sourceSpecs
    });
}

export function apiSchemaFingerprint(
    definition: FernDefinition,
    audiences: generatorsYml.GeneratorGroup["audiences"]
): string {
    return stableJson({
        audiences:
            audiences.type === "all"
                ? { type: "all" }
                : {
                      type: "select",
                      audiences: [...new Set(audiences.audiences)].sort()
                  },
        definition: projectDefinition(definition, new WeakSet())
    });
}

function projectDefinition(definition: FernDefinition, seen: WeakSet<object>): unknown {
    if (seen.has(definition)) {
        return { cycle: true };
    }
    seen.add(definition);
    const projected = {
        specVersion: definition.specVersion,
        root: {
            contents: definition.rootApiFile.contents,
            defaultUrl: definition.rootApiFile.defaultUrl
        },
        definitions: sortedEntries(definition.namedDefinitionFiles).map(([path, file]) => [path, file.contents]),
        packageMarkers: sortedEntries(definition.packageMarkers).map(([path, file]) => [path, file.contents]),
        imports: sortedEntries(definition.importedDefinitions).map(([path, imported]) => [
            path,
            projectDefinition(imported.definition, seen)
        ])
    };
    seen.delete(definition);
    return projected;
}

function targetName({ group, generator }: LoadedGenerator): string {
    return `${group.groupName}/${generator.name}`;
}

function sortedEntries<Value>(record: Record<string, Value>): Array<[string, Value]> {
    return Object.entries(record).sort(([left], [right]) => left.localeCompare(right));
}

function stableJson(value: unknown): string {
    return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortKeys);
    }
    if (value == null || typeof value !== "object") {
        return value;
    }
    return Object.fromEntries(
        Object.entries(value)
            .filter(([, child]) => child !== undefined)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, child]) => [key, sortKeys(child)])
    );
}
