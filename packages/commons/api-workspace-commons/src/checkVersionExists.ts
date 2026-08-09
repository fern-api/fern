import type { generatorsYml } from "@fern-api/configuration";
import { extractErrorMessage } from "@fern-api/core-utils";
import type { HttpMethod, IdempotencyKeyGeneration } from "@fern-api/ir-sdk";
import { CliError, TaskContext } from "@fern-api/task-context";
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
 * 4. `config["package-name"]` — Java SDK generator (kebab-case config key)
 * 5. `config.module.path`     — Go SDK generator
 * 6. `config.packageName`     — PHP SDK generator (camelCase config key)
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

        // java-sdk generator uses the kebab-case package-name config key
        const kebabCasePackageName = (generatorInvocation.raw.config as { ["package-name"]?: unknown })["package-name"];
        if (typeof kebabCasePackageName === "string") {
            return kebabCasePackageName;
        }

        // go-sdk generator uses module.path to set the package name
        const modulePath = (generatorInvocation.raw.config as { module?: { path?: string } }).module?.path;
        if (modulePath != null) {
            return modulePath;
        }

        // php-sdk generator uses the camelCase packageName config key
        const camelCasePackageName = (generatorInvocation.raw.config as { packageName?: unknown }).packageName;
        if (typeof camelCasePackageName === "string") {
            return camelCasePackageName;
        }
    }
    return undefined;
}

/**
 * Resolves the user-agent template from the raw generator configuration.
 *
 * When set, this template is interpolated and used as the `User-Agent` header
 * value. Supported placeholders (resolved statically at generation time):
 *
 *   {packageName}      — published package name from output config
 *   {version}          — SDK/package version
 *   {language}         — generation language (python, typescript, go, …)
 *   {generatorVersion} — Fern generator version
 *   {organization}     — organization from fern.config.json
 *   {apiName}          — API name from the root API definition
 *
 * Default (when absent): `{packageName}/{version}`
 *
 * Lookup: `config["user-agent"]`
 */
export function getUserAgentTemplateFromGeneratorConfig(
    generatorInvocation: generatorsYml.GeneratorInvocation
): string | undefined {
    if (typeof generatorInvocation.raw?.config === "object" && generatorInvocation.raw?.config !== null) {
        const template = (generatorInvocation.raw.config as { "user-agent"?: string })["user-agent"];
        if (template != null) {
            return template;
        }
    }
    return undefined;
}

/** Default wire header for the auto-generated idempotency key. */
const DEFAULT_IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";

/** Retry-unsafe methods that are eligible for auto-generation by default. */
const DEFAULT_IDEMPOTENCY_KEY_METHODS: HttpMethod[] = ["POST", "PUT"];

const ALL_HTTP_METHODS: ReadonlySet<string> = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]);

function parseIdempotencyKeyMethods(value: unknown): HttpMethod[] {
    if (!Array.isArray(value)) {
        return DEFAULT_IDEMPOTENCY_KEY_METHODS;
    }
    const methods = value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.toUpperCase())
        .filter((entry): entry is HttpMethod => ALL_HTTP_METHODS.has(entry));
    return methods.length > 0 ? methods : DEFAULT_IDEMPOTENCY_KEY_METHODS;
}

/**
 * Resolves the idempotency-key auto-generation config from the raw generator configuration.
 *
 * When enabled, generators auto-generate an idempotency key header on the eligible HTTP
 * methods (POST/PUT by default) unless the caller supplies one. This is resolved once by the
 * CLI and threaded into the IR (`SdkConfig.idempotencyKeyGeneration`) so every generator reads
 * the same value instead of each defining its own config key and re-deriving the behavior.
 *
 * Accepts either a boolean shorthand or an object with an optional custom header name and
 * an optional eligible-method list:
 *
 *   config:
 *     auto-generate-idempotency-key: true
 *   # or
 *     auto-generate-idempotency-key:
 *       header-name: "Idempotency-Key"
 *       methods: ["POST", "PUT"]
 *
 * The value may be set per-generator (under a generator's `config`) or globally at the top level
 * of `generators.yml`; the per-generator value overrides the global one. That precedence is
 * resolved at configuration-load time and stamped onto the invocation. Returns `undefined` when
 * disabled.
 */
export function getIdempotencyKeyGenerationFromGeneratorConfig(
    generatorInvocation: generatorsYml.GeneratorInvocation
): IdempotencyKeyGeneration | undefined {
    // The effective config (per-generator `config.auto-generate-idempotency-key` falling back to the
    // global generators.yml default) is resolved and stamped onto the invocation at configuration-load
    // time. Fall back to reading the per-generator config directly for callers that build invocations
    // without going through the loader.
    const value =
        generatorInvocation.idempotencyKeyGenerationConfig ??
        getRawPerGeneratorIdempotencyKeyConfig(generatorInvocation);
    return resolveIdempotencyKeyGeneration(value);
}

/**
 * Reads the raw `auto-generate-idempotency-key` value from a generator's own `config` block.
 *
 * Prefers the raw (unvalidated) generators.yml config, which is always present in the production
 * generation path and preserves CLI-only keys verbatim. Falls back to the resolved `config` when
 * `raw` is absent — this happens for synthetic invocations (e.g. the seed test harness) that
 * populate `config` directly without a `raw` block.
 */
function getRawPerGeneratorIdempotencyKeyConfig(generatorInvocation: generatorsYml.GeneratorInvocation): unknown {
    const config =
        typeof generatorInvocation.raw?.config === "object" && generatorInvocation.raw?.config !== null
            ? generatorInvocation.raw.config
            : typeof generatorInvocation.config === "object" && generatorInvocation.config !== null
              ? generatorInvocation.config
              : undefined;
    if (config == null) {
        return undefined;
    }
    return (config as { "auto-generate-idempotency-key"?: unknown })["auto-generate-idempotency-key"];
}

/**
 * Normalizes a raw `auto-generate-idempotency-key` value (boolean shorthand or object) into the
 * resolved IR shape. Returns `undefined` when disabled.
 */
export function resolveIdempotencyKeyGeneration(value: unknown): IdempotencyKeyGeneration | undefined {
    if (value === true) {
        return { headerName: DEFAULT_IDEMPOTENCY_KEY_HEADER, methods: DEFAULT_IDEMPOTENCY_KEY_METHODS };
    }
    if (typeof value === "object" && value !== null) {
        const headerName = (value as { "header-name"?: unknown })["header-name"];
        return {
            headerName: typeof headerName === "string" ? headerName : DEFAULT_IDEMPOTENCY_KEY_HEADER,
            methods: parseIdempotencyKeyMethods((value as { methods?: unknown })["methods"])
        };
    }
    return undefined;
}

/** Config keys consumed by the CLI and not forwarded to generators. */
const CLI_ONLY_CONFIG_KEYS: ReadonlySet<string> = new Set(["user-agent", "auto-generate-idempotency-key"]);

/**
 * Returns a copy of the generator's custom config with CLI-only keys removed.
 * Generators validate their config strictly; CLI-consumed keys like `user-agent`
 * must be stripped before forwarding.
 */
export function stripCliConfigKeys(config: unknown): unknown {
    if (typeof config !== "object" || config === null) {
        return config;
    }
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(config)) {
        if (!CLI_ONLY_CONFIG_KEYS.has(key)) {
            filtered[key] = value;
        }
    }
    return filtered;
}

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
 * for the given generator invocation.
 *
 * Behavior by output mode:
 * - **publish / publishV2**: Fails immediately if the version already exists on the registry.
 * - **githubV2**: Logs a warning if the version already exists on the registry (since GitHub CI
 *   may publish to a package registry downstream, but the generation itself shouldn't be blocked).
 * - **downloadFiles**: Skipped entirely (no publishing involved).
 *
 * This is a best-effort check — network errors, timeouts, or unsupported registries
 * are silently ignored so that generation is not blocked unnecessarily. Only public
 * registries are checked; private/custom registries are not supported.
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

    let exists: boolean;
    try {
        exists = await doesVersionExistOnRegistry({
            packageName: resolvedPackageName,
            version,
            language
        });
    } catch (error) {
        // Best-effort check — if we can't reach the registry, don't block generation.
        // The error will surface later during the actual publish step.
        context.logger.debug(
            `Could not verify version availability on ${getRegistryName(language)}: ${extractErrorMessage(error)}`
        );
        return;
    }
    if (exists) {
        if (isPublishMode) {
            context.failAndThrow(
                `Version ${version} of ${resolvedPackageName} already exists on the ${getRegistryName(language)} registry. ` +
                    `Please use a different version number. ` +
                    `If you want to automatically increment the version, omit the --version flag.`,
                undefined,
                { code: CliError.Code.VersionError }
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
 * Checks whether a specific version of a package exists on the relevant public registry.
 *
 * @returns true if the version exists, false otherwise
 * @internal Exported for testing
 */
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
 * Checks if a specific version of an npm package exists on the public npm registry.
 * @internal Exported for testing
 */
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
 * @internal Exported for testing
 */
export async function doesPypiVersionExist(packageName: string, version: string): Promise<boolean> {
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
 * @internal Exported for testing
 */
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
 * @internal Exported for testing
 */
export async function doesRubyGemsVersionExist(packageName: string, version: string): Promise<boolean> {
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
 * @internal Exported for testing
 */
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
