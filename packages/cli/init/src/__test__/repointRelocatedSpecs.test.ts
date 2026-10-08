import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import yaml from "js-yaml";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { repointRelocatedSpecs } from "../repointRelocatedSpecs.js";

const DOCS_YML = ["# my docs", "navigation:", "  - api: API Reference", "    specs:", "      - type: openapi", ""];

describe("repointRelocatedSpecs", () => {
    let fernDirectory: string;

    beforeEach(async () => {
        fernDirectory = path.join(await realpath(await mkdtemp(path.join(tmpdir(), "fern-repoint-"))), "fern");
        await mkdir(fernDirectory);
    });

    afterEach(async () => {
        await rm(path.dirname(fernDirectory), { recursive: true, force: true });
    });

    const docsYmlPath = (): string => path.join(fernDirectory, "docs.yml");
    const repoint = (): Promise<void> =>
        repointRelocatedSpecs({ absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory) });

    async function writeDocsYml(specPaths: string[]): Promise<string> {
        const content = [...DOCS_YML.slice(0, -1), ...specPaths.map((specPath) => `        path: ${specPath}`), ""];
        await writeFile(docsYmlPath(), content.join("\n"));
        return await readFile(docsYmlPath(), "utf8");
    }

    async function relocate(filename: string): Promise<void> {
        await mkdir(path.join(fernDirectory, "apis", "api"), { recursive: true });
        await writeFile(path.join(fernDirectory, "apis", "api", filename), "{}");
    }

    it("points the docs at the spec that moved into apis/api", async () => {
        await writeDocsYml(["./openapi.json"]);
        await relocate("openapi.json");

        await repoint();

        expect(yaml.load(await readFile(docsYmlPath(), "utf8"))).toMatchObject({
            navigation: [{ specs: [{ path: "./apis/api/openapi.json" }] }]
        });
    });

    it("leaves docs.yml, comments included, when its specs did not move", async () => {
        const before = await writeDocsYml(["./other.json"]);
        await relocate("openapi.json");

        await repoint();

        expect(await readFile(docsYmlPath(), "utf8")).toBe(before);
    });

    it("leaves docs.yml alone when the spec is still in the fern directory", async () => {
        const before = await writeDocsYml(["./openapi.json"]);
        await writeFile(path.join(fernDirectory, "openapi.json"), "{}");
        await relocate("openapi.json");

        await repoint();

        expect(await readFile(docsYmlPath(), "utf8")).toBe(before);
    });

    it("does nothing without a docs.yml", async () => {
        await relocate("openapi.json");

        await repoint();

        await expect(readFile(docsYmlPath(), "utf8")).rejects.toThrow();
    });
});
