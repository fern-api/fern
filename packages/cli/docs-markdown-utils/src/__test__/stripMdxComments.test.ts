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
