import { describe, it, expect } from "vitest";
import {
    escapeMdx,
    escapeMdxPreservingCodeBlocks,
    generateAnchorId,
    formatTypeAnnotation,
    createFrontmatter,
    escapeTableCell,
} from "../utils/mdx";

describe("escapeMdx", () => {
    it("returns plain text unchanged", () => {
        expect(escapeMdx("hello world")).toBe("hello world");
    });

    it("escapes angle brackets", () => {
        expect(escapeMdx("<div>")).toBe("&lt;div&gt;");
    });

    it("escapes curly braces", () => {
        expect(escapeMdx("{value}")).toBe("&#123;value&#125;");
    });

    it("escapes triple backticks", () => {
        expect(escapeMdx("```code```")).toBe("\\`\\`\\`code\\`\\`\\`");
    });

    it("escapes all special chars together", () => {
        expect(escapeMdx("<T>{x}```")).toBe("&lt;T&gt;&#123;x&#125;\\`\\`\\`");
    });

    it("handles empty string", () => {
        expect(escapeMdx("")).toBe("");
    });

    it.each([
        { input: "List[int]", expected: "List[int]" },
        { input: "Dict[str, Any]", expected: "Dict[str, Any]" },
        { input: "Optional<string>", expected: "Optional&lt;string&gt;" },
        { input: "std::vector<int>", expected: "std::vector&lt;int&gt;" },
    ])("escapes type annotation: $input", ({ input, expected }) => {
        expect(escapeMdx(input)).toBe(expected);
    });
});

describe("escapeMdxPreservingCodeBlocks", () => {
    it("escapes JSX chars in plain text", () => {
        expect(escapeMdxPreservingCodeBlocks("Use <T> for generics")).toBe("Use &lt;T&gt; for generics");
    });

    it("preserves code block content unescaped", () => {
        const input = "Before\n```python\nx = <T>\n```\nAfter";
        const result = escapeMdxPreservingCodeBlocks(input);
        expect(result).toContain("```python\nx = <T>\n```");
    });

    it("escapes text outside code blocks but not inside", () => {
        const input = "Type <T> here\n```python\nfoo = {bar}\n```\nMore <stuff>";
        const result = escapeMdxPreservingCodeBlocks(input);
        expect(result).toContain("Type &lt;T&gt; here");
        expect(result).toContain("More &lt;stuff&gt;");
        expect(result).toContain("foo = {bar}");
    });

    it("preserves code block language tag as-is", () => {
        const input = "```javascript\nconsole.log('hi')\n```";
        const result = escapeMdxPreservingCodeBlocks(input);
        expect(result).toContain("```javascript\n");
    });

    it("handles unclosed code blocks", () => {
        const input = "```python\nx = 1";
        const result = escapeMdxPreservingCodeBlocks(input);
        expect(result).toContain("```python\nx = 1");
    });

    it("handles text with no code blocks", () => {
        expect(escapeMdxPreservingCodeBlocks("plain <text>")).toBe("plain &lt;text&gt;");
    });

    it("handles empty string", () => {
        expect(escapeMdxPreservingCodeBlocks("")).toBe("");
    });
});

describe("generateAnchorId", () => {
    it.each([
        { input: "requests.models.Response", expected: "requests-models-Response" },
        { input: "mypackage", expected: "mypackage" },
        { input: "a.b.c.d", expected: "a-b-c-d" },
        { input: "", expected: "" },
    ])("converts $input to $expected", ({ input, expected }) => {
        expect(generateAnchorId(input)).toBe(expected);
    });
});

describe("formatTypeAnnotation", () => {
    it("escapes type string", () => {
        expect(formatTypeAnnotation("Optional<string>")).toBe("Optional&lt;string&gt;");
    });

    it("returns empty string for null", () => {
        expect(formatTypeAnnotation(null)).toBe("");
    });

    it("returns empty string for undefined", () => {
        expect(formatTypeAnnotation(undefined)).toBe("");
    });

    it("returns empty string for empty string", () => {
        expect(formatTypeAnnotation("")).toBe("");
    });

    it("passes through simple types unchanged", () => {
        expect(formatTypeAnnotation("int")).toBe("int");
    });
});

describe("createFrontmatter", () => {
    it("creates frontmatter with slug only", () => {
        const result = createFrontmatter("api-reference");
        expect(result).toBe("---\nlayout: overview\nslug: api-reference\n---");
    });

    it("creates frontmatter with slug and title", () => {
        const result = createFrontmatter("api-reference", "API Reference");
        expect(result).toBe("---\nlayout: overview\nslug: api-reference\ntitle: API Reference\n---");
    });
});

describe("escapeTableCell", () => {
    it("escapes pipe characters", () => {
        expect(escapeTableCell("a | b | c")).toBe("a \\| b \\| c");
    });

    it("replaces newlines with spaces", () => {
        expect(escapeTableCell("line1\nline2")).toBe("line1 line2");
    });

    it("handles both pipes and newlines", () => {
        expect(escapeTableCell("a | b\nc | d")).toBe("a \\| b c \\| d");
    });

    it("returns plain text unchanged", () => {
        expect(escapeTableCell("hello")).toBe("hello");
    });

    it("handles empty string", () => {
        expect(escapeTableCell("")).toBe("");
    });
});
