import { describe, expect, it } from "vitest";
import { resolveGeneratorImage } from "../constants";

describe("resolveGeneratorImage", () => {
    it("tags a bare generator name with its version", () => {
        expect(
            resolveGeneratorImage({
                containerImage: undefined,
                name: "fernapi/fern-python-sdk",
                version: "4.0.0"
            })
        ).toBe("fernapi/fern-python-sdk:4.0.0");
    });

    it("prefers an explicit container image over the generator name", () => {
        expect(
            resolveGeneratorImage({
                containerImage: "ghcr.io/acme/fern-python-sdk",
                name: "fernapi/fern-python-sdk",
                version: "4.0.0"
            })
        ).toBe("ghcr.io/acme/fern-python-sdk:4.0.0");
    });

    it("returns a pinned digest unchanged rather than appending a tag", () => {
        const digest = `ghcr.io/acme/fern-python-sdk@sha256:${"a".repeat(64)}`;

        expect(
            resolveGeneratorImage({
                containerImage: digest,
                name: "fernapi/fern-python-sdk",
                version: "4.0.0"
            })
        ).toBe(digest);
    });
});
