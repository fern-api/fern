/**
 * A single, well-known MDX/Markdown error class.
 *
 * Each entry maps a (loose) regex against the upstream parser's `error.message`
 * to a stable, human-friendly title + a doc URL on `buildwithfern.com`. When
 * possible, the entry can also produce a textual fix suggestion based on the
 * offending source line, which is rendered as `fix: <before> → <after>`.
 *
 * The list is intentionally small to start — codes are stable contracts and
 * we'd rather under-classify than misclassify. Anything we don't recognise
 * falls through to {@link UNKNOWN_MDX_ERROR}.
 */
export interface MdxErrorCode {
    /** Stable error code shown to the user, e.g. `E0301`. */
    readonly code: string;

    /** Short, human-readable title shown after the code in the header. */
    readonly title: string;

    /** Optional longer description appended below the source snippet. */
    readonly description?: string;

    /** Public URL with extended documentation on this error. */
    readonly learnUrl: string;

    /**
     * Returns true if this code matches the upstream parser's raw error message.
     */
    matches(rawMessage: string): boolean;

    /**
     * Optionally produce a (before → after) suggestion for the offending line.
     * Returning `undefined` simply omits the `fix:` line.
     */
    suggestFix?(args: { errorLineContent: string; rawMessage: string }): MdxFix | undefined;
}

export interface MdxFix {
    /** The fragment of the source line we suggest replacing. */
    before: string;
    /** The replacement fragment. */
    after: string;
}

const DOCS_BASE_URL = "https://buildwithfern.com/learn/docs/errors";

/**
 * `<MyComponent prop=<Icon /> />` — a JSX element used as a bare attribute
 * value. Must be wrapped in `{ ... }`.
 */
export const E0301_JSX_ATTRIBUTE_NEEDS_BRACES: MdxErrorCode = {
    code: "E0301",
    title: "JSX element is not valid as an attribute value",
    description: "Wrap the value in curly braces (`{}`) so it is parsed as a JSX expression.",
    learnUrl: `${DOCS_BASE_URL}/E0301`,
    matches: (raw) =>
        // Common micromark-mdx hint when a JSX element is used as a bare
        // attribute value: "to use an element or fragment as a prop value in
        // MDX, use `{<element />}`"
        /element or fragment as a prop value/i.test(raw) ||
        // Generic shapes for the same problem.
        (/unexpected character.*(?:in (?:attribute|jsx)|before attribute value)/i.test(raw) && /</.test(raw)),
    suggestFix({ errorLineContent }) {
        // Match `name=<Component ... />` (self-closing or block) and wrap it in {}.
        const match = errorLineContent.match(/([A-Za-z_$][\w$-]*)=(<[^>]+\/?>)/);
        if (match == null) {
            return undefined;
        }
        const [whole, attrName, jsxValue] = match;
        if (attrName == null || jsxValue == null) {
            return undefined;
        }
        return {
            before: whole,
            after: `${attrName}={${jsxValue}}`
        };
    }
};

/**
 * `<MyComponent prop="value` — string literal opened but never closed.
 */
export const E0302_UNTERMINATED_STRING_LITERAL: MdxErrorCode = {
    code: "E0302",
    title: "Unterminated string literal in JSX attribute",
    description: "Make sure every quoted attribute value has a matching closing quote.",
    learnUrl: `${DOCS_BASE_URL}/E0302`,
    matches: (raw) =>
        /unexpected (?:end of file|line ending).*(?:attribute value|string)/i.test(raw) ||
        /missing closing.*quote/i.test(raw)
};

/**
 * `<Foo></Bar>` — closing tag does not match the opening tag.
 */
export const E0303_MISMATCHED_CLOSING_TAG: MdxErrorCode = {
    code: "E0303",
    title: "Mismatched JSX closing tag",
    description: "Make sure every JSX element is closed with a matching tag (or is self-closing).",
    learnUrl: `${DOCS_BASE_URL}/E0303`,
    matches: (raw) => /(?:unexpected closing tag|expected (?:a corresponding|the closing tag))/i.test(raw)
};

/**
 * `<Foo` with no closing `>` (or `/>`). Often appears at end of file.
 */
export const E0304_UNCLOSED_JSX_ELEMENT: MdxErrorCode = {
    code: "E0304",
    title: "Unclosed JSX element",
    description: "Add a closing tag (`</Foo>`) or make the element self-closing (`<Foo />`).",
    learnUrl: `${DOCS_BASE_URL}/E0304`,
    matches: (raw) => /unexpected end of file.*(?:tag|element)/i.test(raw)
};

/**
 * `{ foo: bar` — JS expression in MDX failed to parse with acorn.
 */
export const E0305_INVALID_JS_EXPRESSION: MdxErrorCode = {
    code: "E0305",
    title: "Invalid JavaScript expression in MDX",
    description: "Could not parse a `{ ... }` expression. Check for missing braces, commas, or quotes.",
    learnUrl: `${DOCS_BASE_URL}/E0305`,
    matches: (raw) => /could not parse expression with acorn|unexpected (?:token|character).*expression/i.test(raw)
};

/**
 * Catch-all when we can't classify the parser error.
 */
export const UNKNOWN_MDX_ERROR: MdxErrorCode = {
    code: "E0300",
    title: "Could not parse markdown",
    learnUrl: `${DOCS_BASE_URL}/E0300`,
    matches: () => true
};

/**
 * Ordered list — first match wins. {@link UNKNOWN_MDX_ERROR} must come last.
 */
export const MDX_ERROR_CODES: readonly MdxErrorCode[] = [
    E0301_JSX_ATTRIBUTE_NEEDS_BRACES,
    E0302_UNTERMINATED_STRING_LITERAL,
    E0303_MISMATCHED_CLOSING_TAG,
    E0304_UNCLOSED_JSX_ELEMENT,
    E0305_INVALID_JS_EXPRESSION,
    UNKNOWN_MDX_ERROR
];

/**
 * Classify a raw parser error message into one of our known codes.
 */
export function classifyMdxError(rawMessage: string): MdxErrorCode {
    for (const candidate of MDX_ERROR_CODES) {
        if (candidate.matches(rawMessage)) {
            return candidate;
        }
    }
    return UNKNOWN_MDX_ERROR;
}
