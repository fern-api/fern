import { parseMarkdown } from "../rules/valid-markdown/valid-markdown";

describe("parseMarkdown", () => {
    it("should handle rehype-slug-custom-id", async () => {
        const markdown = `
        `;

        const result = await parseMarkdown({ markdown });

        expect(result).toHaveReturned();
    });
});
