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

    /**
     * Optional public URL with extended documentation on this error.
     * Omit when the docs page does not yet exist — no link is better than a 404.
     */
    readonly learnUrl?: string;

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

// Doc URLs are intentionally omitted while the per-code reference pages on
// `buildwithfern.com/learn/docs/errors/*` do not yet exist — shipping a `see:`
// link to a 404 is worse than no link at all. Add a `learnUrl` per code as the
// docs go live.

/**
 * `<MyComponent prop=<Icon /> />` — a JSX element used as a bare attribute
 * value. Must be wrapped in `{ ... }`.
 */
export const E0301_JSX_ATTRIBUTE_NEEDS_BRACES: MdxErrorCode = {
    code: "E0301",
    title: "JSX element is not valid as an attribute value",
    description: "Wrap the value in curly braces (`{}`) so it is parsed as a JSX expression.",
    matches: (raw) =>
        // Common micromark-mdx hint when a JSX element is used as a bare
        // attribute value: "to use an element or fragment as a prop value in
        // MDX, use `{<element />}`"
        /element or fragment as a prop value/i.test(raw) ||
        // Generic shapes for the same problem.
        (/unexpected character.*(?:in (?:attribute|jsx)|before attribute value)/i.test(raw) && /</.test(raw)),
    suggestFix({ errorLineContent }) {
        // Match `name=<Component ... />` (self-closing) and wrap the value in {}.
        // Note: the pattern stops at the first `>`, so it will not produce a
        // suggestion for JSX attribute values that contain nested `>` characters
        // (e.g. `icon=<Icon onClick={() => {}} />`). Those cases return undefined
        // and the fix line is simply omitted.
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
    matches: (raw) =>
        /unexpected (?:end of file|line ending).*(?:attribute value|string)/i.test(raw) ||
        /missing closing.*quote/i.test(raw),
    suggestFix({ errorLineContent }) {
        // Match an attribute with an opening quote but no closing quote on the same line.
        // e.g. `prop="value` → `prop="value"`
        const match = errorLineContent.match(/([A-Za-z_$][\w$-]*)=(["'])([^"']*?)$/);
        if (match == null) {
            return undefined;
        }
        const [whole, , quote, value] = match;
        if (quote == null || value == null) {
            return undefined;
        }
        return {
            before: whole,
            after: `${whole}${quote}`
        };
    }
};

/**
 * `<Foo></Bar>` — closing tag does not match the opening tag.
 */
export const E0303_MISMATCHED_CLOSING_TAG: MdxErrorCode = {
    code: "E0303",
    title: "Mismatched JSX closing tag",
    description: "Make sure every JSX element is closed with a matching tag (or is self-closing).",
    matches: (raw) => /(?:unexpected closing tag|expected (?:a corresponding|the closing tag))/i.test(raw),
    suggestFix({ errorLineContent, rawMessage }) {
        // Try to extract the expected and actual tag names from the raw message.
        // Common patterns: "expected closing tag </Foo>, not </Bar>"
        //                  "Unexpected closing tag `</Bar>`, expected `</Foo>`"
        const expectedMatch = rawMessage.match(/expected.*<\/([A-Za-z][\w.]*)\s*>/i);
        const actualMatch = errorLineContent.match(/<\/([A-Za-z][\w.]*)\s*>/);
        if (expectedMatch?.[1] != null && actualMatch?.[1] != null && expectedMatch[1] !== actualMatch[1]) {
            return {
                before: `</${actualMatch[1]}>`,
                after: `</${expectedMatch[1]}>`
            };
        }
        return undefined;
    }
};

/**
 * `<Foo` with no closing `>` (or `/>`). Often appears at end of file.
 */
export const E0304_UNCLOSED_JSX_ELEMENT: MdxErrorCode = {
    code: "E0304",
    title: "Unclosed JSX element",
    description: "Add a closing tag (`</Foo>`) or make the element self-closing (`<Foo />`).",
    matches: (raw) => /unexpected end of file.*(?:tag|element)/i.test(raw),
    suggestFix({ errorLineContent }) {
        // Match an unclosed tag like `<Foo` or `<Foo attr="val"` and close it.
        const match = errorLineContent.match(/<([A-Za-z][\w.]*)(\s[^>]*)?$/);
        if (match?.[1] == null) {
            return undefined;
        }
        const tagName = match[1];
        const attrs = match[2] ?? "";
        return {
            before: `<${tagName}${attrs}`,
            after: `<${tagName}${attrs} />`
        };
    }
};

/**
 * `{ foo: bar` — JS expression in MDX failed to parse with acorn.
 */
export const E0305_INVALID_JS_EXPRESSION: MdxErrorCode = {
    code: "E0305",
    title: "Invalid JavaScript expression in MDX",
    description: "Could not parse a `{ ... }` expression. Check for missing braces, commas, or quotes.",
    matches: (raw) => /could not parse expression with acorn|unexpected (?:token|character).*expression/i.test(raw),
    suggestFix({ errorLineContent }) {
        // Common case: a standalone `{` or `}` that should be escaped as `\{` or `\}`.
        // In MDX, literal braces must be escaped. Match a line that has an unmatched
        // brace — simple heuristic: count open vs close braces.
        const opens = (errorLineContent.match(/\{/g) ?? []).length;
        const closes = (errorLineContent.match(/\}/g) ?? []).length;
        if (opens === 1 && closes === 0) {
            return { before: "{", after: "\\{" };
        }
        if (closes === 1 && opens === 0) {
            return { before: "}", after: "\\}" };
        }
        return undefined;
    }
};

/**
 * Catch-all when we can't classify the parser error.
 */
export const UNKNOWN_MDX_ERROR: MdxErrorCode = {
    code: "E0300",
    title: "Could not parse markdown",
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
