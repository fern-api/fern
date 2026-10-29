import { getMintlifyComponentWarnings } from "../rules/valid-markdown/mintlify-components.js";

describe("getMintlifyComponentWarnings", () => {
    it("warns once per component with an occurrence count", () => {
        const content = `---
title: Research tools
---

### Response

<ResponseField name="rows" type="array">
  The rows the query returned.
</ResponseField>

<ResponseField name="count" type="number">
  How many rows came back.
</ResponseField>
`;
        expect(getMintlifyComponentWarnings(content)).toEqual([
            '<ResponseField> is a Mintlify component, not a Fern component (2 occurrences). Use <ParamField path="..."> instead; <ResponseField name="..."> is rendered as a ParamField alias.'
        ]);
    });

    it("ignores ResponseField inside code blocks and inline code", () => {
        const content = [
            "Mintlify uses `<ResponseField>`.",
            "",
            "```mdx",
            '<ResponseField name="rows" type="array">x</ResponseField>',
            "```"
        ].join("\n");
        expect(getMintlifyComponentWarnings(content)).toEqual([]);
    });

    it("does not warn on ParamField", () => {
        expect(getMintlifyComponentWarnings('<ParamField path="rows" type="array">x</ParamField>')).toEqual([]);
    });
});
