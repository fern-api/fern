import type { generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";

// ─── Constants ──────────────────────────────────────────────────────

/** Timeout for registry HTTP calls (ms). Prevents slow registries from delaying generation start. */
const REGISTRY_TIMEOUT_MS = 5_000;

// ─── Registry API response types ────────────────────────────────────

interface NpmRegistryVersionResponse {
    version?: string;
}

interface MavenSolrResponse {
    response?: { numFound?: number; docs?: Array<{ v?: string }> };
}

interface NugetFlatContainerResponse {
    versions?: string[];
}

interface CratesIoVersionResponse {
    version?: { num?: string };
}

interface GoProxyVersionResponse {
    Version?: string;
}

/**
 * Checks whether the specified version already exists on the target package registry
 * (or as a GitHub tag for GitHub output modes) for the given generator invocation.
 * If it does, the task context will fail with an actionable error message.
 *
 * This is a best-effort check — network errors, timeouts, or unsupported registries
 * are silently ignored so that generation is not blocked unnecessarily.
 *
 * NOTE: Private registries (beyond npm via NPM_TOKEN) are not supported. If a package
 * lives on a private registry, the check will return "not found" and silently pass.
 *
 * @param version - The version being published (e.g., "1.2.3")
 * @param packageName - The package name (e.g., "@acme/sdk")
 * @param generatorInvocation - The generator configuration containing language and output mode
 * @param context - Task context for logging and error reporting
 */
export async function checkVersionDoesNotAlreadyExist({
    version,
    packageName,
    generatorInvocation,
    context
}: {
    version: string | undefined;
    packageName: string | undefined;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    context: TaskContext;
}): Promise<void> {
    // Only check when an explicit version is provided (not auto-computed)
    if (version == null) {
        return;
    }

    // Skip check for download-only mode (no publishing)
    if (generatorInvocation.outputMode.type === "downloadFiles") {
        return;
    }

    // Check GitHub tags for GitHub output modes
    const githubRepository = getGithubRepository(generatorInvocation);
    if (githubRepository != null) {
        let tagExists: boolean;
        try {
            tagExists = await doesGithubTagExist(githubRepository, version);
        } catch (error) {
            context.logger.debug(
                `Could not verify tag availability on GitHub: ${error instanceof Error ? error.message : String(error)}`
            );
            tagExists = false;
        }
        if (tagExists) {
            context.failAndThrow(
                `Version ${version} already exists as a tag on GitHub repository ${githubRepository}. ` +
                    `Please use a different version number. ` +
                    `If you want to automatically increment the version, omit the --version flag.`
            );
        }
    }

    // Check package registries for publish output modes
    if (generatorInvocation.language == null || packageName == null) {
        return;
    }

    const language = generatorInvocation.language;

    let exists: boolean;
    try {
        exists = await doesVersionExistOnRegistry({ packageName, version, language });
    } catch (error) {
        // Best-effort check — if we can't reach the registry, don't block generation.
        // The error will surface later during the actual publish step.
        context.logger.debug(
            `Could not verify version availability on ${getRegistryName(language)}: ${error instanceof Error ? error.message : String(error)}`
        );
        return;
    }
    if (exists) {
        context.failAndThrow(
            `Version ${version} of ${packageName} already exists on the ${getRegistryName(language)} registry. ` +
                `Please use a different version number. ` +
                `If you want to automatically increment the version, omit the --version flag.`
        );
    }
}

// ─── GitHub tag checking ────────────────────────────────────────────

/**
 * Extracts the GitHub repository ("owner/repo") from a generator invocation's output mode,
 * if the output mode targets GitHub.
 */
/** @internal Exported for testing */
export function getGithubRepository(generatorInvocation: generatorsYml.GeneratorInvocation): string | undefined {
    if (generatorInvocation.outputMode.type === "githubV2") {
        return `${generatorInvocation.outputMode.githubV2.owner}/${generatorInvocation.outputMode.githubV2.repo}`;
    }
    return undefined;
}

/**
 * Checks whether a specific tag exists on a GitHub repository.
 * Uses the GitHub REST API (unauthenticated, or with GITHUB_TOKEN if set).
 */
/** @internal Exported for testing */
export async function doesGithubTagExist(githubRepository: string, version: string): Promise<boolean> {
    const headers: Record<string, string> = {
        accept: "application/vnd.github+json"
    };
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken != null) {
        headers.authorization = `Bearer ${githubToken}`;
    }
    // Try common tag formats: "vX.Y.Z" and "X.Y.Z"
    const tagsToCheck = version.startsWith("v") ? [version, version.slice(1)] : [`v${version}`, version];

    for (const tag of tagsToCheck) {
        const response = await fetch(`https://api.github.com/repos/${githubRepository}/git/ref/tags/${tag}`, {
            headers,
            signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
        });
        if (response.ok) {
            return true;
        }
    }
    return false;
}

// ─── Registry version checking ──────────────────────────────────────

/**
 * Checks whether a specific version of a package exists on the relevant registry.
 *
 * @returns true if the version exists, false otherwise
 */
/** @internal Exported for testing */
export async function doesVersionExistOnRegistry({
    packageName,
    version,
    language
}: {
    packageName: string;
    version: string;
    language: string;
}): Promise<boolean> {
    switch (language) {
        case "typescript":
            return await doesNpmVersionExist(packageName, version);
        case "python":
            return await doesPypiVersionExist(packageName, version);
        case "java":
            return await doesMavenVersionExist(packageName, version);
        case "csharp":
            return await doesNugetVersionExist(packageName, version);
        case "ruby":
            return await doesRubyGemsVersionExist(packageName, version);
        case "go":
            return await doesGoVersionExist(packageName, version);
        case "rust":
            return await doesCratesVersionExist(packageName, version);
        default:
            return false;
    }
}

/**
 * Checks if a specific version of an npm package exists.
 * Uses the npm registry's version-specific endpoint which returns 200 if the version exists.
 * Supports private registries via NPM_TOKEN.
 */
/** @internal Exported for testing */
export async function doesNpmVersionExist(packageName: string, version: string): Promise<boolean> {
    const encodedName = encodeURIComponent(packageName).replace(/^%40/, "@");
    const headers: Record<string, string> = {
        accept: "application/json"
    };
    const npmToken = process.env.NPM_TOKEN;
    if (npmToken != null) {
        headers.authorization = `Bearer ${npmToken}`;
    }
    const response = await fetch(`https://registry.npmjs.org/${encodedName}/${version}`, {
        headers,
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });
    if (!response.ok) {
        return false;
    }
    const data = (await response.json()) as NpmRegistryVersionResponse;
    return data.version === version;
}

/**
 * Checks if a specific version of a PyPI package exists.
 * PyPI provides a version-specific JSON endpoint.
 */
/** @internal Exported for testing */
export async function doesPypiVersionExist(packageName: string, version: string): Promise<boolean> {
    const response = await fetch(`https://pypi.org/pypi/${packageName}/${version}/json`, {
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });
    return response.ok;
}

/**
 * Checks if a specific version of a Maven artifact exists.
 * Searches Maven Central for the specific group:artifact:version combination.
 */
/** @internal Exported for testing */
export async function doesMavenVersionExist(coordinate: string, version: string): Promise<boolean> {
    const parts = coordinate.split(":");
    if (parts.length < 2 || !parts[0] || !parts[1]) {
        return false;
    }
    const groupId = parts[0];
    const artifactId = parts[1];

    const response = await fetch(
        `https://search.maven.org/solrsearch/select?q=g:${encodeURIComponent(groupId)}+AND+a:${encodeURIComponent(artifactId)}+AND+v:${encodeURIComponent(version)}&rows=1&wt=json`,
        { signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS) }
    );
    if (!response.ok) {
        return false;
    }
    const data = (await response.json()) as MavenSolrResponse;
    return (data.response?.numFound ?? 0) > 0;
}

/**
 * Checks if a specific version of a NuGet package exists.
 * Uses the NuGet V3 flat container API to list all versions, then checks for the target.
 */
/** @internal Exported for testing */
export async function doesNugetVersionExist(packageName: string, version: string): Promise<boolean> {
    const response = await fetch(`https://api.nuget.org/v3-flatcontainer/${packageName.toLowerCase()}/index.json`, {
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });
    if (!response.ok) {
        return false;
    }
    const data = (await response.json()) as NugetFlatContainerResponse;
    const versions = data.versions ?? [];
    return versions.some((v) => v.toLowerCase() === version.toLowerCase());
}

/**
 * Checks if a specific version of a Ruby gem exists.
 * Uses the RubyGems version-specific endpoint.
 */
/** @internal Exported for testing */
export async function doesRubyGemsVersionExist(packageName: string, version: string): Promise<boolean> {
    const response = await fetch(`https://rubygems.org/api/v2/rubygems/${packageName}/versions/${version}.json`, {
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });
    return response.ok;
}

/**
 * Checks if a specific version of a Go module exists.
 * Uses the Go Module Proxy's version-specific info endpoint.
 */
/** @internal Exported for testing */
export async function doesGoVersionExist(modulePath: string, version: string): Promise<boolean> {
    // Go module proxy requires case-encoding: uppercase letters become "!" + lowercase
    const encodedPath = modulePath.replace(/[A-Z]/g, (c) => "!" + c.toLowerCase());
    // Go versions require "v" prefix
    const goVersion = version.startsWith("v") ? version : `v${version}`;
    const response = await fetch(`https://proxy.golang.org/${encodedPath}/@v/${goVersion}.info`, {
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });
    if (!response.ok) {
        return false;
    }
    const data = (await response.json()) as GoProxyVersionResponse;
    return data.Version != null;
}

/**
 * Checks if a specific version of a Rust crate exists.
 * Uses the Crates.io version-specific endpoint.
 */
/** @internal Exported for testing */
export async function doesCratesVersionExist(packageName: string, version: string): Promise<boolean> {
    const response = await fetch(`https://crates.io/api/v1/crates/${packageName}/${version}`, {
        headers: {
            "user-agent": "fern-cli (https://buildwithfern.com)"
        },
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });
    if (!response.ok) {
        return false;
    }
    const data = (await response.json()) as CratesIoVersionResponse;
    return data.version?.num === version;
}

/**
 * Returns a human-readable registry name for the given language.
 */
/** @internal Exported for testing */
export function getRegistryName(language: string): string {
    switch (language) {
        case "typescript":
            return "npm";
        case "python":
            return "PyPI";
        case "java":
            return "Maven Central";
        case "csharp":
            return "NuGet";
        case "ruby":
            return "RubyGems";
        case "go":
            return "Go Module Proxy";
        case "rust":
            return "crates.io";
        default:
            return language;
    }
}
