import { generatorsYml } from "@fern-api/configuration-loader";
import { extractErrorMessage } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { execSync } from "child_process";
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

function isGitAvailable(): boolean {
    try {
        execSync("git --version", { encoding: "utf-8", stdio: "pipe" });
        return true;
    } catch {
        return false;
    }
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
        const cloneArgs = ["--depth", "1"];
        if (target.ref != null) {
            cloneArgs.push("--branch", target.ref);
        }

        try {
            await git.clone(target.repo, tmpDir.path, cloneArgs);
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

        const resolvedPath = AbsoluteFilePath.of(path.resolve(clonedPath, def.gitSource.path));

        if (def.schema.type === "protobuf") {
            return {
                ...def,
                schema: {
                    ...def.schema,
                    root: resolvedPath
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
