import type { FernCliCustomConfig } from "./customConfig.js";
import type { IrSummary } from "./ir.js";

/**
 * The name shipped by the SDK template — used as the literal token to
 * substitute when we patch the user output's Cargo.toml. Source-side
 * references to this string (e.g. the placeholder folder
 * `cli/openapi-fixture/main.rs`, the `name = "openapi-fixture"` field in
 * the [[bin]] block) get rewritten to the derived binary name.
 */
export const TEMPLATE_BINARY_NAME = "openapi-fixture";

/**
 * Resolve the binary name for the generated CLI from one of:
 *
 *   1. `customConfig.binaryName` if set in `generators.yml`
 *   2. else, the IR's `apiDisplayName` (kebab-cased) — Fern's
 *      canonical name for the workspace's API
 *   3. else throw a clear error
 *
 * Lives in the IR rather than the raw spec because `apiDisplayName`
 * comes from `generators.yml` / Fern definitions, not from OpenAPI's
 * `info.title`. The OpenAPI-only fallback path is intentionally
 * absent — workspaces without an IR shouldn't reach this code path.
 */
export function deriveBinaryName(args: { customConfig: FernCliCustomConfig; ir: IrSummary }): string {
    const { customConfig, ir } = args;

    if (customConfig.binaryName != null && customConfig.binaryName.trim() !== "") {
        return asValidBinaryName(customConfig.binaryName, "`customConfig.binaryName`");
    }

    if (ir.apiDisplayName !== undefined && ir.apiDisplayName.trim() !== "") {
        return asValidBinaryName(ir.apiDisplayName, "IR `apiDisplayName`");
    }

    throw new Error(
        "Cannot derive a binary name: `customConfig.binaryName` is unset and the IR has no `apiDisplayName`. " +
            "Set `customConfig.binaryName` in generators.yml to a kebab-case identifier."
    );
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
