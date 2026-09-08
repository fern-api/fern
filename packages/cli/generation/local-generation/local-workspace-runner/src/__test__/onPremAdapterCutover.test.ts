import { describe, expect, it } from "vitest";

import {
    generatorWantsSdkConfigIr,
    generatorWantsSpecs,
    isOnPremAdapter,
    onPremAdapterLanguage
} from "../constants.js";

// The adapter is published under the Fern generator names it replaces, so the name is identical
// whether the image is Fern's or Postman's and the version is the only discriminator. These tests
// pin that boundary: below the cutover the invocation must stay on Fern's path untouched.
describe("isOnPremAdapter", () => {
    it("treats the cutover version itself as the adapter", () => {
        expect(isOnPremAdapter("fernapi/fern-typescript-sdk", "4.0.0")).toBe(true);
    });

    it("leaves a version below the cutover on Fern's own generator", () => {
        expect(isOnPremAdapter("fernapi/fern-typescript-sdk", "3.99.99")).toBe(false);
        expect(isOnPremAdapter("fernapi/fern-python-sdk", "5.9.0")).toBe(false);
    });

    it("compares version parts numerically, not lexically", () => {
        // "10.0.0" < "4.0.0" as strings, so a string compare would take this for a pre-cutover Fern
        // generator and hand it a Fern generator config it cannot read.
        expect(isOnPremAdapter("fernapi/fern-typescript-sdk", "10.0.0")).toBe(true);
        expect(isOnPremAdapter("fernapi/fern-go-sdk", "10.2.0")).toBe(true);
    });

    it("counts a prerelease of the cutover as the adapter", () => {
        expect(isOnPremAdapter("fernapi/fern-typescript-sdk", "4.0.0-rc1")).toBe(true);
    });

    it("covers both TypeScript generator names at one cutover", () => {
        expect(isOnPremAdapter("fernapi/fern-typescript-node-sdk", "4.0.0")).toBe(true);
    });

    it("ignores a generator that has no cutover, at any version", () => {
        expect(isOnPremAdapter("fernapi/fern-kotlin-sdk", "99.0.0")).toBe(false);
        expect(isOnPremAdapter("fernapi/fern-cli-generator", "99.0.0")).toBe(false);
        expect(isOnPremAdapter("acme/some-generator", "99.0.0")).toBe(false);
    });
});

describe("onPremAdapterLanguage", () => {
    it("derives the language from the generator name", () => {
        expect(onPremAdapterLanguage("fernapi/fern-python-sdk")).toBe("python");
        expect(onPremAdapterLanguage("fernapi/fern-typescript-node-sdk")).toBe("typescript");
    });

    it("returns undefined for a name it does not publish", () => {
        expect(onPremAdapterLanguage("fernapi/fern-kotlin-sdk")).toBeUndefined();
    });
});

describe("what the CLI hands the container", () => {
    it("sends SDK Config IR at and above the cutover, and a Fern config below it", () => {
        expect(generatorWantsSdkConfigIr("fernapi/fern-python-sdk", "6.0.0")).toBe(true);
        expect(generatorWantsSdkConfigIr("fernapi/fern-python-sdk", "5.0.0")).toBe(false);
    });

    it("mounts the raw specs for the adapter, which generates from the spec", () => {
        expect(generatorWantsSpecs("fernapi/fern-python-sdk", "6.0.0")).toBe(true);
        expect(generatorWantsSpecs("fernapi/fern-python-sdk", "5.0.0")).toBe(false);
    });

    it("keeps mounting them for the first-party allowlist entry, at any version", () => {
        expect(generatorWantsSpecs("fernapi/fern-cli-generator", "0.1.0")).toBe(true);
    });

    it("does not mount them when no version is available to compare", () => {
        expect(generatorWantsSpecs("fernapi/fern-python-sdk")).toBe(false);
    });
});
