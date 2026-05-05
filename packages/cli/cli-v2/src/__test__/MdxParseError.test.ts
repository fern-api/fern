import chalk from "chalk";
import { describe, expect, it } from "vitest";

import {
    classifyMdxError,
    E0301_JSX_ATTRIBUTE_NEEDS_BRACES,
    E0302_UNTERMINATED_STRING_LITERAL,
    E0303_MISMATCHED_CLOSING_TAG,
    E0304_UNCLOSED_JSX_ELEMENT,
    E0305_INVALID_JS_EXPRESSION,
    type MdxErrorCode,
    UNKNOWN_MDX_ERROR
} from "../docs/errors/MdxErrorCode.js";
import { MdxParseError, type SourceLine } from "../docs/errors/MdxParseError.js";

const ORIGINAL_CHALK_LEVEL = chalk.level;

describe("classifyMdxError", () => {
    it("classifies JSX-attribute-needs-braces errors as E0301", () => {
        const result = classifyMdxError(
            "Unexpected character `<` in attribute name, expected an attribute name character"
        );
        expect(result.code).toBe("E0301");
    });

    it("classifies mismatched closing tag errors as E0303", () => {
        const result = classifyMdxError(
            "Unexpected closing tag `</Bar>`, expected the corresponding closing tag for `<Foo>`"
        );
        expect(result.code).toBe("E0303");
    });

    it("classifies unterminated string literal errors as E0302", () => {
        const result = classifyMdxError("Unexpected end of file in attribute value");
        expect(result.code).toBe("E0302");
        expect(result).toBe(E0302_UNTERMINATED_STRING_LITERAL);
    });

    it("classifies unclosed JSX element errors as E0304", () => {
        const result = classifyMdxError("Unexpected end of file in tag");
        expect(result.code).toBe("E0304");
        expect(result).toBe(E0304_UNCLOSED_JSX_ELEMENT);
    });

    it("classifies bad JS expressions as E0305", () => {
        const result = classifyMdxError("Could not parse expression with acorn");
        expect(result.code).toBe("E0305");
    });

    it("falls back to E0300 for unknown messages", () => {
        const result = classifyMdxError("totally novel error nobody has seen before");
        expect(result.code).toBe(UNKNOWN_MDX_ERROR.code);
        expect(result.code).toBe("E0300");
    });
});

describe("E0301 fix suggestion", () => {
    it("suggests wrapping JSX attribute values in braces", () => {
        const fix = E0301_JSX_ATTRIBUTE_NEEDS_BRACES.suggestFix?.({
            errorLineContent: '  icon=<Icon name="star" />',
            rawMessage: "Unexpected character `<` in attribute"
        });
        expect(fix).toEqual({
            before: 'icon=<Icon name="star" />',
            after: 'icon={<Icon name="star" />}'
        });
    });

    it("returns undefined when the offending pattern is not present", () => {
        const fix = E0301_JSX_ATTRIBUTE_NEEDS_BRACES.suggestFix?.({
            errorLineContent: "just normal markdown text",
            rawMessage: ""
        });
        expect(fix).toBeUndefined();
    });
});

describe("MdxParseError.toString()", () => {
    function buildError(): MdxParseError {
        const sourceLines: SourceLine[] = [
            { lineNumber: 12, content: "<MyComponent", isErrorLine: false },
            { lineNumber: 13, content: '  label="hello"', isErrorLine: false },
            { lineNumber: 14, content: '  icon=<Icon name="star" />', isErrorLine: true }
        ];

        return new MdxParseError({
            code: E0301_JSX_ATTRIBUTE_NEEDS_BRACES,
            displayRelativeFilepath: "docs/pages/welcome.mdx",
            line: 14,
            column: 9,
            rawMessage: "Unexpected character `<` in attribute name",
            sourceLines,
            fix: { before: 'icon=<Icon name="star" />', after: 'icon={<Icon name="star" />}' }
        });
    }

    function stripAnsi(text: string): string {
        // biome-ignore lint/suspicious/noControlCharactersInRegex: matching ANSI escape sequences requires the ESC control character.
        return text.replace(/\u001b\[[0-9;]*m/g, "");
    }

    it("renders header, location, source snippet, caret, and fix", () => {
        // Disable colors so we can do plain-string assertions.
        chalk.level = 0;
        try {
            const out = stripAnsi(buildError().toString());

            expect(out).toContain("error[E0301]: JSX element is not valid as an attribute value");
            expect(out).toContain("--> docs/pages/welcome.mdx:14:9");
            expect(out).toContain("12 | <MyComponent");
            expect(out).toContain('14 |   icon=<Icon name="star" />');
            // Caret line is indented and contains a `^`.
            expect(out).toMatch(/^\s+\|\s+\^/m);
            expect(out).toContain('fix: icon=<Icon name="star" /> → icon={<Icon name="star" />}');
            // E0301-E0305 currently have no learnUrl set — the `see:` line is
            // intentionally omitted until the per-code docs pages exist.
            expect(out).not.toContain("see:");
        } finally {
            chalk.level = ORIGINAL_CHALK_LEVEL;
        }
    });

    it("omits the fix line when no fix is provided", () => {
        chalk.level = 0;
        try {
            const err = new MdxParseError({
                code: E0303_MISMATCHED_CLOSING_TAG,
                displayRelativeFilepath: "docs/pages/api.mdx",
                line: 5,
                column: 1,
                rawMessage: "Unexpected closing tag",
                sourceLines: [{ lineNumber: 5, content: "</Foo>", isErrorLine: true }],
                fix: undefined
            });
            const out = stripAnsi(err.toString());
            expect(out).not.toContain("fix:");
            // No learnUrl on E0303 — `see:` should also be absent.
            expect(out).not.toContain("see:");
        } finally {
            chalk.level = ORIGINAL_CHALK_LEVEL;
        }
    });

    it("renders without a caret when column is unknown", () => {
        chalk.level = 0;
        try {
            const err = new MdxParseError({
                code: E0305_INVALID_JS_EXPRESSION,
                displayRelativeFilepath: "docs/pages/expr.mdx",
                line: 3,
                column: undefined,
                rawMessage: "Could not parse expression with acorn",
                sourceLines: [{ lineNumber: 3, content: "{ foo: ", isErrorLine: true }],
                fix: undefined
            });
            const out = stripAnsi(err.toString());
            expect(out).toContain("--> docs/pages/expr.mdx:3");
            expect(out).not.toMatch(/^\s+\|\s+\^/m);
        } finally {
            chalk.level = ORIGINAL_CHALK_LEVEL;
        }
    });

    it("expands tabs in source content for caret alignment", () => {
        chalk.level = 0;
        try {
            const err = new MdxParseError({
                code: E0301_JSX_ATTRIBUTE_NEEDS_BRACES,
                displayRelativeFilepath: "docs/pages/tabs.mdx",
                line: 1,
                column: 5,
                rawMessage: "Unexpected character `<` in attribute",
                sourceLines: [{ lineNumber: 1, content: "\ticon=<X/>", isErrorLine: true }],
                fix: undefined
            });
            const out = stripAnsi(err.toString());
            // The tab should have been visually expanded to 4 spaces.
            expect(out).toContain("    icon=<X/>");
        } finally {
            chalk.level = ORIGINAL_CHALK_LEVEL;
        }
    });

    it("renders note: line when code has a description", () => {
        chalk.level = 0;
        try {
            const out = stripAnsi(buildError().toString());
            // E0301 has a description — it should appear as a "note:" line.
            expect(out).toContain("note:");
            expect(out).toContain(E0301_JSX_ATTRIBUTE_NEEDS_BRACES.description ?? "");
        } finally {
            chalk.level = ORIGINAL_CHALK_LEVEL;
        }
    });

    it("omits note: line when code has no description", () => {
        chalk.level = 0;
        try {
            const codeWithoutDescription: MdxErrorCode = {
                code: "E0300",
                title: "Could not parse markdown",
                matches: () => true
                // learnUrl and description intentionally omitted
            };
            const err = new MdxParseError({
                code: codeWithoutDescription,
                displayRelativeFilepath: "docs/pages/unknown.mdx",
                line: 1,
                column: undefined,
                rawMessage: "some unknown error",
                sourceLines: [],
                fix: undefined
            });
            const out = stripAnsi(err.toString());
            expect(out).not.toContain("note:");
            expect(out).not.toContain("see:");
        } finally {
            chalk.level = ORIGINAL_CHALK_LEVEL;
        }
    });
});
