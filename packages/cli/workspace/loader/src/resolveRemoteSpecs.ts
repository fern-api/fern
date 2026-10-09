import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { cloneRepositoryAtRef, resolveRepositorySubpath } from "@fern-api/github";
import { TaskContext } from "@fern-api/task-context";

interface CloneTarget {
    repo: string;
    ref: string | undefined;
}

function cloneTargetKey(target: CloneTarget): string {
    return `${target.repo}#${target.ref ?? "HEAD"}`;
}

/**
 * Resolves all remote git sources in the given definitions by shallow-cloning
 * the referenced repositories into temporary directories. Returns a new array
 * with git-sourced paths replaced by their resolved local paths.
 */
export async function resolveRemoteSpecs({
    definitions,
    context
}: {
    definitions: generatorsYml.APIDefinitionLocation[];
    context: TaskContext;
}): Promise<generatorsYml.APIDefinitionLocation[]> {
    const gitDefinitions = definitions.filter((d) => d.gitSource != null);
    if (gitDefinitions.length === 0) {
        return definitions;
    }

    // Deduplicate repos to clone (same repo+ref → same clone)
    const cloneTargets = new Map<string, CloneTarget>();
    for (const def of gitDefinitions) {
        const gitSource = def.gitSource;
        if (gitSource == null) {
            continue;
        }
        const target: CloneTarget = { repo: gitSource.repo, ref: gitSource.ref };
        const key = cloneTargetKey(target);
        if (!cloneTargets.has(key)) {
            cloneTargets.set(key, target);
        }
    }

    // Clone each unique repo+ref
    const clonedPaths = new Map<string, AbsoluteFilePath>();
    for (const [key, target] of cloneTargets.entries()) {
        context.logger.info(`Cloning remote spec source: ${target.repo}${target.ref ? `@${target.ref}` : ""}`);
        const clonePath = await cloneRepositoryAtRef({ repositoryUrl: target.repo, ref: target.ref });
        clonedPaths.set(key, AbsoluteFilePath.of(clonePath));
    }

    // Replace git sources with resolved local paths
    return definitions.map((def) => {
        if (def.gitSource == null) {
            return def;
        }

        const target: CloneTarget = { repo: def.gitSource.repo, ref: def.gitSource.ref };
        const key = cloneTargetKey(target);
        const clonedPath = clonedPaths.get(key);
        if (clonedPath == null) {
            throw new Error(`Internal error: no clone found for ${key}`);
        }

        const resolvedPath = AbsoluteFilePath.of(
            resolveRepositorySubpath({
                repositoryRoot: clonedPath,
                subpath: def.gitSource.path,
                description: "git source path"
            })
        );

        if (def.schema.type === "protobuf") {
            // Resolve target relative to the cloned repo root (not the proto root)
            const resolvedTarget =
                def.schema.target.length > 0
                    ? resolveRepositorySubpath({
                          repositoryRoot: clonedPath,
                          subpath: def.schema.target,
                          description: "proto target path"
                      })
                    : def.schema.target;
            return {
                ...def,
                schema: {
                    ...def.schema,
                    root: resolvedPath,
                    target: resolvedTarget
                },
                gitSource: undefined,
                resolvedAbsolutePath: true
            };
        }

        return {
            ...def,
            schema: {
                ...def.schema,
                path: resolvedPath
            },
            gitSource: undefined,
            resolvedAbsolutePath: true
        };
    });
}
