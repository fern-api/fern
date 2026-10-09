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
 * The Rust `flag_name_is_reserved` also consults two config-dependent reservations (a renamed
 * user-agent suffix flag and a `--profile` flag). Neither is configured in the default snippet
 * generation path — the suffix flag defaults to `user-agent-suffix`, which is already in
 * BUILTIN_FLAG_NAMES — so the built-in set is the single source of truth here.
 */
export function flagNameIsReserved(flag: string): boolean {
    return BUILTIN_FLAG_NAME_SET.has(flag);
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

/**
 * Tokenize a string the way Fern's OpenAPI importer does. Port of `tokenize` (parser.rs:1905):
 * camelCase-only strings split on each capital letter; everything else splits on non-alphanumeric
 * runs. All tokens lowercased, empties dropped.
 */
export function tokenize(s: string): string[] {
    const chars = [...s];
    const isCamelCase =
        chars.length > 0 &&
        isAsciiLowercase(chars[0] as string) &&
        chars.every((c) => isAsciiAlphanumeric(c)) &&
        chars.some((c) => isAsciiUppercase(c));

    let raw: string[];
    if (isCamelCase) {
        raw = [];
        let current = "";
        for (const c of chars) {
            if (isAsciiUppercase(c) && current.length > 0) {
                raw.push(current);
                current = "";
            }
            current += c;
        }
        if (current.length > 0) {
            raw.push(current);
        }
    } else {
        raw = s.split(/[^A-Za-z0-9]/);
    }

    return raw.filter((t) => t.length > 0).map((t) => t.toLowerCase());
}

/**
 * When an operation's group is derived from a tag (no `x-fern-sdk-group-name`), strip tag tokens
 * that prefix the operationId. Port of `strip_tag_prefix` (parser.rs:1984). `tag="Customers",
 * operationId="customersList"` → `list`. No-op when the operationId doesn't start with the tag.
 */
export function stripTagPrefix(operationId: string, tag: string): string {
    const tagTokens = tokenize(tag);
    const opTokens = tokenize(operationId);
    if (tagTokens.length === 0 || opTokens.length <= tagTokens.length) {
        return operationId;
    }
    for (let i = 0; i < tagTokens.length; i++) {
        if (opTokens[i] !== tagTokens[i]) {
            return operationId;
        }
    }
    return opTokens.slice(tagTokens.length).join("-");
}

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
export function resolveParamFlagName(param: FlagNameParameter, wireName: string): string | undefined {
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
    if (flagNameIsReserved(flag)) {
        flag = `${flag}-param`;
    }
    return flag;
}

function isAsciiAlphanumeric(ch: string): boolean {
    return /^[A-Za-z0-9]$/.test(ch);
}

function isAsciiUppercase(ch: string): boolean {
    return ch >= "A" && ch <= "Z";
}

function isAsciiLowercase(ch: string): boolean {
    return ch >= "a" && ch <= "z";
}
