import { describe, expect, it } from "vitest";
import { getGeneratorOutputSubfolder } from "../getGeneratorOutputSubfolder.js";

describe("getGeneratorOutputSubfolder", () => {
    it("strips org prefix from scoped generator name", () => {
        expect(getGeneratorOutputSubfolder("fernapi/fern-typescript-sdk")).toBe("fern-typescript-sdk");
    });

    it("returns name as-is when unscoped", () => {
        expect(getGeneratorOutputSubfolder("fern-python-sdk")).toBe("fern-python-sdk");
    });

    it("sanitizes characters that are not alphanumeric, dash, or underscore", () => {
        expect(getGeneratorOutputSubfolder("fernapi/fern.special+gen")).toBe("fern_special_gen");
    });

    it("falls back to 'sdk' for empty string after split", () => {
        expect(getGeneratorOutputSubfolder("fernapi/")).toBe("sdk");
    });

    it("handles deeply nested scopes by taking last segment", () => {
        expect(getGeneratorOutputSubfolder("org/sub/fern-go-sdk")).toBe("fern-go-sdk");
    });

    it("preserves underscores and dashes", () => {
        expect(getGeneratorOutputSubfolder("my_gen-name")).toBe("my_gen-name");
    });
});
