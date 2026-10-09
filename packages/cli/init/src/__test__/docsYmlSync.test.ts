import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { preserveDocsSpecs, repointRelocatedSpecs } from "../docsYmlSync.js";

describe("docsYmlSync", () => {
    let fernDirectory: string;
    let warnings: string[];
    let taskContext: ReturnType<typeof createMockTaskContext>;

    beforeEach(async () => {
        warnings = [];
        taskContext = createMockTaskContext({
            logger: createLogger((level, ...args) => {
                if (level === LogLevel.Warn) {
                    warnings.push(args.join(" "));
                }
            })
        });
        fernDirectory = path.join(await realpath(await mkdtemp(path.join(tmpdir(), "fern-docs-sync-"))), "fern");
        await mkdir(fernDirectory);
    });

    afterEach(async () => {
        await rm(path.dirname(fernDirectory), { recursive: true, force: true });
    });

    const inFern = (...segments: string[]): string => path.join(fernDirectory, ...segments);
    const exists = (...segments: string[]): Promise<boolean> => doesPathExist(AbsoluteFilePath.of(inFern(...segments)));
    const readDocsYml = (): Promise<string> => readFile(inFern("docs.yml"), "utf8");

    async function writeDocsYml(specPath: string): Promise<string> {
        const content = `# my docs\nnavigation:\n  - api: API Reference\n    specs:\n      - type: openapi\n        path: ${specPath}\n`;
        await writeFile(inFern("docs.yml"), content);
        return content;
    }

    async function writeSpec(...segments: string[]): Promise<void> {
        await mkdir(path.dirname(inFern(...segments)), { recursive: true });
        await writeFile(inFern(...segments), "{}");
    }

    describe("repointRelocatedSpecs", () => {
        const repoint = (): Promise<void> =>
            repointRelocatedSpecs({ absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory), taskContext });

        it("points the docs at the spec that moved into apis/api", async () => {
            await writeDocsYml("./openapi.json");
            await writeSpec("apis", "api", "openapi.json");

            await repoint();

            expect(yaml.load(await readDocsYml())).toMatchObject({
                navigation: [{ specs: [{ path: "./apis/api/openapi.json" }] }]
            });
        });

        it("leaves docs.yml, comments included, when its specs did not move", async () => {
            const before = await writeDocsYml("./other.json");
            await writeSpec("apis", "api", "openapi.json");

            await repoint();

            expect(await readDocsYml()).toBe(before);
        });

        it("leaves docs.yml alone when the spec is still in the fern directory", async () => {
            const before = await writeDocsYml("./openapi.json");
            await writeSpec("openapi.json");
            await writeSpec("apis", "api", "openapi.json");

            await repoint();

            expect(await readDocsYml()).toBe(before);
        });

        it("warns and leaves a docs.yml that cannot be parsed", async () => {
            await writeFile(inFern("docs.yml"), "navigation: [unclosed");
            await writeSpec("apis", "api", "openapi.json");

            await repoint();

            expect(await readDocsYml()).toBe("navigation: [unclosed");
            expect(warnings.join("\n")).toContain("could not be parsed");
        });

        it("does nothing without a docs.yml", async () => {
            await writeSpec("apis", "api", "openapi.json");

            await repoint();

            expect(await exists("docs.yml")).toBe(false);
        });
    });

    describe("preserveDocsSpecs", () => {
        const preserve = (): Promise<void> =>
            preserveDocsSpecs({ absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory), taskContext });

        it("gives the spec of the docs a free name and points docs.yml at it", async () => {
            await writeDocsYml("./openapi.yml");
            await writeFile(inFern("openapi.yml"), "catalog");

            await preserve();

            expect(await exists("openapi.yml")).toBe(false);
            expect(await readFile(inFern("openapi-1.yml"), "utf8")).toBe("catalog");
            expect(yaml.load(await readDocsYml())).toMatchObject({
                navigation: [{ specs: [{ path: "./openapi-1.yml" }] }]
            });
        });

        it("skips a name that is taken", async () => {
            await writeDocsYml("./openapi.json");
            await writeFile(inFern("openapi.json"), "catalog");
            await writeFile(inFern("openapi-1.json"), "other");

            await preserve();

            expect(await readFile(inFern("openapi-2.json"), "utf8")).toBe("catalog");
            expect(await readFile(inFern("openapi-1.json"), "utf8")).toBe("other");
        });

        it("leaves a spec that docs.yml does not read", async () => {
            const before = await writeDocsYml("./other.yml");
            await writeFile(inFern("openapi.yml"), "stray");

            await preserve();

            expect(await readFile(inFern("openapi.yml"), "utf8")).toBe("stray");
            expect(await readDocsYml()).toBe(before);
        });

        it("warns and leaves a docs.yml that cannot be parsed", async () => {
            await writeFile(inFern("docs.yml"), "navigation: [unclosed");
            await writeFile(inFern("openapi.yml"), "stray");

            await preserve();

            expect(await readDocsYml()).toBe("navigation: [unclosed");
            expect(await readFile(inFern("openapi.yml"), "utf8")).toBe("stray");
            expect(warnings.join("\n")).toContain("could not be parsed");
        });

        it("does not read docs.yml when there is no spec that could be overwritten", async () => {
            await writeFile(inFern("docs.yml"), "navigation: [unclosed");

            await preserve();

            expect(warnings).toEqual([]);
        });

        it("does nothing without a docs.yml", async () => {
            await writeFile(inFern("openapi.yml"), "stray");

            await preserve();

            expect(await readFile(inFern("openapi.yml"), "utf8")).toBe("stray");
        });
    });
});
