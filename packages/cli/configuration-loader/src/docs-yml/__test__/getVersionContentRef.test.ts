import { docsYml } from "@fern-api/configuration";
import { describe, expect, it } from "vitest";

import { getVersionContentRef } from "../git-versions/getVersionContentRef.js";

/**
 * `getVersionContentRef` is the single place that knows the docs.yml field shape for
 * git-ref-backed versions. These tests pin its normalization behavior so the field
 * shape can be swapped in one spot.
 */
describe("getVersionContentRef", () => {
    function versionConfig(overrides: Partial<docsYml.RawSchemas.VersionConfig>): docsYml.RawSchemas.VersionConfig {
        return { displayName: "2.0", ...overrides };
    }

    it("returns undefined for a working-tree (path-only) version", () => {
        expect(getVersionContentRef(versionConfig({ path: "./versions/latest.yml" }))).toBeUndefined();
    });

    it("returns undefined when neither ref nor path is set", () => {
        expect(getVersionContentRef(versionConfig({}))).toBeUndefined();
    });

    it("returns the ref when a ref is set", () => {
        expect(getVersionContentRef(versionConfig({ ref: "release/2.3" }))).toBe("release/2.3");
    });

    it("returns the ref (a tag) when a ref is set", () => {
        expect(getVersionContentRef(versionConfig({ ref: "v2.2.0" }))).toBe("v2.2.0");
    });
});
