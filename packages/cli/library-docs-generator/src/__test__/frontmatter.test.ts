import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import { renderFrontmatter, yamlDoubleQuote } from "../../cpp/src/renderers/shared";

function parse(lines: string[]): Record<string, unknown> {
    // Same YAML parser gray-matter (used by `fern docs md check`) runs on frontmatter.
    return yaml.load(lines.slice(1, -1).join("\n")) as Record<string, unknown>;
}

describe("renderFrontmatter", () => {
    it("round-trips backslashes that are invalid YAML escapes (\\M)", () => {
        const data = parse(renderFrontmatter("flexio_dev_puts", "Prints via \\M ... \\A"));
        expect(data.description).toBe("Prints via \\M ... \\A");
    });

    it("round-trips valid YAML escapes as literal text (\\n, \\t, \\0, C:\\path)", () => {
        const text = "Line ends with \\n and \\t and \\0 at C:\\Users\\me";
        const data = parse(renderFrontmatter("t", text));
        expect(data.description).toBe(text);
    });

    it("still escapes double quotes", () => {
        const data = parse(renderFrontmatter("t", 'Say "hi" \\"twice\\"'));
        expect(data.description).toBe('Say "hi" \\"twice\\"');
    });

    it("escapes backslashes in quoted titles", () => {
        const data = parse(renderFrontmatter("a: b\\c", "d"));
        expect(data.title).toBe("a: b\\c");
    });

    it("yamlDoubleQuote escapes backslash before quote", () => {
        expect(yamlDoubleQuote('\\"')).toBe('"\\\\\\""');
    });
});
