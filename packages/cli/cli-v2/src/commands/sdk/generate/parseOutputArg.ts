import type { schemas } from "@fern-api/config";

import { isGithubPrUrl, isGitUrl, parseGithubPrUrl } from "../utils/gitUrl.js";
import { resolveGithubPrBranch } from "../utils/resolveGithubPrBranch.js";

/**
 * Parses the --output argument into an OutputSchema.
 *
 * - GitHub PR URLs (e.g. https://github.com/owner/repo/pull/123)
 *   resolve the PR's head branch and produce a push-mode git output.
 * - Git URLs (ending in .git, or starting with https://github.com/, https://gitlab.com/, git@)
 *   produce a self-hosted git output with token from GITHUB_TOKEN or GIT_TOKEN env vars.
 * - Anything else is treated as a local path.
 */
export async function parseOutputArg(
    outputArg: string,
    { local }: { local: boolean }
): Promise<schemas.OutputObjectSchema> {
    if (isGithubPrUrl(outputArg)) {
        if (!local) {
            throw new Error(
                `Remote generation is not supported with a GitHub PR URL for --output.\n\n` +
                    `  Use --local to generate locally:\n` +
                    `    fern generate --local --output ${outputArg}`
            );
        }
        const token = process.env.GITHUB_TOKEN ?? process.env.GIT_TOKEN;
        if (token == null) {
            throw new Error(
                `A git token is required when --output is a GitHub PR URL.\n\n` +
                    `  Set GITHUB_TOKEN or GIT_TOKEN:\n` +
                    `    export GITHUB_TOKEN=ghp_xxx\n\n` +
                    `  Or use a local path:\n` +
                    `    --output ./my-sdk`
            );
        }
        const prInfo = parseGithubPrUrl(outputArg);
        const { branch, uri } = await resolveGithubPrBranch(prInfo, token);
        return {
            git: {
                uri,
                token,
                mode: "push",
                branch
            }
        };
    }

    if (isGitUrl(outputArg)) {
        if (!local) {
            throw new Error(
                `Remote generation is not supported with a git URL for --output.\n\n` +
                    `  Use --local to generate locally:\n` +
                    `    fern generate --local --output ${outputArg}`
            );
        }
        const token = process.env.GITHUB_TOKEN ?? process.env.GIT_TOKEN;
        if (token == null) {
            throw new Error(
                `A git token is required when --output is a git URL.\n\n` +
                    `  Set GITHUB_TOKEN or GIT_TOKEN:\n` +
                    `    export GITHUB_TOKEN=ghp_xxx\n\n` +
                    `  Or use a local path:\n` +
                    `    --output ./my-sdk`
            );
        }
        return {
            git: {
                uri: outputArg,
                token,
                mode: "pr"
            }
        };
    }

    return { path: outputArg };
}
