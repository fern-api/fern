import type { schemas } from "@fern-api/config";

import { isGitUrl } from "../utils/gitUrl.js";

/**
 * Parses the --output argument into an OutputSchema.
 *
 * - Git URLs (ending in .git, or starting with https://github.com/, https://gitlab.com/, git@)
 *   produce a self-hosted git output with token from GITHUB_TOKEN or GIT_TOKEN env vars.
 * - Anything else is treated as a local path.
 */
export function parseOutputArg(outputArg: string): schemas.OutputObjectSchema {
    if (isGitUrl(outputArg)) {
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
