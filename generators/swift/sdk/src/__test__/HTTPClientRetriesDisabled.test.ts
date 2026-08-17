import { SourceTemplateFiles } from "@fern-api/swift-base";
import { describe, expect, it } from "vitest";

describe("HTTPClient template retriesDisabled support", () => {
    it("accepts retriesDisabled on the performRequest overloads and the request executor", async () => {
        const contents = await SourceTemplateFiles.HTTPClient.loadContents();
        const occurrences = contents.match(/retriesDisabled: Swift\.Bool = false/g) ?? [];
        expect(occurrences).toHaveLength(3);
    });

    it("forces zero retries when retriesDisabled is set", async () => {
        const contents = await SourceTemplateFiles.HTTPClient.loadContents();
        expect(contents).toContain(
            "let maxRetries = retriesDisabled ? 0 : (requestOptions?.maxRetries ?? clientConfig.maxRetries)"
        );
    });
});
