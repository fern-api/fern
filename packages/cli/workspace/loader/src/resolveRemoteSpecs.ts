import { generatorsYml } from "@fern-api/configuration-loader";
import { extractErrorMessage, isCommitSha, isGitAvailable } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import path from "path";
import { simpleGit } from "simple-git";
import tmp from "tmp-promise";

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

    if (!isGitAvailable()) {
        throw new Error(
            "Git is not installed or not found in PATH. " +
                "Remote git sources in generators.yml require git to be available. " +
                "Please install git and ensure it is in your PATH."
        );
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
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        const clonePath = AbsoluteFilePath.of(tmpDir.path);

        const git = simpleGit();
        const useCommitShaFlow = target.ref != null && isCommitSha(target.ref);

        try {
            if (useCommitShaFlow) {
                // Commit SHAs cannot be used with --branch; fetch the specific commit instead
                const ref = target.ref as string;
                const cloneArgs = ["--depth", "1", "--config", "core.symlinks=false", "--no-checkout"];
                await git.clone(target.repo, tmpDir.path, cloneArgs);
                const repoGit = simpleGit(tmpDir.path);
                await repoGit.fetch("origin", ref, { "--depth": "1" });
                await repoGit.checkout(ref);
            } else {
                const cloneArgs = ["--depth", "1", "--config", "core.symlinks=false"];
                if (target.ref != null) {
                    cloneArgs.push("--branch", target.ref);
                }
                await git.clone(target.repo, tmpDir.path, cloneArgs);
            }
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            if (
                errorMessage.includes("Authentication failed") ||
                errorMessage.includes("could not read Username") ||
                errorMessage.includes("401") ||
                errorMessage.includes("403")
            ) {
                throw new Error(
                    `Failed to clone remote spec source: authentication failed. ` +
                        `Ensure your git credentials are configured for ${target.repo}. ` +
                        `The CLI uses your system's git credential configuration (credential helpers, SSH keys, GIT_ASKPASS). ` +
                        `Original error: ${errorMessage}`
                );
            }
            if (
                errorMessage.includes("Repository not found") ||
                errorMessage.includes("not found") ||
                errorMessage.includes("404")
            ) {
                throw new Error(
                    `Failed to clone remote spec source: repository not found. ` +
                        `Check that ${target.repo} exists and your credentials have access. ` +
                        `Original error: ${errorMessage}`
                );
            }
            throw new Error(
                `Failed to clone remote spec source ${target.repo}` +
                    `${target.ref ? ` at ref '${target.ref}'` : ""}. ` +
                    `Original error: ${errorMessage}`
            );
        }

        clonedPaths.set(key, clonePath);
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

        // Validate the path to prevent directory traversal attacks
        const resolvedPath = AbsoluteFilePath.of(path.resolve(clonedPath, def.gitSource.path));
        if (!resolvedPath.startsWith(clonedPath + path.sep) && resolvedPath !== clonedPath) {
            throw new Error(
                `Invalid git source path '${def.gitSource.path}': ` +
                    `path must be relative to the repository root and cannot traverse outside it.`
            );
        }

        if (def.schema.type === "protobuf") {
            // Resolve target relative to the cloned repo root (not the proto root)
            const resolvedTarget =
                def.schema.target.length > 0 ? path.resolve(clonedPath, def.schema.target) : def.schema.target;
            if (
                resolvedTarget.length > 0 &&
                !resolvedTarget.startsWith(clonedPath + path.sep) &&
                resolvedTarget !== clonedPath
            ) {
                throw new Error(
                    `Invalid proto target path '${def.schema.target}': ` +
                        `path must be relative to the repository root and cannot traverse outside it.`
                );
            }
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
