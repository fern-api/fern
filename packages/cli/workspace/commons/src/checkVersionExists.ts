import type { generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";

/**
 * Resolves the package name from the raw generator configuration.
 *
 * This is necessary because `generatorsYml.getPackageName()` returns `undefined`
 * for `publish` / `publishV2` output modes (the package name lives in the raw
 * output config, not in the Fiddle output-mode object). The local generation
 * path already used a similar helper; this shared version ensures the remote
 * path can also resolve the name.
 *
 * Lookup order:
 * 1. `output["package-name"]` — npm, PyPI, NuGet, RubyGems, crates.io
 * 2. `output.coordinate`      — Maven (Java)
 * 3. `config.package_name`    — fallback (some generators)
 * 4. `config.module.path`     — Go SDK generator
 *
 * @internal Exported for testing and reuse in generation paths
 */
export function getPackageNameFromGeneratorConfig(
    generatorInvocation: generatorsYml.GeneratorInvocation
): string | undefined {
    // Check output.package-name for npm/PyPI/etc.
    if (typeof generatorInvocation.raw?.output === "object" && generatorInvocation.raw?.output !== null) {
        const packageName = (generatorInvocation.raw.output as { ["package-name"]?: string })["package-name"];
        if (packageName != null) {
            return packageName;
        }

        // Check output.coordinate for Maven (Java)
        const coordinate = (generatorInvocation.raw.output as { coordinate?: string }).coordinate;
        if (coordinate != null) {
            return coordinate;
        }
    }

    // Check config.package_name if output.package-name is not set
    if (typeof generatorInvocation.raw?.config === "object" && generatorInvocation.raw?.config !== null) {
        const packageName = (generatorInvocation.raw.config as { package_name?: string }).package_name;
        if (packageName != null) {
            return packageName;
        }

        // go-sdk generator uses module.path to set the package name
        const modulePath = (generatorInvocation.raw.config as { module?: { path?: string } }).module?.path;
        if (modulePath != null) {
            return modulePath;
        }
    }
    return undefined;
}

// ─── Constants ──────────────────────────────────────────────────────

/** Timeout for registry HTTP calls (ms). Prevents slow registries from delaying generation start. */
const REGISTRY_TIMEOUT_MS = 5_000;

// ─── Registry info (custom URL + auth) ──────────────────────────────

interface RegistryInfo {
    /** Custom registry URL, if configured (undefined = use public default). */
    url?: string;
    /** Auth token for the registry, if configured. */
    token?: string;
}

/**
 * Extracts the registry URL and auth token from the raw output config.
 * Each registry location stores them in slightly different fields.
 * @internal Exported for testing
 */
export function getRegistryInfoFromOutput(generatorInvocation: generatorsYml.GeneratorInvocation): RegistryInfo {
    const output = generatorInvocation.raw?.output;
    if (typeof output !== "object" || output == null) {
        return {};
    }
    const o = output as unknown as Record<string, unknown>;
    const url = typeof o.url === "string" ? resolveEnvVar(o.url) : undefined;
    // npm/pypi/crates use "token"; nuget/rubygems use "api-key"; maven uses "password"
    const rawToken =
        typeof o.token === "string" ? o.token : typeof o["api-key"] === "string" ? (o["api-key"] as string) : undefined;
    const token = rawToken != null ? resolveEnvVar(rawToken) : undefined;
    return { url, token };
}

/**
 * Resolves a value that may be an environment variable reference (e.g. `${NPM_TOKEN}`).
 * If the value matches the `${VAR}` pattern, looks it up in `process.env`.
 * Returns `undefined` if the env var is not set.
 * @internal Exported for testing
 */
export function resolveEnvVar(value: string): string | undefined {
    const match = value.match(/^\$\{(.+)\}$/);
    if (match?.[1] != null) {
        return process.env[match[1]];
    }
    return value;
}

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
 * for the given generator invocation.
 *
 * Behavior by output mode:
 * - **publish / publishV2**: Fails immediately if the version already exists on the registry.
 * - **githubV2**: Logs a warning if the version already exists on the registry (since GitHub CI
 *   may publish to a package registry downstream, but the generation itself shouldn't be blocked).
 * - **downloadFiles**: Skipped entirely (no publishing involved).
 *
 * This is a best-effort check — network errors, timeouts, or unsupported registries
 * are silently ignored so that generation is not blocked unnecessarily.
 *
 * Private registry support:
 * - **npm**: Reads the custom registry URL and token from the output config.
 *   Falls back to `NPM_TOKEN` env var for auth if no config token is set.
 * - **Other registries**: If a custom URL is configured, the check is skipped
 *   because private registries have varying APIs.
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

    // Determine whether to fail or just warn based on output mode
    const isPublishMode =
        generatorInvocation.outputMode.type === "publishV2" || generatorInvocation.outputMode.type === "publish";

    // Fallback to raw config when the Fiddle output-mode doesn't carry a package name
    // (this is the case for publish / publishV2 output modes).
    const resolvedPackageName = packageName ?? getPackageNameFromGeneratorConfig(generatorInvocation);

    if (generatorInvocation.language == null || resolvedPackageName == null) {
        return;
    }

    const language = generatorInvocation.language;
    const registryInfo = getRegistryInfoFromOutput(generatorInvocation);

    context.logger.debug(
        `Checking ${getRegistryName(language)} for ${resolvedPackageName}@${version}` +
            (registryInfo.url != null ? ` (registry: ${registryInfo.url})` : "") +
            (registryInfo.token != null ? " (with auth)" : "")
    );

    let exists: boolean;
    try {
        exists = await doesVersionExistOnRegistry({
            packageName: resolvedPackageName,
            version,
            language,
            registryInfo
        });
    } catch (error) {
        // Best-effort check — if we can't reach the registry, don't block generation.
        // The error will surface later during the actual publish step.
        context.logger.debug(
            `Could not verify version availability on ${getRegistryName(language)}: ${error instanceof Error ? error.message : String(error)}`
        );
        return;
    }
    if (exists) {
        if (isPublishMode) {
            context.failAndThrow(
                `Version ${version} of ${resolvedPackageName} already exists on the ${getRegistryName(language)} registry. ` +
                    `Please use a different version number. ` +
                    `If you want to automatically increment the version, omit the --version flag.`
            );
        } else {
            context.logger.warn(
                `Version ${version} of ${resolvedPackageName} already exists on the ${getRegistryName(language)} registry. ` +
                    `If your CI pipeline publishes this version, it may fail.`
            );
        }
    }
}

// ─── Registry version checking ──────────────────────────────────────

/**
 * Checks whether a specific version of a package exists on the relevant registry.
 *
 * @returns true if the version exists, false otherwise
 * @internal Exported for testing
 */
export async function doesVersionExistOnRegistry({
    packageName,
    version,
    language,
    registryInfo
}: {
    packageName: string;
    version: string;
    language: string;
    registryInfo?: RegistryInfo;
}): Promise<boolean> {
    const info = registryInfo ?? {};
    switch (language) {
        case "typescript":
            return await doesNpmVersionExist(packageName, version, info);
        case "python":
            return await doesPypiVersionExist(packageName, version, info);
        case "java":
            return await doesMavenVersionExist(packageName, version, info);
        case "csharp":
            return await doesNugetVersionExist(packageName, version, info);
        case "ruby":
            return await doesRubyGemsVersionExist(packageName, version, info);
        case "go":
            return await doesGoVersionExist(packageName, version, info);
        case "rust":
            return await doesCratesVersionExist(packageName, version, info);
        default:
            return false;
    }
}

/**
 * Checks if a specific version of an npm package exists.
 * Uses the npm registry's version-specific endpoint which returns 200 if the version exists.
 * Supports private registries via NPM_TOKEN.
 * @internal Exported for testing
 */
export async function doesNpmVersionExist(
    packageName: string,
    version: string,
    registryInfo: RegistryInfo = {}
): Promise<boolean> {
    const encodedName = encodeURIComponent(packageName).replace(/^%40/, "@");
    const headers: Record<string, string> = {
        accept: "application/json"
    };
    // Auth: prefer token from output config, fall back to NPM_TOKEN env var
    const npmToken = registryInfo.token ?? process.env.NPM_TOKEN;
    if (npmToken != null) {
        headers.authorization = `Bearer ${npmToken}`;
    }
    const baseUrl = registryInfo.url ?? "https://registry.npmjs.org";
    // Strip trailing slash for consistent URL construction
    const registryUrl = baseUrl.replace(/\/+$/, "");
    const url = `${registryUrl}/${encodedName}/${version}`;
    const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });
    if (!response.ok) {
        // 401/403 means auth failed — we can't tell whether the version exists.
        // Throw so the caller logs a debug message instead of silently passing.
        if (response.status === 401 || response.status === 403) {
            throw new Error(
                `Registry returned ${response.status} for ${url} — unable to verify version (auth may be missing or invalid)`
            );
        }
        return false;
    }
    const data = (await response.json()) as NpmRegistryVersionResponse;
    return data.version === version;
}

/**
 * Checks if a specific version of a PyPI package exists.
 * PyPI provides a version-specific JSON endpoint.
 * @internal Exported for testing
 */
export async function doesPypiVersionExist(
    packageName: string,
    version: string,
    registryInfo: RegistryInfo = {}
): Promise<boolean> {
    if (registryInfo.url != null) {
        // Private PyPI registries use the simple API: GET /{package}/ and parse version links.
        // However, the format varies widely — skip the check for private registries.
        return false;
    }
    const response = await fetch(`https://pypi.org/pypi/${packageName}/${version}/json`, {
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });
    return response.ok;
}

/**
 * Checks if a specific version of a Maven artifact exists.
 * Searches Maven Central for the specific group:artifact:version combination.
 * @internal Exported for testing
 */
export async function doesMavenVersionExist(
    coordinate: string,
    version: string,
    registryInfo: RegistryInfo = {}
): Promise<boolean> {
    if (registryInfo.url != null) {
        // Private Maven registries (Artifactory, Nexus) have varying APIs — skip the check.
        return false;
    }
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
 * @internal Exported for testing
 */
export async function doesNugetVersionExist(
    packageName: string,
    version: string,
    registryInfo: RegistryInfo = {}
): Promise<boolean> {
    if (registryInfo.url != null) {
        // Private NuGet feeds have varying APIs — skip the check.
        return false;
    }
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
 * @internal Exported for testing
 */
export async function doesRubyGemsVersionExist(
    packageName: string,
    version: string,
    registryInfo: RegistryInfo = {}
): Promise<boolean> {
    if (registryInfo.url != null) {
        // Private RubyGems servers have varying APIs — skip the check.
        return false;
    }
    const response = await fetch(`https://rubygems.org/api/v2/rubygems/${packageName}/versions/${version}.json`, {
        signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS)
    });
    return response.ok;
}

/**
 * Checks if a specific version of a Go module exists.
 * Uses the Go Module Proxy's version-specific info endpoint.
 * @internal Exported for testing
 */
export async function doesGoVersionExist(
    modulePath: string,
    version: string,
    _registryInfo: RegistryInfo = {}
): Promise<boolean> {
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
 * @internal Exported for testing
 */
export async function doesCratesVersionExist(
    packageName: string,
    version: string,
    registryInfo: RegistryInfo = {}
): Promise<boolean> {
    if (registryInfo.url != null) {
        // Private crate registries have varying APIs — skip the check.
        return false;
    }
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
 * @internal Exported for testing
 */
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
