import type { generatorsYml } from "@fern-api/configuration-loader";

/**
 * Extracts the GitHub repository (e.g., "acme/ts-sdk") from a generator's
 * configuration. Returns undefined if no GitHub config or if using
 * self-hosted mode (which uses `uri` instead of `repository`).
 */
export function getGithubRepository(generator: generatorsYml.GeneratorInvocation): string | undefined {
    const github = generator.raw?.github;
    if (github != null && "repository" in github) {
        return (github as { repository: string }).repository;
    }
    return undefined;
}
