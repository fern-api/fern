import { access, chmod } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import YAML from "yaml";

import { RUBICON_HEADER } from "../planGeneratorsSlot.js";
import { applyFileChanges, planFileChanges } from "../writeGeneratorsConfiguration.js";
import { type TempFolder, tempFolder } from "./helpers.js";

let folder: TempFolder | undefined;
afterEach(async () => {
    if (folder != null) {
        await chmod(folder.path, 0o755).catch(() => undefined);
        await folder.remove();
    }
    folder = undefined;
});

const OVERLAY = (target: string) =>
    YAML.stringify({
        overlay: "1.0.0",
        info: { title: target, version: "1" },
        actions: [{ target, update: { x: 1 } }]
    });

async function exists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

async function setup(files: Record<string, string> = {}) {
    folder = await tempFolder({ "sdk-config.yml": "targets: []\n", ...files });
    return folder;
}

function changes(path: string, overrides: Partial<Parameters<typeof planFileChanges>[0]> = {}) {
    return planFileChanges({
        generatorsPath: join(path, "generators.yml"),
        generatorsYml: { api: { specs: [{ openapi: "./openapi.yml" }] } },
        overlayMerges: [],
        renames: [],
        removals: [],
        sdkConfigWrites: [],
        fernConfig: undefined,
        ...overrides
    });
}

describe("writeGeneratorsConfiguration", () => {
    it("writes generators.yml starting with the rubicon header comment", async () => {
        const { path, read } = await setup();
        await applyFileChanges(await changes(path));
        const written = await read("generators.yml");
        expect(written.startsWith(RUBICON_HEADER)).toBe(true);
        expect(YAML.parse(written)).toEqual({ api: { specs: [{ openapi: "./openapi.yml" }] } });
    });

    it("writes merged overlay files under .rubicon/", async () => {
        const { path, read } = await setup({ "a.yml": OVERLAY("$.a"), "b.yml": OVERLAY("$.b") });
        const planned = await changes(path, {
            overlayMerges: [
                {
                    path: join(path, ".rubicon", "overlay-main.yml"),
                    overlayPaths: [join(path, "a.yml"), join(path, "b.yml")]
                }
            ]
        });
        await applyFileChanges(planned);
        const merged = YAML.parse(await read(".rubicon/overlay-main.yml"));
        expect(merged.actions.map((action: { target: string }) => action.target)).toEqual(["$.a", "$.b"]);
    });

    it("creates fern.config.json only when the caller asks for it", async () => {
        const { path, read } = await setup();
        await applyFileChanges(
            await changes(path, { fernConfig: { path: join(path, "fern.config.json"), organization: "acme" } })
        );
        expect(JSON.parse(await read("fern.config.json"))).toEqual({ organization: "acme", version: "*" });
    });

    it("applies the generators.yml write, the D4 edit and the D5 rename together", async () => {
        const { path, read } = await setup({ "generators.legacy.yml": "groups: {}\n" });
        await applyFileChanges(
            await changes(path, {
                sdkConfigWrites: [{ path: join(path, "sdk-config.yml"), contents: "edited: true\n" }],
                renames: [
                    { from: join(path, "generators.legacy.yml"), to: join(path, "generators.legacy.pre-rubicon.yml") }
                ]
            })
        );
        expect(await read("sdk-config.yml")).toBe("edited: true\n");
        expect(await read("generators.legacy.pre-rubicon.yml")).toBe("groups: {}\n");
        expect(await exists(join(path, "generators.legacy.yml"))).toBe(false);
        expect(await exists(join(path, "generators.yml"))).toBe(true);
    });

    it("leaves every file unchanged when one planned change fails", async () => {
        const { path, read } = await setup({ "generators.legacy.yml": "groups: {}\n" });
        const planned = await changes(path, {
            sdkConfigWrites: [{ path: join(path, "sdk-config.yml"), contents: "edited: true\n" }],
            renames: [
                { from: join(path, "generators.legacy.yml"), to: join(path, "generators.legacy.pre-rubicon.yml") }
            ]
        });
        await chmod(path, 0o555);
        await expect(applyFileChanges(planned)).rejects.toThrow();
        await chmod(path, 0o755);
        expect(await read("sdk-config.yml")).toBe("targets: []\n");
        expect(await read("generators.legacy.yml")).toBe("groups: {}\n");
        expect(await exists(join(path, "generators.yml"))).toBe(false);
    });

    it("lists every write and removal in the plan, for the report and --dry-run", async () => {
        const { path } = await setup({ "generators.legacy.yml": "groups: {}\n" });
        const planned = await changes(path, {
            renames: [
                { from: join(path, "generators.legacy.yml"), to: join(path, "generators.legacy.pre-rubicon.yml") }
            ],
            removals: [join(path, "generators.yaml")]
        });
        expect(planned.files.map((file) => file.path).sort()).toEqual(
            [join(path, "generators.yml"), join(path, "generators.legacy.pre-rubicon.yml")].sort()
        );
        expect(planned.remove.sort()).toEqual(
            [join(path, "generators.legacy.yml"), join(path, "generators.yaml")].sort()
        );
    });
});
