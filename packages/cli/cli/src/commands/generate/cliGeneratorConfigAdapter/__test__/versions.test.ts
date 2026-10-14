import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import YAML from "yaml";

import { DEFAULT_GENERATOR_VERSION, POOLED_GENERATOR_VERSIONS, resolveGeneratorVersion } from "../versions.js";
import { codes, FIXTURES } from "./helpers.js";

const REPO_ROOT = join(FIXTURES, "..", "..", "..", "..", "..", "..", "..", "..", "..");

describe("resolveGeneratorVersion", () => {
    it("defaults to 0.49.0 when sdk-config.yml pins no version", () => {
        expect(resolveGeneratorVersion({ pinned: undefined })).toEqual({
            version: "0.49.0",
            diagnostics: []
        });
    });

    it("returns an error for a version that is not an exact semver, such as latest", () => {
        for (const version of ["latest", "0.49", "v0.49.0", "^0.49.0"]) {
            expect(codes(resolveGeneratorVersion({ pinned: version }).diagnostics)).toEqual([
                "error CLI_TARGET_GENERATOR_VERSION target.generatorVersion"
            ]);
        }
    });

    it("warns CLI_TARGET_UNPOOLED_VERSION for a version outside POOLED_GENERATOR_VERSIONS", () => {
        expect(codes(resolveGeneratorVersion({ pinned: "0.50.0" }).diagnostics)).toEqual([
            "warning CLI_TARGET_UNPOOLED_VERSION target.generatorVersion"
        ]);
    });

    it("keeps DEFAULT_GENERATOR_VERSION in POOLED_GENERATOR_VERSIONS", () => {
        expect(POOLED_GENERATOR_VERSIONS).toContain(DEFAULT_GENERATOR_VERSION);
    });

    it("pins a version that generators/cli/versions.yml publishes", async () => {
        const versions: unknown = YAML.parse(
            await readFile(join(REPO_ROOT, "generators", "cli", "versions.yml"), "utf8")
        );
        const published = Array.isArray(versions)
            ? versions.map((entry: unknown) =>
                  typeof entry === "object" && entry != null && "version" in entry ? entry.version : undefined
              )
            : [];
        expect(published).toContain(DEFAULT_GENERATOR_VERSION);
    });
});
