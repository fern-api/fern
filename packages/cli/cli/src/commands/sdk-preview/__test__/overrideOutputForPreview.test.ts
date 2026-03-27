import { describe, expect, it } from "vitest";

import { isNpmGenerator } from "../overrideOutputForPreview.js";

describe("isNpmGenerator", () => {
    it("recognizes known TypeScript SDK generators", () => {
        expect(isNpmGenerator("fernapi/fern-typescript-node-sdk")).toBe(true);
        expect(isNpmGenerator("fernapi/fern-typescript-browser-sdk")).toBe(true);
        expect(isNpmGenerator("fernapi/fern-typescript-sdk")).toBe(true);
    });

    it("rejects unknown typescript generators not in the set", () => {
        expect(isNpmGenerator("custom/my-typescript-generator")).toBe(false);
    });

    it("rejects Python generators", () => {
        expect(isNpmGenerator("fernapi/fern-python-sdk")).toBe(false);
    });

    it("rejects Java generators", () => {
        expect(isNpmGenerator("fernapi/fern-java-sdk")).toBe(false);
    });

    it("rejects Go generators", () => {
        expect(isNpmGenerator("fernapi/fern-go-sdk")).toBe(false);
    });

    it("rejects Ruby generators", () => {
        expect(isNpmGenerator("fernapi/fern-ruby-sdk")).toBe(false);
    });

    it("rejects C# generators", () => {
        expect(isNpmGenerator("fernapi/fern-csharp-sdk")).toBe(false);
    });
});
