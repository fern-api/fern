/**
 * Maps individual special characters to their word equivalents.
 * Only includes characters that lodash camelCase() cannot handle
 * as word separators (i.e., characters that get silently dropped
 * and produce empty/invalid names).
 *
 * Characters like `:`, `.`, `/`, `-`, ` ` are already handled as
 * word separators by camelCase and should NOT be mapped here.
 */
const SPECIAL_CHAR_TO_WORD: Record<string, string> = {
    "%": "percent",
    "#": "hash",
    "@": "at",
    "&": "and",
    "+": "plus",
    $: "dollar",
    "!": "exclamation",
    "~": "tilde",
    "^": "caret",
    "=": "equals",
    "*": "asterisk",
    "<": "less_than",
    ">": "greater_than",
    "|": "pipe",
    "?": "question",
    "\\": "backslash",
    "`": "backtick",
    "(": "open_paren",
    ")": "close_paren",
    "[": "open_bracket",
    "]": "close_bracket",
    "{": "open_brace",
    "}": "close_brace"
};

/**
 * Replaces special characters in a name with their word equivalents,
 * separated by underscores. Only characters that would be silently
 * dropped by camelCase (producing empty or invalid results) are replaced.
 *
 * Characters that camelCase already handles as word separators
 * (like `:`, `.`, `/`, `-`, ` `, `;`, `,`, `'`, `"`) are left as-is
 * for the casing function to handle naturally.
 *
 * This is designed to be backwards compatible: names that are already
 * valid (only contain [a-zA-Z0-9_]) pass through unchanged.
 *
 * Examples:
 *   "%" -> "percent"
 *   "%option" -> "percent_option"
 *   "option%" -> "option_percent"
 *   "foo%bar" -> "foo_percent_bar"
 *   "valid_name" -> "valid_name" (unchanged)
 *   "foo:bar" -> "foo:bar" (colon preserved for camelCase)
 *   "foo.bar" -> "foo.bar" (dot preserved for camelCase)
 */
export function replaceSpecialCharsWithWords(name: string): string {
    const VALID_CHAR_REGEX = /[a-zA-Z0-9_]/;
    let result = "";
    let didReplace = false;

    for (let i = 0; i < name.length; i++) {
        const char = name[i];
        if (char == null) {
            continue;
        }

        if (VALID_CHAR_REGEX.test(char)) {
            result += char;
            continue;
        }

        const word = SPECIAL_CHAR_TO_WORD[char];
        if (word != null) {
            didReplace = true;
            // Add underscore separator before the word if needed
            if (result.length > 0 && !result.endsWith("_") && !result.endsWith("-") && !result.endsWith(" ")) {
                result += "_";
            }
            result += word;
            // Add underscore separator after the word if there are more chars
            if (i < name.length - 1) {
                const nextChar = name[i + 1];
                if (nextChar != null && nextChar !== "_" && nextChar !== "-" && nextChar !== " ") {
                    result += "_";
                }
            }
        } else {
            // Characters not in the map (like `:`, `.`, `/`, `-`, ` `, etc.)
            // are passed through for camelCase to handle as word separators
            result += char;
        }
    }

    // Only clean up underscores if we actually performed replacements,
    // to avoid altering names that are already valid (e.g. "__dunder__").
    if (didReplace) {
        // Preserve leading and trailing underscore runs while collapsing
        // interior consecutive underscores (e.g. "__init%__" → "__init_percent__")
        const leadingMatch = result.match(/^(_*)/);
        const trailingMatch = result.match(/(_*)$/);
        const leading = leadingMatch?.[1] ?? "";
        const trailing = trailingMatch?.[1] ?? "";
        const core = result.slice(leading.length, result.length - (trailing.length || 0) || undefined);
        return leading + core.replace(/_+/g, "_") + trailing;
    }
    return result;
}

/**
 * Returns true if the name contains any special characters that
 * need to be converted to words (i.e., characters in SPECIAL_CHAR_TO_WORD).
 */
export function hasConvertibleSpecialChars(name: string): boolean {
    for (const char of name) {
        if (SPECIAL_CHAR_TO_WORD[char] != null) {
            return true;
        }
    }
    return false;
}
