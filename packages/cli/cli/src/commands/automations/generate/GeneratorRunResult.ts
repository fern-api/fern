import { assertNever } from "@fern-api/core-utils";

import type { GeneratorSkipReason, PublishTarget, RemoteGeneratorRunRecorder } from "@fern-api/remote-workspace-runner";

export type { GeneratorSkipReason, PublishTarget };

export type GeneratorStatus = "success" | "failed" | "skipped";

export interface GeneratorRunResult {
    apiName: string | undefined;
    groupName: string;
    generatorName: string;
    status: GeneratorStatus;
    /** Only present when status === "skipped". */
    skipReason: GeneratorSkipReason | null;
    version: string | null;
    pullRequestUrl: string | null;
    /** Whether Fiddle reported zero diff against the SDK repo. False when the analyzer didn't run or reported changes. */
    noChangesDetected: boolean;
    /** Where the SDK was published. Null for GitHub-only / local-filesystem targets. */
    publishTarget: PublishTarget | null;
    errorMessage: string | null;
    durationMs: number;
    /** `https://github.com/{owner}/{repo}` when the generator targets a GitHub repo. */
    sdkRepoUrl: string | null;
    /**
     * URL to the exact line in generators.yml that declared this generator. Composed from
     * GITHUB_SERVER_URL + GITHUB_REPOSITORY + GITHUB_REF_NAME + workspace-relative path + `#L{n}`.
     * Null when any part is unresolvable (non-GH-Actions env, detached HEAD, etc.).
     */
    generatorsYmlUrl: string | null;
    /**
     * Path of `generators.yml` relative to `GITHUB_WORKSPACE` (the runner's checkout root). Null
     * outside GitHub Actions or when the file lives outside the workspace. Consumed by GHA
     * annotation rendering, which needs a repo-relative path to anchor inline annotations on
     * the right file in the PR diff.
     */
    generatorsYmlWorkspaceRelativePath: string | null;
    /** Mirror of the recorder's line number — preserved on the result so annotations don't have to re-derive it. */
    generatorsYmlLineNumber: number | null;
}

export interface GeneratorRunCounts {
    succeeded: number;
    failed: number;
    skipped: number;
}

/** Single source of truth for aggregating status counts across results. */
export function countResults(results: readonly GeneratorRunResult[]): GeneratorRunCounts {
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;
    for (const r of results) {
        switch (r.status) {
            case "success":
                succeeded++;
                break;
            case "failed":
                failed++;
                break;
            case "skipped":
                skipped++;
                break;
            default:
                assertNever(r.status);
        }
    }
    return { succeeded, failed, skipped };
}

/**
 * Resolves an absolute path on the GitHub Actions runner to a path relative to `GITHUB_WORKSPACE`
 * (the checkout root). Returns `null` when:
 *  - `GITHUB_WORKSPACE` is unset (not running in GHA, or local invocation)
 *  - `absolutePath` is outside the workspace checkout — guarding against a naïve `startsWith`
 *    that would match `/runner/work/foo` against `/runner/work/foo2`.
 *
 * Exported only for testing.
 */
export function resolveGithubWorkspaceRelativePath(absolutePath: string | undefined): string | null {
    if (absolutePath == null) {
        return null;
    }
    const workspace = process.env.GITHUB_WORKSPACE;
    if (workspace == null) {
        return null;
    }
    const workspaceWithSlash = workspace.endsWith("/") ? workspace : `${workspace}/`;
    if (!absolutePath.startsWith(workspaceWithSlash)) {
        return null;
    }
    return absolutePath.slice(workspaceWithSlash.length);
}

/**
 * Composes the blob URL for a `generators.yml` line using GitHub Actions env vars. Returns null
 * when any required variable is missing or when the absolute path falls outside the workspace
 * checkout.
 *
 * Exported only for testing — callers inside this module use it implicitly via the record methods.
 */
export function buildGeneratorsYmlUrl(absolutePath: string | undefined, lineNumber: number | undefined): string | null {
    const relativePath = resolveGithubWorkspaceRelativePath(absolutePath);
    if (relativePath == null) {
        return null;
    }
    const serverUrl = process.env.GITHUB_SERVER_URL;
    const repository = process.env.GITHUB_REPOSITORY;
    const refName = process.env.GITHUB_REF_NAME;
    if (serverUrl == null || repository == null || refName == null) {
        return null;
    }
    const anchor = lineNumber != null ? `#L${lineNumber}` : "";
    return `${serverUrl}/${repository}/blob/${refName}/${relativePath}${anchor}`;
}

export class GeneratorRunCollector implements RemoteGeneratorRunRecorder {
    readonly #results: GeneratorRunResult[] = [];

    public recordSuccess(args: Parameters<RemoteGeneratorRunRecorder["recordSuccess"]>[0]): void {
        this.#results.push({
            apiName: args.apiName,
            groupName: args.groupName,
            generatorName: args.generatorName,
            status: "success",
            skipReason: null,
            version: args.version,
            pullRequestUrl: args.pullRequestUrl ?? null,
            noChangesDetected: args.noChangesDetected ?? false,
            publishTarget: args.publishTarget ?? null,
            errorMessage: null,
            durationMs: args.durationMs,
            sdkRepoUrl: args.outputRepoUrl ?? null,
            generatorsYmlUrl: buildGeneratorsYmlUrl(args.generatorsYmlAbsolutePath, args.generatorsYmlLineNumber),
            generatorsYmlWorkspaceRelativePath: resolveGithubWorkspaceRelativePath(args.generatorsYmlAbsolutePath),
            generatorsYmlLineNumber: args.generatorsYmlLineNumber ?? null
        });
    }

    public recordFailure(args: Parameters<RemoteGeneratorRunRecorder["recordFailure"]>[0]): void {
        this.#results.push({
            apiName: args.apiName,
            groupName: args.groupName,
            generatorName: args.generatorName,
            status: "failed",
            skipReason: null,
            version: null,
            pullRequestUrl: null,
            noChangesDetected: false,
            publishTarget: null,
            errorMessage: args.errorMessage,
            durationMs: args.durationMs,
            sdkRepoUrl: args.outputRepoUrl ?? null,
            generatorsYmlUrl: buildGeneratorsYmlUrl(args.generatorsYmlAbsolutePath, args.generatorsYmlLineNumber),
            generatorsYmlWorkspaceRelativePath: resolveGithubWorkspaceRelativePath(args.generatorsYmlAbsolutePath),
            generatorsYmlLineNumber: args.generatorsYmlLineNumber ?? null
        });
    }

    public recordSkipped(args: Parameters<RemoteGeneratorRunRecorder["recordSkipped"]>[0]): void {
        this.#results.push({
            apiName: args.apiName,
            groupName: args.groupName,
            generatorName: args.generatorName,
            status: "skipped",
            skipReason: args.reason,
            version: null,
            pullRequestUrl: null,
            noChangesDetected: args.reason === "no_diff",
            publishTarget: null,
            errorMessage: null,
            durationMs: 0,
            sdkRepoUrl: args.outputRepoUrl ?? null,
            generatorsYmlUrl: buildGeneratorsYmlUrl(args.generatorsYmlAbsolutePath, args.generatorsYmlLineNumber),
            generatorsYmlWorkspaceRelativePath: resolveGithubWorkspaceRelativePath(args.generatorsYmlAbsolutePath),
            generatorsYmlLineNumber: args.generatorsYmlLineNumber ?? null
        });
    }

    public results(): readonly GeneratorRunResult[] {
        return this.#results;
    }

    public hasFailures(): boolean {
        return this.#results.some((r) => r.status === "failed");
    }

    public counts(): GeneratorRunCounts {
        return countResults(this.#results);
    }
}
