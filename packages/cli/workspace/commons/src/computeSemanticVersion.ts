import type { generatorsYml } from "@fern-api/configuration";
import { getLatestTag as getLatestTagFromGithub } from "@fern-api/github";
import latestVersion from "latest-version";
import semver from "semver";

// ─── Registry API response types ────────────────────────────────────

interface NpmRegistryResponse {
    "dist-tags"?: { latest?: string };
}

interface PypiResponse {
    info: { version: string };
}

interface MavenSolrResponse {
    response?: { docs?: Array<{ latestVersion?: string }> };
}

interface NugetFlatContainerResponse {
    versions?: string[];
}

interface RubyGemsResponse {
    version?: string;
}

interface GoProxyResponse {
    Version?: string;
}

interface CratesIoResponse {
    crate?: { max_stable_version?: string };
}

/**
 * Computes the next semantic version for an SDK package by fetching the current version
 * from package registries or GitHub tags, then incrementing the patch version.
 *
 * This is a local implementation of the logic that exists in FDR's computeSemanticVersion endpoint.
 * It allows local generation to compute versions without calling the FDR API.
 *
 * Supports registry lookups for all SDK languages:
 * - TypeScript: npm registry
 * - Python: PyPI
 * - Java: Maven Central
 * - C#: NuGet Gallery
 * - Ruby: RubyGems.org
 * - Go: Go Module Proxy
 * - Rust: Crates.io
 * - PHP/Swift: GitHub tags fallback only
 *
 * Supports authenticated access to private registries and repositories via environment variables:
 * - GITHUB_TOKEN: Used to authenticate GitHub API requests for private repositories
 * - NPM_TOKEN: Used to authenticate npm registry requests for private packages
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
 * Tries package registries first, then falls back to GitHub tags.
 *
 * Supports authenticated access via environment variables:
 * - GITHUB_TOKEN: Authenticates GitHub API requests for private repositories
 * - NPM_TOKEN: Authenticates npm registry requests for private packages
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
        case "java":
            version = await getLatestVersionFromMaven(packageName);
            break;
        case "csharp":
            version = await getLatestVersionFromNuget(packageName);
            break;
        case "ruby":
            version = await getLatestVersionFromRubyGems(packageName);
            break;
        case "go":
            version = await getLatestVersionFromGoProxy(packageName);
            break;
        case "rust":
            version = await getLatestVersionFromCrates(packageName);
            break;
        case "php":
        case "swift":
            // PHP and Swift do not have standard public registry APIs for version lookup.
            // They rely on the GitHub tags fallback below.
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
 * If the NPM_TOKEN environment variable is set, it will be used to authenticate
 * requests to the npm registry, enabling access to private packages.
 *
 * @param packageName - The npm package name (e.g., "@anduril-industries/lattice-sdk")
 * @returns The latest version string, or undefined if the package doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromNpm(packageName: string): Promise<string | undefined> {
    try {
        const npmToken = process.env.NPM_TOKEN;
        if (npmToken != null) {
            // Use direct registry API call with auth token for private packages
            const encodedName = encodeURIComponent(packageName).replace(/^%40/, "@");
            const response = await fetch(`https://registry.npmjs.org/${encodedName}`, {
                headers: {
                    accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
                    authorization: `Bearer ${npmToken}`
                }
            });
            if (response.ok) {
                const data = (await response.json()) as NpmRegistryResponse;
                const latestTag = data["dist-tags"]?.latest;
                if (latestTag != null) {
                    return latestTag;
                }
            }
            // Falls through to try unauthenticated access
        }
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
/** @internal Exported for testing */
export async function getLatestVersionFromPypi(packageName: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://pypi.org/pypi/${packageName}/json`);

        if (response.ok) {
            const packageData = (await response.json()) as PypiResponse;
            return packageData.info.version;
        }

        return undefined;
    } catch (error) {
        // Package doesn't exist or network error
        return undefined;
    }
}

/**
 * Fetches the latest version of a Java artifact from Maven Central.
 *
 * Expects the package name in Maven coordinate format: "groupId:artifactId"
 * (e.g., "io.github.fern-api:fern-java-sdk").
 *
 * @param coordinate - The Maven coordinate in "groupId:artifactId" format
 * @returns The latest version string, or undefined if the artifact doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromMaven(coordinate: string): Promise<string | undefined> {
    try {
        const parts = coordinate.split(":");
        if (parts.length < 2 || !parts[0] || !parts[1]) {
            return undefined;
        }
        const groupId = parts[0];
        const artifactId = parts[1];

        const response = await fetch(
            `https://search.maven.org/solrsearch/select?q=g:${encodeURIComponent(groupId)}+AND+a:${encodeURIComponent(artifactId)}&rows=1&wt=json`
        );

        if (response.ok) {
            const data = (await response.json()) as MavenSolrResponse;
            const latestVer = data.response?.docs?.[0]?.latestVersion;
            if (latestVer != null) {
                return latestVer;
            }
        }

        return undefined;
    } catch (error) {
        // Artifact doesn't exist or network error
        return undefined;
    }
}

/**
 * Fetches the latest stable version of a NuGet package from the NuGet Gallery.
 *
 * Uses the NuGet V3 flat container API to list all versions, then selects the
 * latest non-prerelease version.
 *
 * @param packageName - The NuGet package name (e.g., "Newtonsoft.Json")
 * @returns The latest stable version string, or undefined if the package doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromNuget(packageName: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://api.nuget.org/v3-flatcontainer/${packageName.toLowerCase()}/index.json`);

        if (response.ok) {
            const data = (await response.json()) as NugetFlatContainerResponse;
            const versions: string[] = data.versions ?? [];

            // Filter to stable versions (no prerelease suffix containing a hyphen)
            // and return the last one (versions are sorted chronologically by the API)
            for (let i = versions.length - 1; i >= 0; i--) {
                const ver = versions[i];
                if (ver != null && !ver.includes("-")) {
                    return ver;
                }
            }
        }

        return undefined;
    } catch (error) {
        // Package doesn't exist or network error
        return undefined;
    }
}

/**
 * Fetches the latest version of a Ruby gem from RubyGems.org.
 *
 * @param packageName - The gem name (e.g., "rails")
 * @returns The latest version string, or undefined if the gem doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromRubyGems(packageName: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://rubygems.org/api/v1/gems/${packageName}.json`);

        if (response.ok) {
            const data = (await response.json()) as RubyGemsResponse;
            if (data.version != null) {
                return data.version;
            }
        }

        return undefined;
    } catch (error) {
        // Gem doesn't exist or network error
        return undefined;
    }
}

/**
 * Fetches the latest version of a Go module from the Go Module Proxy.
 *
 * Uses the default public proxy at proxy.golang.org. For private modules,
 * the GitHub tags fallback with GITHUB_TOKEN is used instead.
 *
 * @param modulePath - The Go module path (e.g., "github.com/owner/repo")
 * @returns The latest version string (without "v" prefix), or undefined if not found
 */
/** @internal Exported for testing */
export async function getLatestVersionFromGoProxy(modulePath: string): Promise<string | undefined> {
    try {
        // Go module proxy requires case-encoding: uppercase letters become "!" + lowercase
        // e.g., "github.com/Azure/sdk" -> "github.com/!azure/sdk"
        const encodedPath = modulePath.replace(/[A-Z]/g, (c) => "!" + c.toLowerCase());
        const response = await fetch(`https://proxy.golang.org/${encodedPath}/@latest`);

        if (response.ok) {
            const data = (await response.json()) as GoProxyResponse;
            if (data.Version != null) {
                // Strip the "v" prefix that Go modules use (e.g., "v1.2.3" -> "1.2.3")
                return data.Version.replace(/^v/, "");
            }
        }

        return undefined;
    } catch (error) {
        // Module doesn't exist or network error
        return undefined;
    }
}

/**
 * Fetches the latest stable version of a Rust crate from Crates.io.
 *
 * @param packageName - The crate name (e.g., "serde")
 * @returns The latest stable version string, or undefined if the crate doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromCrates(packageName: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://crates.io/api/v1/crates/${packageName}`, {
            headers: {
                // Crates.io requires a User-Agent header
                "user-agent": "fern-cli (https://buildwithfern.com)"
            }
        });

        if (response.ok) {
            const data = (await response.json()) as CratesIoResponse;
            const maxStable = data.crate?.max_stable_version;
            if (maxStable != null) {
                return maxStable;
            }
        }

        return undefined;
    } catch (error) {
        // Crate doesn't exist or network error
        return undefined;
    }
}

/**
 * Fetches the latest tag from a GitHub repository.
 *
 * Delegates to the shared @fern-api/github utility, which supports
 * GITHUB_TOKEN for authenticated access to private repositories.
 *
 * @param githubRepository - Repository in "owner/repo" format
 * @returns The latest tag name, or undefined if no tags exist
 */
/** @internal Exported for testing */
export async function getLatestTag(githubRepository: string): Promise<string | undefined> {
    try {
        return await getLatestTagFromGithub(githubRepository);
    } catch (error) {
        // Repository doesn't exist or API error
        return undefined;
    }
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
