import type { generatorsYml } from "@fern-api/configuration";
import latestVersion from "latest-version";
import { Octokit } from "octokit";
import semver from "semver";

/**
 * Computes the next semantic version for an SDK package by fetching the current version
 * from package registries or GitHub tags, then incrementing the patch version.
 *
 * This is a local implementation of the logic that exists in FDR's computeSemanticVersion endpoint.
 * It allows local generation to compute versions without calling the FDR API.
 *
 * @param packageName - The name of the package (e.g., "@anduril-industries/lattice-sdk")
 * @param generatorInvocation - The generator configuration containing language and output mode
 * @returns The next semantic version string, or undefined if version cannot be computed
 */
export async function computeSemanticVersion({
    packageName,
    generatorInvocation
}: {
    packageName: string | undefined;
    generatorInvocation: generatorsYml.GeneratorInvocation;
}): Promise<string | undefined> {
    // Version computation only applies to SDK languages
    if (generatorInvocation.language == null || packageName == null) {
        return undefined;
    }

    // Get the current/existing version from registries or GitHub
    const existingVersion = await getExistingVersion({
        packageName,
        language: generatorInvocation.language,
        githubRepository: getGithubRepository(generatorInvocation)
    });

    if (existingVersion == null) {
        return undefined;
    }

    // Increment the patch version
    // TODO: make this more robust by factoring in api definition changes
    const nextVersion = semver.inc(existingVersion, "patch");

    return nextVersion ?? undefined;
}

/**
 * Gets the existing version of a package from registries or GitHub tags.
 * Tries package registries first (npm, PyPI), then falls back to GitHub tags.
 *
 * NOTE: This does not handle private registries or private GitHub repositories.
 *
 * @param packageName - The name of the package
 * @param language - The programming language of the SDK
 * @param githubRepository - Optional GitHub repository in "owner/repo" format
 * @returns The existing version string, or undefined if not found
 */
async function getExistingVersion({
    packageName,
    language,
    githubRepository
}: {
    packageName: string;
    language: string;
    githubRepository: string | undefined;
}): Promise<string | undefined> {
    let version: string | undefined = undefined;

    // Step 1: Fetch from package registries
    switch (language) {
        case "typescript":
            version = await getLatestVersionFromNpm(packageName);
            break;
        case "python":
            version = await getLatestVersionFromPypi(packageName);
            break;
        case "csharp":
        case "go":
        case "java":
        case "ruby":
        case "php":
        case "swift":
            // These languages are not yet supported for registry lookups
            break;
    }

    if (version != null) {
        return version;
    }

    // Step 2: Fall back to GitHub tags
    if (githubRepository != null) {
        version = await getLatestTag(githubRepository);
    }

    return version;
}

/**
 * Fetches the latest version of an npm package.
 *
 * @param packageName - The npm package name (e.g., "@anduril-industries/lattice-sdk")
 * @returns The latest version string, or undefined if the package doesn't exist
 */
async function getLatestVersionFromNpm(packageName: string): Promise<string | undefined> {
    try {
        return await latestVersion(packageName);
    } catch (error) {
        // Package doesn't exist or network error
        return undefined;
    }
}

/**
 * Fetches the latest version of a Python package from PyPI.
 *
 * @param packageName - The PyPI package name
 * @returns The latest version string, or undefined if the package doesn't exist
 */
async function getLatestVersionFromPypi(packageName: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://pypi.org/pypi/${packageName}/json`);

        if (response.ok) {
            // Extract the latest version from the response data
            // biome-ignore lint/suspicious/noExplicitAny: Any is allowed here
            const packageData = (await response.json()) as any;
            return packageData.info.version;
        }

        return undefined;
    } catch (error) {
        // Package doesn't exist or network error
        return undefined;
    }
}

/**
 * Fetches the latest tag from a GitHub repository.
 *
 * @param githubRepository - Repository in "owner/repo" format
 * @returns The latest tag name, or undefined if no tags exist
 */
async function getLatestTag(githubRepository: string): Promise<string | undefined> {
    try {
        const { owner, repo } = parseRepository(githubRepository);

        const octokit = new Octokit();
        const response = await octokit.rest.repos.listTags({
            owner,
            repo,
            per_page: 1 // Fetch only the latest tag
        });

        return response.data?.[0]?.name;
    } catch (error) {
        // Repository doesn't exist or API error
        return undefined;
    }
}

/**
 * Parses a GitHub repository string into owner and repo.
 *
 * @param githubRepository - Repository in "owner/repo" format
 * @returns Object containing owner and repo strings
 */
function parseRepository(githubRepository: string): { owner: string; repo: string } {
    const [owner, repo] = githubRepository.split("/");
    if (owner == null || repo == null) {
        throw new Error(`Invalid github repository: ${githubRepository}`);
    }
    return { owner, repo };
}

/**
 * Extracts the GitHub repository string from a generator invocation.
 *
 * @param generatorInvocation - The generator configuration
 * @returns GitHub repository in "owner/repo" format, or undefined
 */
function getGithubRepository(generatorInvocation: generatorsYml.GeneratorInvocation): string | undefined {
    if (generatorInvocation.outputMode.type === "githubV2") {
        return `${generatorInvocation.outputMode.githubV2.owner}/${generatorInvocation.outputMode.githubV2.repo}`;
    }
    return undefined;
}
