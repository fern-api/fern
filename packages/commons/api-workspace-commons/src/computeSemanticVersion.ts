import type { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { getFileContent, getLatestRelease as getLatestReleaseFromGithub } from "@fern-api/github";
import type { FernFiddle } from "@fern-fern/fiddle-sdk";
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

interface FernMetadataJson {
    sdkVersion?: string;
}

// ─── Registry info extracted from output mode ───────────────────────

/**
 * Registry configuration extracted from the generator's output mode.
 * Used to look up versions from the correct registry with proper auth.
 */
export interface RegistryInfo {
    registryUrl: string | undefined;
    token: string | undefined;
    username: string | undefined;
}

export namespace RegistryInfo {
    export const Empty: RegistryInfo = { registryUrl: undefined, token: undefined, username: undefined };
}

// ─── Default public registry URLs ───────────────────────────────────

const DEFAULT_NPM_REGISTRY_URL = "https://registry.npmjs.org";
const DEFAULT_PYPI_LOOKUP_URL = "https://pypi.org/pypi";
const DEFAULT_MAVEN_SEARCH_URL = "https://search.maven.org/solrsearch/select";
const DEFAULT_NUGET_FLAT_CONTAINER_URL = "https://api.nuget.org/v3-flatcontainer";
const DEFAULT_RUBYGEMS_API_URL = "https://rubygems.org/api/v1/gems";
const DEFAULT_GO_PROXY_URL = "https://proxy.golang.org";
const DEFAULT_CRATES_API_URL = "https://crates.io/api/v1/crates";

/**
 * Computes the next semantic version for an SDK package by fetching the current version
 * from package registries or GitHub tags, then incrementing the patch version.
 *
 * This is a local implementation of the logic that exists in FDR's computeSemanticVersion endpoint.
 * It allows local generation to compute versions without calling the FDR API.
 *
 * Registry URL and auth token are extracted from the generator's output mode configuration
 * first, then fall back to environment variables, and finally to hardcoded public registry URLs.
 *
 * Supports registry lookups for all SDK languages:
 * - TypeScript: npm registry
 * - Python: PyPI
 * - Java: Maven Central
 * - C#: NuGet Gallery
 * - Ruby: RubyGems.org
 * - Go: Go Module Proxy
 * - Rust: Crates.io
 * - PHP/Swift: GitHub releases fallback only
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

    // Extract registry URL and token from the output mode configuration
    const registryInfo = getRegistryInfoFromOutputMode(generatorInvocation.outputMode);

    // Get the current/existing version from registries or GitHub
    const existingVersion = await getExistingVersion({
        packageName,
        language: generatorInvocation.language,
        githubRepository: getGithubRepository(generatorInvocation),
        registryInfo
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
 * Extracts registry URL and auth token from the generator's output mode.
 *
 * For githubV2 mode, the publishInfo union carries per-registry URL and optional tokens.
 * For publishV2 mode, the publish output carries per-registry URL and tokens.
 * For other modes (downloadFiles, publish), no registry info is available.
 *
 * @internal Exported for testing
 */
export function getRegistryInfoFromOutputMode(outputMode: FernFiddle.remoteGen.OutputMode): RegistryInfo {
    const outputModeType = outputMode.type;
    switch (outputModeType) {
        case "publish":
            return getRegistryInfoFromPublishOutputMode(outputMode);
        case "publishV2":
            return getRegistryInfoFromPublishV2(outputMode.publishV2);
        case "downloadFiles":
            return RegistryInfo.Empty;
        case "github":
            return getRegistryInfoFromGithubPublishInfo(outputMode.publishInfo);
        case "githubV2":
            return getRegistryInfoFromGithubPublishInfo(outputMode.githubV2.publishInfo);
        default:
            assertNever(outputModeType);
    }
}

function getRegistryInfoFromGithubPublishInfo(publishInfo: FernFiddle.GithubPublishInfo | undefined): RegistryInfo {
    if (publishInfo == null) {
        return { registryUrl: undefined, token: undefined, username: undefined };
    }
    const publishInfoType = publishInfo.type;
    switch (publishInfoType) {
        case "npm":
            return { registryUrl: publishInfo.registryUrl, token: publishInfo.token, username: undefined };
        case "maven":
            return {
                registryUrl: publishInfo.registryUrl,
                token: publishInfo.credentials?.password,
                username: publishInfo.credentials?.username
            };
        case "pypi":
            return {
                registryUrl: publishInfo.registryUrl,
                token: publishInfo.credentials?.password,
                username: undefined
            };
        case "nuget":
            return { registryUrl: publishInfo.registryUrl, token: publishInfo.apiKey, username: undefined };
        case "rubygems":
            return { registryUrl: publishInfo.registryUrl, token: publishInfo.apiKey, username: undefined };
        case "crates":
            return { registryUrl: publishInfo.registryUrl, token: publishInfo.token, username: undefined };
        case "postman":
            return { registryUrl: undefined, token: undefined, username: undefined };
        default:
            assertNever(publishInfoType);
    }
}

function getRegistryInfoFromPublishV2(publishV2: FernFiddle.PublishOutputModeV2): RegistryInfo {
    const publishV2Type = publishV2.type;
    switch (publishV2Type) {
        case "npmOverride":
            return {
                registryUrl: publishV2.npmOverride?.registryUrl,
                token: publishV2.npmOverride?.token,
                username: undefined
            };
        case "mavenOverride":
            return {
                registryUrl: publishV2.mavenOverride?.registryUrl,
                token: publishV2.mavenOverride?.password,
                username: publishV2.mavenOverride?.username
            };
        case "pypiOverride":
            return {
                registryUrl: publishV2.pypiOverride?.registryUrl,
                token: publishV2.pypiOverride?.password,
                username: undefined
            };
        case "nugetOverride":
            return {
                registryUrl: publishV2.nugetOverride?.registryUrl,
                token: publishV2.nugetOverride?.apiKey,
                username: undefined
            };
        case "rubyGemsOverride":
            return {
                registryUrl: publishV2.rubyGemsOverride?.registryUrl,
                token: publishV2.rubyGemsOverride?.apiKey,
                username: undefined
            };
        case "cratesOverride":
            return {
                registryUrl: publishV2.cratesOverride?.registryUrl,
                token: publishV2.cratesOverride?.token,
                username: undefined
            };
        case "postman":
            return { registryUrl: undefined, token: undefined, username: undefined };
        default:
            assertNever(publishV2Type);
    }
}

function getRegistryInfoFromPublishOutputMode(publishOutputMode: FernFiddle.PublishOutputMode): RegistryInfo {
    const overrides = publishOutputMode.registryOverrides;
    if (overrides.npm != null) {
        return {
            registryUrl: overrides.npm.registryUrl,
            token: overrides.npm.token,
            username: undefined
        };
    } else if (overrides.maven != null) {
        return {
            registryUrl: overrides.maven.registryUrl,
            token: overrides.maven.password,
            username: overrides.maven.username
        };
    } else {
        return RegistryInfo.Empty;
    }
}

/**
 * Gets the existing version of a package from registries or GitHub releases.
 * Tries package registries first, then falls back to GitHub releases.
 *
 * Registry URL and token from the output mode are used as the primary source.
 * Environment variables (NPM_TOKEN, GITHUB_TOKEN) are used as fallbacks.
 * Hardcoded public registry URLs are used as the last resort.
 *
 * @param packageName - The name of the package
 * @param language - The programming language of the SDK
 * @param githubRepository - Optional GitHub repository in "owner/repo" format
 * @param registryInfo - Registry URL and token from the output mode
 * @returns The existing version string, or undefined if not found
 */
async function getExistingVersion({
    packageName,
    language,
    githubRepository,
    registryInfo
}: {
    packageName: string;
    language: string;
    githubRepository: string | undefined;
    registryInfo: RegistryInfo;
}): Promise<string | undefined> {
    let version: string | undefined = undefined;

    // Step 1: Fetch from package registries
    switch (language) {
        case "typescript":
            version = await getLatestVersionFromNpm(packageName, registryInfo);
            break;
        case "python":
            version = await getLatestVersionFromPypi(packageName, registryInfo);
            break;
        case "java":
            version = await getLatestVersionFromMaven(packageName, registryInfo);
            break;
        case "csharp":
            version = await getLatestVersionFromNuget(packageName, registryInfo);
            break;
        case "ruby":
            version = await getLatestVersionFromRubyGems(packageName, registryInfo);
            break;
        case "go":
            version = await getLatestVersionFromGoProxy(packageName, registryInfo);
            break;
        case "rust":
            version = await getLatestVersionFromCrates(packageName, registryInfo);
            break;
        case "php":
        case "swift":
            // PHP and Swift do not have standard public registry APIs for version lookup.
            // They rely on the GitHub releases fallback below.
            break;
    }

    if (version != null) {
        return version;
    }

    // Step 2: Fall back to GitHub releases
    if (githubRepository != null) {
        version = await getLatestRelease(githubRepository);
    }

    if (version != null) {
        return version;
    }

    // Step 3: Fall back to .fern/metadata.json from the GitHub repo
    if (githubRepository != null) {
        version = await getVersionFromMetadataJson(githubRepository);
    }

    return version;
}

/**
 * Resolves the npm registry URL to use for version lookups.
 *
 * Priority:
 * 1. registryUrl from output mode config (may point to a private registry)
 * 2. Hardcoded default (https://registry.npmjs.org)
 */
function resolveNpmRegistryUrl(registryInfo: RegistryInfo): string {
    if (registryInfo.registryUrl != null && registryInfo.registryUrl !== "") {
        return registryInfo.registryUrl;
    }
    return DEFAULT_NPM_REGISTRY_URL;
}

/**
 * Resolves the npm auth token.
 *
 * Priority:
 * 1. Token from output mode config
 * 2. NPM_TOKEN environment variable
 */
function resolveNpmToken(registryInfo: RegistryInfo): string | undefined {
    if (registryInfo.token != null && registryInfo.token !== "") {
        return registryInfo.token;
    }
    return process.env.NPM_TOKEN;
}

/**
 * Fetches the latest version of an npm package.
 *
 * Uses the registry URL and token from the output mode configuration first,
 * then falls back to the NPM_TOKEN environment variable and the default
 * public npm registry.
 *
 * @param packageName - The npm package name (e.g., "@anduril-industries/lattice-sdk")
 * @param registryInfo - Registry URL and token from the output mode
 * @returns The latest version string, or undefined if the package doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromNpm(
    packageName: string,
    registryInfo: RegistryInfo = { registryUrl: undefined, token: undefined, username: undefined }
): Promise<string | undefined> {
    try {
        const registryUrl = resolveNpmRegistryUrl(registryInfo);
        const token = resolveNpmToken(registryInfo);

        if (token != null) {
            // Use direct registry API call with auth token for private packages
            const encodedName = encodeURIComponent(packageName).replace(/^%40/, "@");
            const response = await fetch(`${registryUrl}/${encodedName}`, {
                headers: {
                    accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
                    authorization: `Bearer ${token}`
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
 * Resolves the PyPI lookup URL.
 *
 * The publish URL (e.g., https://upload.pypi.org/legacy/) differs from the
 * lookup URL (https://pypi.org/pypi). If the configured URL is a known public
 * upload URL, we use the standard lookup URL. For custom servers, we try to
 * derive a lookup URL from the configured base.
 */
function resolvePypiLookupUrl(registryInfo: RegistryInfo): string {
    const configuredUrl = registryInfo.registryUrl;
    if (configuredUrl == null || configuredUrl === "") {
        return DEFAULT_PYPI_LOOKUP_URL;
    }
    // Standard PyPI upload URLs → use standard lookup URL
    if (configuredUrl.includes("upload.pypi.org") || configuredUrl.includes("pypi.org/legacy")) {
        return DEFAULT_PYPI_LOOKUP_URL;
    }
    // For custom PyPI servers, try to use the base URL with /pypi path
    // Strip trailing slashes and common suffixes
    const baseUrl = configuredUrl
        .replace(/\/+$/, "")
        .replace(/\/legacy$/, "")
        .replace(/\/simple$/, "");
    return `${baseUrl}/pypi`;
}

/**
 * Fetches the latest version of a Python package from PyPI.
 *
 * For standard PyPI (upload.pypi.org), uses the public JSON API at pypi.org.
 * For custom PyPI servers, attempts to use the configured URL as the API base.
 *
 * @param packageName - The PyPI package name
 * @param registryInfo - Registry URL and token from the output mode
 * @returns The latest version string, or undefined if the package doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromPypi(
    packageName: string,
    registryInfo: RegistryInfo = { registryUrl: undefined, token: undefined, username: undefined }
): Promise<string | undefined> {
    try {
        const lookupUrl = resolvePypiLookupUrl(registryInfo);
        const headers: Record<string, string> = {};
        const token = registryInfo.token ?? undefined;
        if (token != null && token !== "") {
            headers.authorization = `Bearer ${token}`;
        }

        const hasHeaders = Object.keys(headers).length > 0;
        const response = hasHeaders
            ? await fetch(`${lookupUrl}/${packageName}/json`, { headers })
            : await fetch(`${lookupUrl}/${packageName}/json`);

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
 * Resolves the Maven search URL.
 *
 * Maven publish URLs (e.g., oss.sonatype.org, s01.oss.sonatype.org) differ from
 * the search API (search.maven.org). We always use the public search API for
 * Maven Central packages. Custom Maven repos may not support the Solr search API.
 */
function resolveMavenSearchUrl(registryInfo: RegistryInfo): string {
    const configuredUrl = registryInfo.registryUrl;
    if (configuredUrl == null || configuredUrl === "") {
        return DEFAULT_MAVEN_SEARCH_URL;
    }
    // Known Maven Central publish URLs → use the standard search API
    if (
        configuredUrl.includes("oss.sonatype.org") ||
        configuredUrl.includes("s01.oss.sonatype.org") ||
        configuredUrl.includes("central.sonatype.com") ||
        configuredUrl.includes("search.maven.org")
    ) {
        return DEFAULT_MAVEN_SEARCH_URL;
    }
    // For truly custom Maven repos (e.g., Nexus, Artifactory),
    // fall back to public search — the version may not be found,
    // and GitHub tags fallback will be used instead.
    return DEFAULT_MAVEN_SEARCH_URL;
}

/**
 * Fetches the latest version of a Java artifact from Maven Central.
 *
 * Expects the package name in Maven coordinate format: "groupId:artifactId"
 * (e.g., "io.github.fern-api:fern-java-sdk").
 *
 * Note: Maven publish URLs (e.g., Sonatype staging) differ from the search API.
 * For Maven Central, the Solr search API is always used.
 *
 * @param coordinate - The Maven coordinate in "groupId:artifactId" format
 * @param registryInfo - Registry URL and token from the output mode
 * @returns The latest version string, or undefined if the artifact doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromMaven(
    coordinate: string,
    registryInfo: RegistryInfo = { registryUrl: undefined, token: undefined, username: undefined }
): Promise<string | undefined> {
    try {
        const parts = coordinate.split(":");
        if (parts.length < 2 || !parts[0] || !parts[1]) {
            return undefined;
        }
        const groupId = parts[0];
        const artifactId = parts[1];

        const searchUrl = resolveMavenSearchUrl(registryInfo);
        const headers: Record<string, string> = {};
        const token = registryInfo.token ?? undefined;
        if (token != null && token !== "") {
            const username = registryInfo.username ?? "";
            headers.authorization = `Basic ${Buffer.from(`${username}:${token}`).toString("base64")}`;
        }

        const mavenUrl = `${searchUrl}?q=g:${encodeURIComponent(groupId)}+AND+a:${encodeURIComponent(artifactId)}&rows=1&wt=json`;
        const hasHeaders = Object.keys(headers).length > 0;
        const response = hasHeaders ? await fetch(mavenUrl, { headers }) : await fetch(mavenUrl);

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
 * Resolves the NuGet flat container URL.
 *
 * The config URL is typically "https://nuget.org/" but the flat container API
 * lives at "https://api.nuget.org/v3-flatcontainer". For the standard URL,
 * we map to the known API endpoint. For custom feeds, we try to derive the URL.
 */
function resolveNugetFlatContainerUrl(registryInfo: RegistryInfo): string {
    const configuredUrl = registryInfo.registryUrl;
    if (configuredUrl == null || configuredUrl === "") {
        return DEFAULT_NUGET_FLAT_CONTAINER_URL;
    }
    // Known NuGet Gallery URLs → use the standard flat container API
    if (configuredUrl.includes("nuget.org")) {
        return DEFAULT_NUGET_FLAT_CONTAINER_URL;
    }
    // For custom NuGet feeds, try appending the flat container path
    const baseUrl = configuredUrl.replace(/\/+$/, "");
    return `${baseUrl}/v3-flatcontainer`;
}

/**
 * Fetches the latest stable version of a NuGet package from the NuGet Gallery.
 *
 * Uses the NuGet V3 flat container API to list all versions, then selects the
 * latest non-prerelease version. For custom NuGet feeds, derives the flat container
 * URL from the configured base URL.
 *
 * @param packageName - The NuGet package name (e.g., "Newtonsoft.Json")
 * @param registryInfo - Registry URL and token from the output mode
 * @returns The latest stable version string, or undefined if the package doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromNuget(
    packageName: string,
    registryInfo: RegistryInfo = { registryUrl: undefined, token: undefined, username: undefined }
): Promise<string | undefined> {
    try {
        const flatContainerUrl = resolveNugetFlatContainerUrl(registryInfo);
        const headers: Record<string, string> = {};
        const token = registryInfo.token ?? undefined;
        if (token != null && token !== "") {
            // Use Basic auth for reading package metadata from private NuGet feeds.
            // X-NuGet-ApiKey is only for push operations and is ignored by read endpoints.
            // Basic auth with the API key as password is supported by Azure Artifacts,
            // GitHub Packages, MyGet, and other common private NuGet feeds.
            headers.authorization = `Basic ${Buffer.from(`:${token}`).toString("base64")}`;
        }

        const nugetUrl = `${flatContainerUrl}/${packageName.toLowerCase()}/index.json`;
        const hasHeaders = Object.keys(headers).length > 0;
        const response = hasHeaders ? await fetch(nugetUrl, { headers }) : await fetch(nugetUrl);

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
 * Resolves the RubyGems API URL from the configured registry URL.
 *
 * Standard RubyGems URL "https://rubygems.org/" maps to "https://rubygems.org/api/v1/gems".
 * Custom gem servers may have similar API paths.
 */
function resolveRubyGemsApiUrl(registryInfo: RegistryInfo): string {
    const configuredUrl = registryInfo.registryUrl;
    if (configuredUrl == null || configuredUrl === "") {
        return DEFAULT_RUBYGEMS_API_URL;
    }
    if (configuredUrl.includes("rubygems.org")) {
        return DEFAULT_RUBYGEMS_API_URL;
    }
    // For custom gem servers, append the API path
    const baseUrl = configuredUrl.replace(/\/+$/, "");
    return `${baseUrl}/api/v1/gems`;
}

/**
 * Fetches the latest version of a Ruby gem from RubyGems.org.
 *
 * For custom gem servers, derives the API URL from the configured base URL.
 *
 * @param packageName - The gem name (e.g., "rails")
 * @param registryInfo - Registry URL and token from the output mode
 * @returns The latest version string, or undefined if the gem doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromRubyGems(
    packageName: string,
    registryInfo: RegistryInfo = { registryUrl: undefined, token: undefined, username: undefined }
): Promise<string | undefined> {
    try {
        const apiUrl = resolveRubyGemsApiUrl(registryInfo);
        const headers: Record<string, string> = {};
        const token = registryInfo.token ?? undefined;
        if (token != null && token !== "") {
            headers.authorization = token;
        }

        const hasHeaders = Object.keys(headers).length > 0;
        const response = hasHeaders
            ? await fetch(`${apiUrl}/${packageName}.json`, { headers })
            : await fetch(`${apiUrl}/${packageName}.json`);

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
 * Uses the default public proxy at proxy.golang.org. Go modules don't have
 * a configurable registry URL in the output mode (they use GitHub), so this
 * always uses the public proxy. For private modules, the GitHub tags fallback
 * with GITHUB_TOKEN is used instead.
 *
 * @param modulePath - The Go module path (e.g., "github.com/owner/repo")
 * @param _registryInfo - Registry info (not used for Go, but kept for interface consistency)
 * @returns The latest version string (without "v" prefix), or undefined if not found
 */
/** @internal Exported for testing */
export async function getLatestVersionFromGoProxy(
    modulePath: string,
    _registryInfo: RegistryInfo = { registryUrl: undefined, token: undefined, username: undefined }
): Promise<string | undefined> {
    try {
        // Go module proxy requires case-encoding: uppercase letters become "!" + lowercase
        // e.g., "github.com/Azure/sdk" -> "github.com/!azure/sdk"
        const encodedPath = modulePath.replace(/[A-Z]/g, (c) => "!" + c.toLowerCase());
        const response = await fetch(`${DEFAULT_GO_PROXY_URL}/${encodedPath}/@latest`);

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
 * Resolves the Crates.io API URL.
 *
 * Standard crates URL "https://crates.io/api/v1/crates" is used directly.
 * Custom registries may have different API paths.
 */
function resolveCratesApiUrl(registryInfo: RegistryInfo): string {
    const configuredUrl = registryInfo.registryUrl;
    if (configuredUrl == null || configuredUrl === "") {
        return DEFAULT_CRATES_API_URL;
    }
    if (configuredUrl.includes("crates.io")) {
        return DEFAULT_CRATES_API_URL;
    }
    // For custom registries, use the configured URL directly
    return configuredUrl.replace(/\/+$/, "");
}

/**
 * Fetches the latest stable version of a Rust crate from Crates.io.
 *
 * For custom crate registries, uses the configured URL as the API base.
 *
 * @param packageName - The crate name (e.g., "serde")
 * @param registryInfo - Registry URL and token from the output mode
 * @returns The latest stable version string, or undefined if the crate doesn't exist
 */
/** @internal Exported for testing */
export async function getLatestVersionFromCrates(
    packageName: string,
    registryInfo: RegistryInfo = { registryUrl: undefined, token: undefined, username: undefined }
): Promise<string | undefined> {
    try {
        const apiUrl = resolveCratesApiUrl(registryInfo);
        const headers: Record<string, string> = {
            // Crates.io requires a User-Agent header
            "user-agent": "fern-cli (https://buildwithfern.com)"
        };
        const token = registryInfo.token ?? undefined;
        if (token != null && token !== "") {
            headers.authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${apiUrl}/${packageName}`, { headers });

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
 * Fetches the latest release tag from a GitHub repository.
 *
 * Delegates to the shared @fern-api/github utility, which supports
 * GITHUB_TOKEN environment variable for authenticated access to private repositories.
 *
 * @param githubRepository - Repository in "owner/repo" format
 * @returns The latest release tag name, or undefined if no releases exist
 */
/** @internal Exported for testing */
export async function getLatestRelease(githubRepository: string): Promise<string | undefined> {
    try {
        return await getLatestReleaseFromGithub(githubRepository);
    } catch (error) {
        // Repository doesn't exist or API error
        return undefined;
    }
}

/**
 * Fetches the sdkVersion from the .fern/metadata.json file in the GitHub repository.
 * This file is written by Fern generators during previous SDK generations.
 *
 * @param githubRepository - Repository in "owner/repo" format
 * @returns The sdkVersion string, or undefined if the file doesn't exist or lacks the field
 */
/** @internal Exported for testing */
export async function getVersionFromMetadataJson(githubRepository: string): Promise<string | undefined> {
    try {
        const content = await getFileContent(githubRepository, ".fern/metadata.json");
        if (content != null) {
            const metadata = JSON.parse(content) as FernMetadataJson;
            if (metadata.sdkVersion != null) {
                return metadata.sdkVersion;
            }
        }
        return undefined;
    } catch (error) {
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
