import { describe, expect, it } from "vitest";

import { applyContentVariant } from "../applyContentVariant";

const PAGE = `---
title: Configure {{variant.server}}
---

Edit \`{{variant.config-path}}\` on your {{variant.server}} server.

<Variant name="nginx">
\`\`\`nginx
server { listen 80; }
\`\`\`
</Variant>
<Variant name="apache">
\`\`\`apache
Listen 80
\`\`\`
</Variant>
<Variant name="nginx, apache">
Restart the server afterwards.
</Variant>

Use <Variant name='nginx'>nginx -s reload</Variant><Variant name={"apache"}>apachectl graceful</Variant> to reload.
`;

describe("applyContentVariant", () => {
    it("keeps only the matching variant blocks and substitutes values", () => {
        const result = applyContentVariant({
            markdown: PAGE,
            variantId: "nginx",
            values: { server: "NGINX", "config-path": "/etc/nginx/nginx.conf" }
        });
        expect(result.hasVariantBlocks).toBe(true);
        expect(result.missingValues).toEqual([]);
        expect(result.markdown).toMatchInlineSnapshot(`
          "---
          title: Configure NGINX
          ---

          Edit \`/etc/nginx/nginx.conf\` on your NGINX server.

          \`\`\`nginx
          server { listen 80; }
          \`\`\`

          Restart the server afterwards.

          Use nginx -s reload to reload.
          "
        `);
    });

    it("selects a different variant from the same source", () => {
        const result = applyContentVariant({
            markdown: PAGE,
            variantId: "apache",
            values: { server: "Apache", "config-path": "/etc/apache2/httpd.conf" }
        });
        expect(result.markdown).toContain("Listen 80");
        expect(result.markdown).not.toContain("listen 80;");
        expect(result.markdown).toContain("Restart the server afterwards.");
        expect(result.markdown).toContain("Use apachectl graceful to reload.");
        expect(result.markdown).toContain("title: Configure Apache");
    });

    it("reports missing values and leaves the placeholder in place", () => {
        const result = applyContentVariant({
            markdown: "Hello {{variant.name}} and {{ variant.missing }}",
            variantId: "a",
            values: { name: "World" }
        });
        expect(result.markdown).toBe("Hello World and {{ variant.missing }}");
        expect(result.missingValues).toEqual(["missing"]);
        expect(result.hasVariantBlocks).toBe(false);
    });

    it("removes every variant block when no variant is selected", () => {
        const result = applyContentVariant({
            markdown: 'Before\n<Variant name="a">\nA\n</Variant>\nAfter {{variant.x}}',
            variantId: undefined
        });
        expect(result.markdown).toBe("Before\n\nAfter {{variant.x}}");
        expect(result.hasVariantBlocks).toBe(true);
    });

    it("treats <Variant> tags inside fenced and inline code as literal text", () => {
        const markdown = [
            'Wrap content in `<Variant name="a">` tags.',
            "",
            "```mdx",
            '<Variant name="b">',
            "literal example",
            "</Variant>",
            "```",
            "",
            '<Variant name="a">',
            "```bash",
            "echo {{variant.server}}",
            "```",
            "</Variant>",
            '<Variant name="b">',
            "hidden",
            "</Variant>"
        ].join("\n");
        const result = applyContentVariant({ markdown, variantId: "a", values: { server: "NGINX" } });
        expect(result.markdown).toBe(
            [
                'Wrap content in `<Variant name="a">` tags.',
                "",
                "```mdx",
                '<Variant name="b">',
                "literal example",
                "</Variant>",
                "```",
                "",
                "```bash",
                "echo NGINX",
                "```",
                ""
            ].join("\n")
        );
    });

    it("substitutes values in frontmatter", () => {
        const result = applyContentVariant({
            markdown: "---\ntitle: Configure {{variant.server}}\n---\n\nBody",
            variantId: "a",
            values: { server: "Apache" }
        });
        expect(result.markdown).toBe("---\ntitle: Configure Apache\n---\n\nBody");
    });

    it("leaves content without variant syntax untouched", () => {
        const markdown = "# Title\n\nPlain content with {{other}} placeholders.";
        expect(applyContentVariant({ markdown, variantId: "a" }).markdown).toBe(markdown);
    });
});
