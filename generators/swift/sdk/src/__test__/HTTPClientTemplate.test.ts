import { SourceTemplateFiles } from "@fern-api/swift-base";
import { describe, expect, it } from "vitest";

describe("HTTPClient template", () => {
    it("matches snapshot", async () => {
        const contents = await SourceTemplateFiles.HTTPClient.loadContents();
        expect(contents).toMatchSnapshot();
    });
});
