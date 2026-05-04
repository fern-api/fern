/**
 * Unit tests for MDX escape functions in shared.ts.
 *
 * These cover the key regressions found during review:
 * 1. escapeMdxText() — angle brackets, curly braces, passthrough
 * 2. escapeTableCell() — backtick-aware escaping (the main regression)
 * 3. Integration-level tests verifying that the heading patterns used by
 *    renderer functions correctly escape template names in their output.
 */

import { describe, expect, it } from "vitest";

import { escapeMdxText, escapeTableCell } from "../renderers/shared.js";

/**
 * Helper that mirrors the heading patterns used across renderers.
 * These replicate the exact template string patterns from the source
 * without importing the full renderer (which requires complex IR objects).
 */
function destructorHeading(className: string): string {
    return `### ~${escapeMdxText(className)}`;
}

function innerClassHeading(name: string): string {
    return `### ${escapeMdxText(name)}`;
}

function enumHeading(name: string): string {
    return `### ${escapeMdxText(name)}`;
}

function titledSectionHeading(title: string, level: number): string {
    const hashes = "#".repeat(level);
    return `${hashes} ${escapeMdxText(title)}`;
}

function methodSectionHeading(label: string): string {
    return `## ${escapeMdxText(label)}`;
}

// ---------------------------------------------------------------------------
// 1. escapeMdxText()
// ---------------------------------------------------------------------------

describe("escapeMdxText", () => {
    it("escapes angle brackets in a template type", () => {
        expect(escapeMdxText("task_dep<T>")).toBe("task_dep&lt;T&gt;");
    });

    it("escapes empty angle brackets", () => {
        expect(escapeMdxText("stream_task<>")).toBe("stream_task&lt;&gt;");
    });

    it("escapes both angle brackets and curly braces", () => {
        expect(escapeMdxText("std::array<T, N>{1, 2, 3}")).toBe("std::array&lt;T, N&gt;&#123;1, 2, 3&#125;");
    });

    it("passes plain text through unchanged", () => {
        expect(escapeMdxText("hello world")).toBe("hello world");
    });

    it("passes text with no special chars unchanged", () => {
        expect(escapeMdxText("cuda::std::span")).toBe("cuda::std::span");
    });

    it("escapes multiple angle bracket pairs", () => {
        expect(escapeMdxText("map<string, vector<int>>")).toBe("map&lt;string, vector&lt;int&gt;&gt;");
    });

    it("escapes standalone curly braces", () => {
        expect(escapeMdxText("{init}")).toBe("&#123;init&#125;");
    });
});

// ---------------------------------------------------------------------------
// 2. escapeTableCell() — backtick-aware behavior
// ---------------------------------------------------------------------------

describe("escapeTableCell", () => {
    describe("outside backticks", () => {
        it("escapes angle brackets in prose", () => {
            expect(escapeTableCell("= ::std::numeric_limits<int>::min()")).toBe(
                "= ::std::numeric_limits&lt;int&gt;::min()"
            );
        });

        it("escapes curly braces in prose", () => {
            expect(escapeTableCell("{init}")).toBe("&#123;init&#125;");
        });

        it("escapes pipe characters", () => {
            expect(escapeTableCell("a|b")).toBe("a\\|b");
        });

        it("replaces newlines with spaces", () => {
            expect(escapeTableCell("a\nb")).toBe("a b");
        });

        it("escapes multiple hazards together", () => {
            expect(escapeTableCell("vector<int> | {value}\nnext")).toBe("vector&lt;int&gt; \\| &#123;value&#125; next");
        });
    });

    describe("inside backticks", () => {
        it("preserves angle brackets inside backticks", () => {
            expect(escapeTableCell("`vector<int>`")).toBe("`vector<int>`");
        });

        it("preserves curly braces inside backticks", () => {
            expect(escapeTableCell("`{init}`")).toBe("`{init}`");
        });

        it("escapes pipes inside backticks", () => {
            expect(escapeTableCell("`a|b`")).toBe("`a\\|b`");
        });

        it("replaces newlines inside backticks with spaces", () => {
            expect(escapeTableCell("`a\nb`")).toBe("`a b`");
        });

        it("preserves angle brackets in double backticks", () => {
            expect(escapeTableCell("``vector<int>``")).toBe("``vector<int>``");
        });
    });

    describe("mixed content", () => {
        it("preserves backtick content while escaping prose", () => {
            expect(escapeTableCell("`vector<int>` | description<T>")).toBe("`vector<int>` \\| description&lt;T&gt;");
        });

        it("handles multiple backtick spans interleaved with prose", () => {
            expect(escapeTableCell("see `array<int>` and `map<K,V>` for <details>")).toBe(
                "see `array<int>` and `map<K,V>` for &lt;details&gt;"
            );
        });

        it("handles backtick span at start with prose after", () => {
            expect(escapeTableCell("`code<T>` description<U>")).toBe("`code<T>` description&lt;U&gt;");
        });

        it("handles prose before backtick span", () => {
            expect(escapeTableCell("type<T> `code<U>`")).toBe("type&lt;T&gt; `code<U>`");
        });

        it("handles curly braces mixed with backticks", () => {
            expect(escapeTableCell("`{init}` then {value}")).toBe("`{init}` then &#123;value&#125;");
        });
    });

    describe("safe HTML tag preservation", () => {
        it("preserves <sub> tags", () => {
            expect(escapeTableCell("<sub>text</sub>")).toBe("<sub>text</sub>");
        });

        it("preserves <sup> tags", () => {
            expect(escapeTableCell("<sup>2</sup>")).toBe("<sup>2</sup>");
        });

        it("preserves safe tags mixed with prose", () => {
            expect(escapeTableCell("O(n<sup>2</sup>)")).toBe("O(n<sup>2</sup>)");
        });

        it("preserves safe tags with pipe escaping", () => {
            expect(escapeTableCell("<sub>x</sub> | <sup>y</sup>")).toBe("<sub>x</sub> \\| <sup>y</sup>");
        });

        it("preserves safe tags alongside backtick spans", () => {
            expect(escapeTableCell("`code` <sub>note</sub>")).toBe("`code` <sub>note</sub>");
        });

        it("escapes non-safe HTML tags", () => {
            expect(escapeTableCell("<div>bad</div>")).toBe("&lt;div&gt;bad&lt;/div&gt;");
        });

        it("escapes C++ template angle brackets (regression check)", () => {
            expect(escapeTableCell("<T>value</T>")).toBe("&lt;T&gt;value&lt;/T&gt;");
        });
    });

    describe("edge cases", () => {
        it("handles empty string", () => {
            expect(escapeTableCell("")).toBe("");
        });

        it("handles plain text without special chars", () => {
            expect(escapeTableCell("hello world")).toBe("hello world");
        });

        it("handles backtick-wrapped content only", () => {
            expect(escapeTableCell("`only code`")).toBe("`only code`");
        });
    });
});

// ---------------------------------------------------------------------------
// 3. Integration-level heading pattern tests
// ---------------------------------------------------------------------------

describe("heading escaping patterns", () => {
    describe("destructor heading (### ~ClassName)", () => {
        it("escapes template class name in destructor heading", () => {
            expect(destructorHeading("optional<T>")).toBe("### ~optional&lt;T&gt;");
        });

        it("passes non-template class name through unchanged", () => {
            expect(destructorHeading("thread_pool")).toBe("### ~thread_pool");
        });

        it("escapes nested template in destructor heading", () => {
            expect(destructorHeading("unordered_map<K, vector<V>>")).toBe(
                "### ~unordered_map&lt;K, vector&lt;V&gt;&gt;"
            );
        });
    });

    describe("inner class heading (### ClassName)", () => {
        it("escapes template inner class name", () => {
            expect(innerClassHeading("iterator<T>")).toBe("### iterator&lt;T&gt;");
        });

        it("passes non-template inner class name through unchanged", () => {
            expect(innerClassHeading("iterator")).toBe("### iterator");
        });
    });

    describe("enum heading (### EnumName)", () => {
        it("passes plain enum name through unchanged", () => {
            expect(enumHeading("Color")).toBe("### Color");
        });

        it("escapes angle brackets if present in enum name", () => {
            // Unlikely for enums, but verifies the pattern works
            expect(enumHeading("Flag<T>")).toBe("### Flag&lt;T&gt;");
        });
    });

    describe("titled section heading", () => {
        it("escapes angle brackets in titled section at H2 level", () => {
            expect(titledSectionHeading("Usage with vector<int>", 2)).toBe("## Usage with vector&lt;int&gt;");
        });

        it("escapes angle brackets in titled section at H3 level", () => {
            expect(titledSectionHeading("Details for array<T, N>", 3)).toBe("### Details for array&lt;T, N&gt;");
        });

        it("passes plain titled section through unchanged", () => {
            expect(titledSectionHeading("Overview", 2)).toBe("## Overview");
        });

        it("escapes curly braces in titled section", () => {
            expect(titledSectionHeading("Initializer {list}", 3)).toBe("### Initializer &#123;list&#125;");
        });
    });

    describe("method section heading (## Label)", () => {
        it("escapes template name in method section label", () => {
            expect(methodSectionHeading("Constructors<T>")).toBe("## Constructors&lt;T&gt;");
        });

        it("passes plain section label through unchanged", () => {
            expect(methodSectionHeading("Static Methods")).toBe("## Static Methods");
        });
    });
});
