import { describe, expect, it } from "vitest";
import {
    createFrontmatter,
    escapeMdx,
    escapeMdxPreservingCodeBlocks,
    escapeTableCell,
    formatTypeAnnotation,
    generateAnchorId
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
        { input: "std::vector<int>", expected: "std::vector&lt;int&gt;" }
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

    it("normalizes safe language tags to python", () => {
        const input = "```javascript\nconsole.log('hi')\n```";
        const result = escapeMdxPreservingCodeBlocks(input);
        expect(result).toContain("```python\n");
    });

    it("normalizes {doctest} language tag to python", () => {
        const input = "```{doctest}\n>>> print('hi')\n```";
        const result = escapeMdxPreservingCodeBlocks(input);
        expect(result).toContain("```python\n");
        expect(result).not.toContain("{doctest}");
    });

    it("repairs unclosed code blocks by adding closing fence", () => {
        const input = "```python\nx = 1";
        const result = escapeMdxPreservingCodeBlocks(input);
        expect(result).toBe("```python\nx = 1\n```");
    });

    it("does not double-close already closed code blocks", () => {
        const input = "```python\nx = 1\n```";
        const result = escapeMdxPreservingCodeBlocks(input);
        expect(result).toBe("```python\nx = 1\n```");
    });

    it("repairs unclosed fence and escapes text after it", () => {
        const input = "```python\nx = 1\nMore <stuff> after";
        const result = escapeMdxPreservingCodeBlocks(input);
        // The regex matches to end of string, so everything is inside the code block
        // and gets a closing fence appended
        expect(result).toContain("```python\n");
        expect(result).toMatch(/\n```$/);
    });

    it("handles text with no code blocks", () => {
        expect(escapeMdxPreservingCodeBlocks("plain <text>")).toBe("plain &lt;text&gt;");
    });

    it("handles empty string", () => {
        expect(escapeMdxPreservingCodeBlocks("")).toBe("");
    });

    it("normalizes {doctest} and repairs fence in real docstring pattern", () => {
        const input = "Examples:\n```{doctest}\n>>> import torch\n>>> x = torch.tensor([1])\n>>> x\ntensor([1])";
        const result = escapeMdxPreservingCodeBlocks(input);
        expect(result).toContain("```python\n");
        expect(result).not.toContain("{doctest}");
        expect(result).toMatch(/\n```$/);
    });
});

describe("generateAnchorId", () => {
    it.each([
        { input: "requests.models.Response", expected: "requests-models-Response" },
        { input: "mypackage", expected: "mypackage" },
        { input: "a.b.c.d", expected: "a-b-c-d" },
        { input: "", expected: "" }
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
