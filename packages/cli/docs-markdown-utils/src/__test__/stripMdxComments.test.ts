import { describe, expect, it } from "vitest";
import { stripMdxComments } from "../stripMdxComments.js";

describe("stripMdxComments", () => {
    it("strips a single-line comment", () => {
        const input = "Hello\n{/* this is a comment */}\nWorld";
        const expected = "Hello\nWorld";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("strips a multi-line comment", () => {
        const input = "Hello\n{/* this is\na multi-line\ncomment */}\nWorld";
        const expected = "Hello\nWorld";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("strips an inline comment without removing the rest of the line", () => {
        const input = "Hello {/* comment */} World";
        const expected = "Hello  World";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("strips multiple comments", () => {
        const input = "{/* first comment */}\nSome content\n{/* second comment */}\nMore content";
        const expected = "Some content\nMore content";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("does not strip comments inside code fences", () => {
        const input = "Before\n```\n{/* this should stay */}\n```\nAfter";
        expect(stripMdxComments(input)).toBe(input);
    });

    it("does not strip comments inside inline code", () => {
        const input = "Use `{/* comment */}` for MDX comments";
        expect(stripMdxComments(input)).toBe(input);
    });

    it("handles content with no comments", () => {
        const input = "# Hello World\n\nThis is normal markdown.";
        expect(stripMdxComments(input)).toBe(input);
    });

    it("handles empty string", () => {
        expect(stripMdxComments("")).toBe("");
    });

    it("handles comment at the start of content", () => {
        const input = "{/* comment */}\nHello";
        const expected = "Hello";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("handles comment at the end of content", () => {
        const input = "Hello\n{/* comment */}";
        const expected = "Hello\n";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("handles comment with indentation", () => {
        const input = "Hello\n  {/* indented comment */}\nWorld";
        const expected = "Hello\nWorld";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("preserves comments inside code fences with language specifier", () => {
        const input = "Before\n```jsx\n{/* this is a JSX comment */}\nconst x = 1;\n```\nAfter";
        expect(stripMdxComments(input)).toBe(input);
    });

    it("handles adjacent comments", () => {
        const input = "{/* first */}\n{/* second */}\nContent";
        const expected = "Content";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("handles comment with asterisks inside", () => {
        const input = "Hello\n{/* comment with * asterisks * inside */}\nWorld";
        const expected = "Hello\nWorld";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("handles double-backtick inline code followed by a comment", () => {
        const input = "Use `` `backtick` `` syntax {/* comment */} for code";
        const expected = "Use `` `backtick` `` syntax  for code";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("preserves comments inside double-backtick inline code", () => {
        const input = "Use `` {/* not a comment */} `` in your code";
        expect(stripMdxComments(input)).toBe(input);
    });

    it("strips a multi-line comment spanning many lines", () => {
        const input = [
            "Before",
            "{/*",
            "  This is a long",
            "  multi-line comment",
            "  that spans several lines",
            "*/}",
            "After"
        ].join("\n");
        const expected = "Before\nAfter";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("strips a multi-line comment with code-like content inside", () => {
        const input = ["Hello", "{/*", "  const x = 1;", "  console.log(x);", "*/}", "World"].join("\n");
        const expected = "Hello\nWorld";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("strips multiple multi-line comments in the same document", () => {
        const input = [
            "{/*",
            "  First multi-line",
            "  comment",
            "*/}",
            "Content between",
            "{/*",
            "  Second multi-line",
            "  comment",
            "*/}",
            "End"
        ].join("\n");
        const expected = "Content between\nEnd";
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("preserves comments inside triple-backtick code blocks", () => {
        const input = ["Before", "```", "{/* this should stay */}", "const x = 1;", "```", "After"].join("\n");
        expect(stripMdxComments(input)).toBe(input);
    });

    it("preserves comments inside code blocks with language specifier", () => {
        const input = [
            "```tsx",
            "function App() {",
            "  return (",
            "    <div>",
            "      {/* This JSX comment should stay */}",
            "      <p>Hello</p>",
            "    </div>",
            "  );",
            "}",
            "```"
        ].join("\n");
        expect(stripMdxComments(input)).toBe(input);
    });

    it("preserves multi-line comments inside code blocks", () => {
        const input = [
            "```jsx",
            "{/*",
            "  This multi-line comment",
            "  inside a code block should stay",
            "*/}",
            "const x = 1;",
            "```"
        ].join("\n");
        expect(stripMdxComments(input)).toBe(input);
    });

    it("strips comments outside code blocks but preserves them inside", () => {
        const input = [
            "{/* strip this */}",
            "```jsx",
            "{/* keep this */}",
            "```",
            "{/* strip this too */}",
            "End"
        ].join("\n");
        const expected = ["```jsx", "{/* keep this */}", "```", "End"].join("\n");
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("preserves CodeBlock JSX component as content", () => {
        const input = [
            "Here is a code example:",
            "",
            "<CodeBlock",
            '  language="python"',
            "  code=\"print('hello')\"",
            "/>",
            "",
            "And more text."
        ].join("\n");
        expect(stripMdxComments(input)).toBe(input);
    });

    it("strips comments around CodeBlock components", () => {
        const input = [
            "{/* This comment should be removed */}",
            "<CodeBlock",
            '  language="python"',
            "  code=\"print('hello')\"",
            "/>",
            "{/* This comment too */}",
            "Done."
        ].join("\n");
        const expected = ["<CodeBlock", '  language="python"', "  code=\"print('hello')\"", "/>", "Done."].join("\n");
        expect(stripMdxComments(input)).toBe(expected);
    });

    it("preserves CodeBlock inside code fences", () => {
        const input = [
            "```mdx",
            "<CodeBlock",
            '  language="js"',
            '  code="const x = 1;"',
            "/>",
            "{/* comment inside fence */}",
            "```"
        ].join("\n");
        expect(stripMdxComments(input)).toBe(input);
    });

    it("preserves comments inside inline code with CodeBlock", () => {
        const input = "Use `<CodeBlock {/* comment */} />` in your MDX";
        expect(stripMdxComments(input)).toBe(input);
    });

    it("strips multi-line comment containing double backticks", () => {
        const input = [
            "hello world",
            "",
            "{/* please remove",
            "",
            "this comment.",
            "",
            "``and the code here``",
            "",
            "*/}"
        ].join("\n");
        expect(stripMdxComments(input)).not.toContain("{/*");
        expect(stripMdxComments(input)).not.toContain("*/}");
        expect(stripMdxComments(input)).not.toContain("please remove");
        expect(stripMdxComments(input)).toContain("hello world");
    });

    it("strips multi-line comment containing single backticks", () => {
        const input = ["hello world", "", "{/* remove this", "", "`some code`", "", "*/}"].join("\n");
        expect(stripMdxComments(input)).not.toContain("{/*");
        expect(stripMdxComments(input)).not.toContain("*/}");
        expect(stripMdxComments(input)).not.toContain("remove this");
        expect(stripMdxComments(input)).toContain("hello world");
    });

    it("strips comment in real-world MDX with JSX components and tables", () => {
        const input = [
            "---",
            "title: Baby Fern",
            "---",
            "",
            "hellooooooo",
            "",
            '<RunnableEndpoint endpoint="POST /api/v1/surveys/{survey_id}/responses/" />',
            "",
            "<Code",
            '  src="https://example.com/script.ts"',
            "/>",
            "",
            "<table>",
            "  <tr><td>John</td></tr>",
            "</table>",
            "",
            "",
            "{/* please remove",
            "",
            "this comment.",
            "",
            "``and the code here``",
            "",
            "*/}"
        ].join("\n");
        expect(stripMdxComments(input)).not.toContain("{/*");
        expect(stripMdxComments(input)).not.toContain("*/}");
        expect(stripMdxComments(input)).toContain("hellooooooo");
        expect(stripMdxComments(input)).toContain("<table>");
    });

    it("handles real-world MDX content with mixed comments", () => {
        const input = [
            "---",
            "title: My Page",
            "---",
            "",
            "{/* This is an internal note */}",
            "",
            "# Welcome",
            "",
            "Some content here.",
            "",
            "{/* TODO: Update this section */}",
            "",
            "More content."
        ].join("\n");
        const expected = [
            "---",
            "title: My Page",
            "---",
            "",
            "",
            "# Welcome",
            "",
            "Some content here.",
            "",
            "",
            "More content."
        ].join("\n");
        expect(stripMdxComments(input)).toBe(expected);
    });
});
