/**
 * Faithful TypeScript port of the Fern CLI SDK (Rust) naming and flag rules.
 *
 * The CLI dynamic-snippets generator renders commands in the browser from a dynamic IR (one is
 * built per generation language, so the CLI gets its own `cli` IR). Because there is no committed
 * catalog to lift flag names from, this module reproduces the Rust runtime's naming so the
 * generated commands match what `fern-cli-generator` actually builds. The parity test
 * (`__test__/parity`) asserts these functions against the runtime's `--schema` output so the
 * port cannot silently drift.
 *
 * Rust sources (generators/cli/sdk/src):
 *  - `openapi/parser.rs`  — `camel_to_kebab`, `tokenize`, `strip_tag_prefix`, command naming
 *  - `openapi/commands.rs` — `resolve_param_flag_name`, `flag_name_is_reserved`, `BUILTIN_FLAG_NAMES`
 *  - `text.rs`            — `to_kebab_flag`, `sanitize_flag_name`
 */

/** Where a parameter's value is read from in the request. Mirrors MethodParameter.location. */
export type ParameterLocation = "path" | "query" | "header" | "body";

/**
 * Names of built-in flags that must not be duplicated by parameter-derived flags.
 * Verbatim from `BUILTIN_FLAG_NAMES` (generators/cli/sdk/src/openapi/commands.rs:91).
 */
export const BUILTIN_FLAG_NAMES: readonly string[] = [
    "params",
    "output",
    "json",
    "format",
    "dry-run",
    "base-url",
    "page-all",
    "page-limit",
    "page-delay",
    "no-pager",
    "no-extract",
    "retries",
    "no-retry",
    "no-stream",
    "quiet",
    "query",
    "help",
    "debug",
    "schema",
    "user-agent-suffix"
];

const BUILTIN_FLAG_NAME_SET = new Set(BUILTIN_FLAG_NAMES);

/**
 * Whether a parameter-derived flag long name is reserved by the runtime and therefore must be
 * mangled (`-param` suffix) to avoid a clap duplicate-flag panic.
 *
 * Mirrors the Rust `flag_name_is_reserved`: the always-present built-ins, plus two
 * config-dependent reservations the caller supplies in `additionalReserved` — a renamed
 * `userAgentSuffixFlag` and the `profile` flag when `profiles` is enabled.
 */
export function flagNameIsReserved(flag: string, additionalReserved?: ReadonlySet<string>): boolean {
    return BUILTIN_FLAG_NAME_SET.has(flag) || (additionalReserved?.has(flag) ?? false);
}

/**
 * Convert an operationId / method name to kebab-case the way Fern's OpenAPI importer does.
 * Port of `camel_to_kebab` (parser.rs:1880): any non-alphanumeric run becomes a single `-`,
 * uppercase letters start a new word, trailing dashes are trimmed. Leading dashes never appear
 * because the separator is only emitted once `result` is non-empty.
 */
export function camelToKebab(s: string): string {
    let result = "";
    for (const ch of s) {
        if (!isAsciiAlphanumeric(ch)) {
            if (result.length > 0 && !result.endsWith("-")) {
                result += "-";
            }
        } else if (isAsciiUppercase(ch)) {
            if (result.length > 0 && !result.endsWith("-")) {
                result += "-";
            }
            result += ch.toLowerCase();
        } else {
            result += ch;
        }
    }
    while (result.endsWith("-")) {
        result = result.slice(0, -1);
    }
    return result;
}

// NOTE: the command group/method names are taken from the dynamic IR's `fernFilepath` +
// `declaration.name` (which Fern's OpenAPI importer already derived from
// x-fern-sdk-group-name/method-name → tag → operationId, with tag-prefix stripping), so the Rust
// `tokenize` / `strip_tag_prefix` rules are NOT re-implemented here — they would be dead code. Only
// `camelToKebab` is needed, to kebab those already-resolved names.

/**
 * Convert an identifier to a CLI flag name. Port of `to_kebab_flag` (text.rs:115): only `_` and `-`
 * are word separators (collapsed to a single `-`), uppercase letters start a new word. Unlike
 * `camelToKebab`, trailing dashes are NOT trimmed and non-alphanumeric characters other than
 * `_`/`-` are preserved (e.g. a literal dot in `Parameter1.Name`).
 */
export function toKebabFlag(s: string): string {
    const chars = [...s];
    let result = "";
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i] as string;
        if (ch === "_" || ch === "-") {
            if (result.length > 0 && !result.endsWith("-")) {
                result += "-";
            }
        } else if (isAsciiUppercase(ch)) {
            if (i > 0 && result.length > 0 && !result.endsWith("-")) {
                result += "-";
            }
            result += ch.toLowerCase();
        } else {
            result += ch;
        }
    }
    return result;
}

/**
 * Sanitize an OpenAPI parameter wire name into a valid CLI flag name. Port of `sanitize_flag_name`
 * (text.rs:172). Returns `undefined` (the Rust `Err` case) when the name contains control/whitespace
 * characters, or non-ASCII characters that survive NFKD decomposition (CJK, RTL, etc.), or sanitizes
 * to empty. The caller routes those inputs through `--params` instead of a dedicated flag.
 */
export function sanitizeFlagName(wireName: string): string | undefined {
    if (wireName.length === 0) {
        return undefined;
    }

    // Step 1: reject control characters and whitespace.
    for (const ch of wireName) {
        const code = ch.codePointAt(0) ?? 0;
        if (code <= 0x1f || code === 0x7f) {
            return undefined;
        }
        if (/\s/u.test(ch)) {
            return undefined;
        }
    }

    // Step 2: NFKD decompose → strip combining marks (category M) and zero-width / bidi-control
    // codepoints → reject remaining non-ASCII. `\p{M}` covers Mn/Mc/Me like Rust's is_combining_mark;
    // the explicit ranges cover the zero-width space / joiners and LTR/RTL bidi controls.
    const decomposed = wireName
        .normalize("NFKD")
        .replace(/\p{M}/gu, "")
        .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/gu, "");

    for (const ch of decomposed) {
        if ((ch.codePointAt(0) ?? 0) > 0x7f) {
            return undefined;
        }
    }

    // Steps 3 + 4: kebab-case normalize with extended sanitization, then tidy.
    const sanitized = toKebabFlagSanitized(decomposed);
    if (sanitized.length === 0) {
        return undefined;
    }
    return sanitized;
}

/**
 * Like `toKebabFlag` but treats *any* non-alphanumeric character as a word separator (not just
 * `_`/`-`), and trims trailing dashes. Port of `to_kebab_flag_sanitized` (text.rs:235).
 */
function toKebabFlagSanitized(s: string): string {
    const chars = [...s];
    let result = "";
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i] as string;
        if (isAsciiAlphanumeric(ch)) {
            if (isAsciiUppercase(ch)) {
                if (i > 0 && result.length > 0 && !result.endsWith("-")) {
                    result += "-";
                }
                result += ch.toLowerCase();
            } else {
                result += ch;
            }
        } else if (result.length > 0 && !result.endsWith("-")) {
            result += "-";
        }
    }
    while (result.endsWith("-")) {
        result = result.slice(0, -1);
    }
    return result;
}

/** Inputs to `resolveParamFlagName`, mirroring the fields of the Rust `MethodParameter`. */
export interface FlagNameParameter {
    location: ParameterLocation;
    /** `x-fern-parameter-name` rename, already kebab-cased by the importer. Wins when present. */
    flagNameOverride?: string;
    /** `display_name` resolved from the parameter; used as the flag source when set. */
    displayName?: string;
}

/**
 * Resolve the CLI flag name for a parameter, replicating `resolve_param_flag_name`
 * (commands.rs:1205): override → body-kebab vs non-body-sanitize → builtin-collision `-param`
 * suffix. Returns `undefined` when `sanitizeFlagName` rejects the name — the caller then routes the
 * value through the command's `--params` catch-all.
 */
export function resolveParamFlagName(
    param: FlagNameParameter,
    wireName: string,
    additionalReserved?: ReadonlySet<string>
): string | undefined {
    let flag: string;
    if (param.flagNameOverride != null) {
        flag = param.flagNameOverride;
    } else {
        const source = param.displayName ?? wireName;
        if (param.location === "body") {
            flag = toKebabFlag(source);
        } else {
            const sanitized = sanitizeFlagName(source);
            if (sanitized == null) {
                return undefined;
            }
            flag = sanitized;
        }
    }
    if (flagNameIsReserved(flag, additionalReserved)) {
        flag = `${flag}-param`;
    }
    return flag;
}

/**
 * Resolve the CLI flag name for a multipart (file-upload) field. Port of
 * `resolve_multipart_field_flag_name` (commands.rs:1230): kebab-case the wire name, and return
 * `undefined` when that name is reserved — unlike ordinary params, a reserved multipart field gets
 * NO flag (no `-param` suffix) and is reachable only through `--params`.
 */
export function resolveMultipartFieldFlagName(
    wireName: string,
    additionalReserved?: ReadonlySet<string>
): string | undefined {
    const kebab = toKebabFlag(wireName);
    return flagNameIsReserved(kebab, additionalReserved) ? undefined : kebab;
}

/**
 * Choose the source string a parameter's flag is derived from.
 *
 * Flags normally come from the wire name, which is correct for the overwhelming majority of
 * parameters — including auto-renamed headers like `X-Custom-Header` → `--x-custom-header`. But the
 * dynamic IR can't distinguish an explicit `x-fern-parameter-name` rename from the importer's
 * automatic casing. We recover the common, high-value case heuristically: if the wire name contains a
 * character that sanitizing would drop (anything outside `[A-Za-z0-9_-]`), the wire name cannot be the
 * runtime's flag source — the runtime must have an explicit rename — so use the SDK `originalName`
 * instead. This fixes e.g. Twilio's date-range filters (`DateCreated<` → `dateCreatedBefore` →
 * `--date-created-before`, which otherwise sanitize to `--date-created` and collide with `DateCreated`),
 * while leaving every `[A-Za-z0-9_-]`-only name on the wire-name path. A rename whose wire name is
 * itself flag-expressible still can't be recovered without IR support (see README).
 */
export function flagSourceName(wireValue: string, sdkName: string): string {
    return /[^A-Za-z0-9_-]/.test(wireValue) ? sdkName : wireValue;
}

/**
 * Normalize a binary name the way the CLI generator's `deriveBinaryName` does
 * (generators/cli/src/identity.ts `toKebabCase`): lowercase first, then collapse non-alphanumeric
 * runs to single dashes and trim. This differs from `camelToKebab` — e.g. `MyCLI` → `mycli` (the
 * actual executable), not `my-c-l-i` — so the snippet invokes the binary that was really generated.
 */
export function kebabCaseBinaryName(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

function isAsciiAlphanumeric(ch: string): boolean {
    return /^[A-Za-z0-9]$/.test(ch);
}

function isAsciiUppercase(ch: string): boolean {
    return ch >= "A" && ch <= "Z";
}
