import { docsYml } from "@fern-api/configuration";
import { describe, expect, it } from "vitest";

import { getVersionContentRef } from "../git-versions/getVersionContentRef.js";

/**
 * `getVersionContentRef` is the single place that knows the docs.yml field shape for
 * git-ref-backed versions. These tests pin its normalization behavior so the field
 * shape can be swapped (e.g. to a single `ref:`) in one spot.
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

    it("returns the branch when a branch is set", () => {
        expect(getVersionContentRef(versionConfig({ branch: "release/2.3" }))).toBe("release/2.3");
    });

    it("returns the tag when a tag is set", () => {
        expect(getVersionContentRef(versionConfig({ tag: "v2.2.0" }))).toBe("v2.2.0");
    });

    it("returns the ref even when an explicit path is also present", () => {
        expect(getVersionContentRef(versionConfig({ tag: "v2.1.0", path: "./versions/v2-1.yml" }))).toBe("v2.1.0");
    });
});
