import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { planGeneratorsSlot, RUBICON_HEADER } from "../planGeneratorsSlot.js";
import { codes, type TempFolder, tempFolder } from "./helpers.js";

const MIGRATED_ALL = `api:
  specs:
    - openapi: ./openapi.yml
groups: {}
# Migrated to ./sdk-config.yml: All SDK generator groups
# groups:
#   cli:
#     generators:
#       - name: fernapi/fern-cli-generator
`;

const MIGRATED_PARTLY = `api:
  specs:
    - openapi: ./openapi.yml
groups:
  docs:
    generators:
      - name: fernapi/fern-postman
        version: 1.0.0
  internal:
    generators: []
# Group 'cli' migrated to ./sdk-config.yml
`;

let folder: TempFolder | undefined;
afterEach(async () => {
    await folder?.remove();
    folder = undefined;
});

async function plan(files: Record<string, string>, force = false) {
    folder = await tempFolder(files);
    return { folder: folder.path, ...(await planGeneratorsSlot({ folder: folder.path, force })) };
}

describe("planGeneratorsSlot", () => {
    it("writes generators.yml when the folder has no generators file", async () => {
        const result = await plan({ "sdk-config.yml": "x: 1" });
        expect(result.diagnostics).toEqual([]);
        expect(result.slot).toEqual({
            generatorsPath: join(result.folder, "generators.yml"),
            previous: undefined,
            renames: [],
            removals: [],
            rollback: []
        });
    });

    it("overwrites generators.yml that has the rubicon header, and returns its contents as previous", async () => {
        const result = await plan({ "generators.yml": `${RUBICON_HEADER} from sdk-config.yml.\napi: {}\n` });
        expect(result.diagnostics).toEqual([]);
        expect(result.slot?.previous).toEqual({ api: {} });
    });

    it("stops with RUBICON_GENERATORS_EXISTS for generators.yml without the header", async () => {
        const result = await plan({ "generators.yml": "api: {}\n" });
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_GENERATORS_EXISTS generators.yml"]);
        expect(result.slot).toBeUndefined();
    });

    it("stops with RUBICON_GENERATORS_EXISTS for generators.yaml without the header", async () => {
        const result = await plan({ "generators.yaml": "api: {}\n" });
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_GENERATORS_EXISTS generators.yaml"]);
    });

    it("overwrites the user generators.yml with --force, without carrying anything over", async () => {
        const result = await plan({ "generators.yml": "api: {}\n" }, true);
        expect(result.diagnostics).toEqual([]);
        expect(result.slot?.previous).toBeUndefined();
    });

    it("replaces generators.yaml with generators.yml under --force", async () => {
        const result = await plan({ "generators.yaml": "api: {}\n" }, true);
        expect(result.slot?.removals).toEqual([join(result.folder, "generators.yaml")]);
    });

    it("renames generators.legacy.yml with groups: {} to generators.legacy.pre-rubicon.yml", async () => {
        const result = await plan({ "generators.legacy.yml": MIGRATED_ALL });
        expect(result.diagnostics).toEqual([]);
        expect(result.slot?.renames).toEqual([
            {
                from: join(result.folder, "generators.legacy.yml"),
                to: join(result.folder, "generators.legacy.pre-rubicon.yml")
            }
        ]);
    });

    it("treats a legacy file without a groups key as having no active group", async () => {
        const result = await plan({ "generators.legacy.yml": "api:\n  specs: []\n" });
        expect(result.slot?.renames).toHaveLength(1);
    });

    it("stops with RUBICON_LEGACY_GROUPS_ACTIVE naming each active group, even with --force", async () => {
        const result = await plan({ "generators.legacy.yml": MIGRATED_PARTLY }, true);
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_LEGACY_GROUPS_ACTIVE generators.legacy.yml"]);
        expect(result.diagnostics[0]?.message).toContain("docs, internal");
    });

    it("stops when generators.yml and generators.legacy.yml are both present", async () => {
        const result = await plan({ "generators.yml": "api: {}\n", "generators.legacy.yml": MIGRATED_ALL }, true);
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_GENERATORS_CONFLICT generators.yml"]);
    });

    it("stops with RUBICON_RENAME_CONFLICT when generators.legacy.pre-rubicon.yml already exists", async () => {
        const result = await plan({
            "generators.legacy.yml": MIGRATED_ALL,
            "generators.legacy.pre-rubicon.yml": "old"
        });
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_RENAME_CONFLICT generators.legacy.pre-rubicon.yml"]);
    });

    it("returns rollback steps for the legacy rename that restore it after generators.yml is deleted", async () => {
        const result = await plan({ "generators.legacy.yml": MIGRATED_ALL });
        expect(result.slot?.rollback).toEqual([
            `Delete ${join(result.folder, "generators.yml")}.`,
            `Rename ${join(result.folder, "generators.legacy.pre-rubicon.yml")} back to ${join(result.folder, "generators.legacy.yml")}.`
        ]);
    });
});
