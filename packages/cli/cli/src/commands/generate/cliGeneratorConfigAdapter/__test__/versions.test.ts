import { describe, expect, it } from "vitest";

import { resolveGeneratorVersion, supportsGithubAttestations } from "../versions.js";
import { codes } from "./helpers.js";

describe("resolveGeneratorVersion", () => {
    it("writes latest when sdk-config.yml pins no version, so the generation route resolves it", () => {
        expect(resolveGeneratorVersion({ pinned: undefined })).toEqual({ version: "latest", diagnostics: [] });
    });

    it("keeps an exact pinned version, with no warning", () => {
        for (const version of ["0.49.0", "0.54.3", "1.0.0-rc.1"]) {
            expect(resolveGeneratorVersion({ pinned: version })).toEqual({ version, diagnostics: [] });
        }
    });

    it("returns an error for a pinned version that is not an exact semver, such as latest", () => {
        for (const version of ["latest", "0.49", "v0.49.0", "^0.49.0"]) {
            expect(codes(resolveGeneratorVersion({ pinned: version }).diagnostics)).toEqual([
                "error CLI_TARGET_GENERATOR_VERSION target.generatorVersion"
            ]);
        }
    });
});

describe("supportsGithubAttestations", () => {
    it("is true from 0.54.3 and for latest, false before", () => {
        expect(supportsGithubAttestations("0.54.2")).toBe(false);
        expect(supportsGithubAttestations("0.54.3")).toBe(true);
        expect(supportsGithubAttestations("latest")).toBe(true);
    });
});
