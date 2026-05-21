import type { RawSpecsManifestEntry } from "./copySpecs.js";
import type { FernCliCustomConfig } from "./customConfig.js";
import { SpecCache } from "./specCache.js";

/**
 * The name shipped by the SDK template — used as the literal token to
 * substitute when we patch the user output's Cargo.toml. Source-side
 * references to this string (e.g. the placeholder folder
 * `cli/openapi-fixture/main.rs`, the `name = "openapi-fixture"` field in
 * the [[bin]] block) get rewritten to the derived binary name.
 */
export const TEMPLATE_BINARY_NAME = "openapi-fixture";

/**
 * Resolve the binary name for the generated CLI:
 *
 *   - `customConfig.binaryName` if set (kebab-cased)
 *   - else, for a single-spec workspace, the spec's `info.title`
 *     (kebab-cased)
 *   - else (multi-spec without an override) → throw a clear error
 *
 * The function reads the bundled spec file referenced by the manifest
 * entry, so the caller hands in only the manifest, not the bundled spec
 * bytes.
 */
export async function deriveBinaryName(args: {
    customConfig: FernCliCustomConfig;
    openapiSpecs: RawSpecsManifestEntry[];
    /**
     * Optional parsed-spec cache. Falls back to a one-off cache when
     * omitted; callers running multiple consumers over the same specs
     * (the production pipeline does) should pass their shared cache.
     */
    specCache?: SpecCache;
}): Promise<string> {
    const { customConfig, openapiSpecs } = args;
    const cache = args.specCache ?? new SpecCache();

    if (customConfig.binaryName != null && customConfig.binaryName.trim() !== "") {
        return asValidBinaryName(customConfig.binaryName, "`customConfig.binaryName`");
    }

    if (openapiSpecs.length === 0) {
        throw new Error(
            "deriveBinaryName called with no OpenAPI specs; the generator should have skipped before reaching this point."
        );
    }

    if (openapiSpecs.length > 1) {
        throw new Error(
            "Multi-spec workspaces must set `customConfig.binaryName` in generators.yml — " +
                "the generator can't infer a single binary name from multiple OpenAPI specs."
        );
    }

    const [only] = openapiSpecs;
    if (only == null) {
        throw new Error("Unreachable: openapiSpecs.length === 1 but no entry at index 0.");
    }
    const title = await readSpecInfoTitle(only.specPath, cache);
    if (title == null || title.trim() === "") {
        throw new Error(
            `Cannot derive a binary name: the mounted spec at ${only.specPath} has no \`info.title\`. ` +
                "Set `customConfig.binaryName` in generators.yml, or add an `info.title` to the spec."
        );
    }
    return asValidBinaryName(title, `spec \`info.title\` at ${only.specPath}`);
}

/**
 * Kebab-case + guard against inputs that contain no valid binary-name
 * characters (`!!!`, `// // //`, all-punctuation). Those would otherwise
 * silently produce an empty string and emit a malformed Cargo.toml
 * ([[bin]] name = ""). We throw with a pointer to the source so the
 * user can fix the offending input.
 */
function asValidBinaryName(raw: string, source: string): string {
    const kebab = toKebabCase(raw);
    if (kebab === "") {
        throw new Error(
            `Cannot derive a binary name from ${source}: ` +
                `the input ${JSON.stringify(raw)} contains no alphanumeric characters. ` +
                "Set `customConfig.binaryName` in generators.yml to a kebab-case identifier."
        );
    }
    return kebab;
}

/**
 * Read just the `info.title` field from a bundled OpenAPI spec via the
 * shared cache. Returns `null` when the file can't be parsed or
 * `info.title` is missing.
 */
async function readSpecInfoTitle(specPath: string, cache: SpecCache): Promise<string | null> {
    const parsed = await cache.read(specPath);
    const title = parsed?.info?.title;
    return typeof title === "string" ? title : null;
}

/**
 * Normalize an arbitrary string into a kebab-case binary identifier.
 * "Query Parameters API" → "query-parameters-api"
 * "ACME_Public_API_v3"   → "acme-public-api-v3"
 * "  foo--Bar  "         → "foo-bar"
 *
 * The result is always lowercase, contains only `[a-z0-9-]`, and has no
 * leading/trailing/duplicate dashes.
 */
export function toKebabCase(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

/**
 * Convert a binary-name-ish or scheme-name-ish string into an env-var
 * prefix. Handles kebab, snake, and camelCase / PascalCase / acronyms,
 * always producing UPPER_SNAKE.
 *
 *   "acme"           → "ACME"
 *   "acme-public"    → "ACME_PUBLIC"
 *   "bearerAuth"     → "BEARER_AUTH"      (camelCase split)
 *   "ACMEPublic"     → "ACME_PUBLIC"      (acronym + Pascal split)
 *   "API_KEY"        → "API_KEY"          (already snake, untouched)
 *
 * Concatenated with `_TOKEN` / `_API_KEY` / `_USERNAME` etc. by the
 * caller to produce the full env-var name.
 */
export function toEnvVarPrefix(input: string): string {
    return input
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2") // "ACMEPublic" → "ACME_Public"
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2") // "bearerAuth" → "bearer_Auth"
        .toUpperCase()
        .replace(/-/g, "_")
        .replace(/_{2,}/g, "_");
}
