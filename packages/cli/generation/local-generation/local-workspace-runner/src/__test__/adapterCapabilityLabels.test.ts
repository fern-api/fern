import { describe, expect, it } from "vitest";

import {
    generatorWantsSpecs,
    labelsRequestRawSpecs,
    resolveGeneratorImage,
    WANTS_RAW_SPECS_LABEL
} from "../constants.js";

describe("labelsRequestRawSpecs", () => {
    it("opts the image in when the label is set", () => {
        expect(labelsRequestRawSpecs({ [WANTS_RAW_SPECS_LABEL]: "true" })).toBe(true);
    });

    it("accepts the label case-insensitively", () => {
        expect(labelsRequestRawSpecs({ [WANTS_RAW_SPECS_LABEL]: "TRUE" })).toBe(true);
    });

    it.each([
        ["the label is absent", {}],
        ["the label is false", { [WANTS_RAW_SPECS_LABEL]: "false" }],
        ["the label is empty", { [WANTS_RAW_SPECS_LABEL]: "" }],
        ["an unrelated label is present", { "org.opencontainers.image.title": "x" }]
    ])("does not opt in when %s", (_label, labels) => {
        expect(labelsRequestRawSpecs(labels)).toBe(false);
    });
});

describe("resolveGeneratorImage", () => {
    it("uses the generator name when no custom image is configured", () => {
        expect(
            resolveGeneratorImage({
                containerImage: undefined,
                name: "fernapi/fern-python-sdk",
                version: "4.0.0"
            })
        ).toBe("fernapi/fern-python-sdk:4.0.0");
    });

    // A self-hosted adapter keeps the Fern generator name and repoints only the registry, so the
    // resolved reference is the only thing that distinguishes it.
    it("prefers a custom registry image when one is configured", () => {
        expect(
            resolveGeneratorImage({
                containerImage: "ghcr.io/acme/fern-python-sdk",
                name: "fernapi/fern-python-sdk",
                version: "4.0.0"
            })
        ).toBe("ghcr.io/acme/fern-python-sdk:4.0.0");
    });
});

describe("generatorWantsSpecs", () => {
    it("keeps the existing first-party allowlist working", () => {
        expect(generatorWantsSpecs("fernapi/fern-cli-generator")).toBe(true);
    });

    it("does not opt in a generator by name alone", () => {
        expect(generatorWantsSpecs("fernapi/fern-python-sdk")).toBe(false);
    });
});
