import type { ReplayInitResult } from "./replay-init.js";

export interface SubmitReplayInitParams {
    /** Fiddle API origin (e.g. "https://fiddle.buildwithfern.com") */
    fiddleOrigin: string;
    /** Fern auth token */
    fernToken: string;
    /** GitHub repository (e.g. "owner/repo" or full URL) */
    githubRepo: string;
    /** Result from replayInit() */
    initResult: ReplayInitResult;
}

export interface SubmitReplayInitResult {
    /** URL of the PR created by Fiddle */
    prUrl: string;
}

/**
 * Submits a Replay init lockfile to the Fiddle API for server-side PR creation.
 *
 * Extracts owner/repo from the GitHub repository string, posts the lockfile
 * and related metadata to the Fiddle remote-gen endpoint, and returns the
 * resulting PR URL.
 *
 * This function is shared between CLI v1 and CLI v2 to avoid duplicating
 * the Fiddle submission logic.
 */
export async function submitReplayInit(params: SubmitReplayInitParams): Promise<SubmitReplayInitResult> {
    const { fiddleOrigin, fernToken, githubRepo, initResult } = params;

    const { owner, repo } = parseOwnerRepo(githubRepo);

    const response = await fetch(`${fiddleOrigin}/api/remote-gen/replay/init`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${fernToken}`
        },
        body: JSON.stringify({
            owner,
            repo,
            lockfileContents: initResult.lockfileContent,
            fernignoreEntries: initResult.fernignoreEntries,
            gitattributesEntries: initResult.gitattributesEntries,
            prBody: initResult.prBody
        })
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new ReplaySubmitError(
                "The Fern GitHub App is not installed on this repository. " +
                    "Install it at https://github.com/apps/fern-api to enable server-side PR creation.",
                response.status
            );
        }
        const body = await response.text();
        throw new ReplaySubmitError(`Failed to create PR via Fern: ${body}`, response.status);
    }

    const data: unknown = await response.json();
    if (!isSubmitResponse(data)) {
        throw new ReplaySubmitError("Unexpected response from Fern: missing prUrl field.");
    }

    return { prUrl: data.prUrl };
}

/**
 * Parses a GitHub repository string into owner and repo components.
 * Accepts formats: "owner/repo", "github.com/owner/repo",
 * "https://github.com/owner/repo", "https://github.com/owner/repo.git"
 */
export function parseOwnerRepo(githubRepo: string): { owner: string; repo: string } {
    const cleaned = githubRepo
        .replace(/^https?:\/\//, "")
        .replace(/\.git$/, "")
        .replace(/^github\.com\//, "");
    const parts = cleaned.split("/");
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];
    if (!owner || !repo) {
        throw new Error(`Could not parse owner/repo from: ${githubRepo}`);
    }
    return { owner, repo };
}

/**
 * Error thrown when submitting a Replay init to Fiddle fails.
 * Consumers can inspect `statusCode` to distinguish between
 * different failure modes (e.g. 404 = GitHub App not installed).
 */
export class ReplaySubmitError extends Error {
    public readonly statusCode: number | undefined;

    constructor(message: string, statusCode?: number) {
        super(message);
        this.name = "ReplaySubmitError";
        this.statusCode = statusCode;
    }
}

function isSubmitResponse(data: unknown): data is { prUrl: string } {
    return (
        typeof data === "object" &&
        data != null &&
        "prUrl" in data &&
        typeof (data as Record<string, unknown>).prUrl === "string"
    );
}
