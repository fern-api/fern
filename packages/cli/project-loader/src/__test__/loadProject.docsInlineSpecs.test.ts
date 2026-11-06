import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { afterEach, describe, expect, it, vi } from "vitest";

import { loadProjectFromDirectory } from "../loadProject.js";

const OPENAPI_SPEC = "openapi: 3.0.0\ninfo:\n  title: Plants\n  version: 1.0.0\npaths: {}\n";

describe("loadProjectFromDirectory — docs.yml inline specs without generators.yml", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    async function createFernDirectory(docsYml: string): Promise<string> {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-docs-inline-specs-"));
        temporaryDirectories.push(fernDirectory);
        await mkdir(path.join(fernDirectory, "openapi"));
        await writeFile(path.join(fernDirectory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
        await writeFile(path.join(fernDirectory, "openapi", "openapi.yml"), OPENAPI_SPEC);
        await writeFile(path.join(fernDirectory, "docs.yml"), docsYml);
        return fernDirectory;
    }

    async function load(fernDirectory: string) {
        const errorSpy = vi.fn();
        const context = createMockTaskContext({
            logger: {
                disable: vi.fn(),
                enable: vi.fn(),
                trace: vi.fn(),
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: errorSpy,
                log: vi.fn()
            }
        });
        const project = await loadProjectFromDirectory({
            absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: false,
            context
        });
        return { project, errorSpy };
    }

    it("does not load openapi/ as a legacy API workspace when docs.yml references it inline", async () => {
        const fernDirectory = await createFernDirectory(
            [
                "instances:",
                "  - url: plants.docs.buildwithfern.com",
                "navigation:",
                "  - tab: api-reference",
                "    layout:",
                "      - api: API Reference",
                "        specs:",
                "          - type: openapi",
                "            path: openapi/openapi.yml",
                "tabs:",
                "  api-reference:",
                "    display-name: API Reference",
                ""
            ].join("\n")
        );

        const { project, errorSpy } = await load(fernDirectory);

        expect(project.apiWorkspaces).toEqual([]);
        expect(project.docsWorkspaces).toBeDefined();
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("still reports an unreferenced asyncapi/ directory even when openapi/ is referenced by docs.yml", async () => {
        const fernDirectory = await createFernDirectory(
            [
                "instances:",
                "  - url: plants.docs.buildwithfern.com",
                "navigation:",
                "  - api: API Reference",
                "    specs:",
                "      - type: openapi",
                "        path: openapi/openapi.yml",
                ""
            ].join("\n")
        );
        await mkdir(path.join(fernDirectory, "asyncapi"));
        await writeFile(path.join(fernDirectory, "asyncapi", "asyncapi.yml"), "asyncapi: 2.6.0\n");

        const { errorSpy } = await load(fernDirectory);

        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("No API definition found"));
    });

    it("still reports the misconfigured openapi/ directory when docs.yml has no inline specs", async () => {
        const fernDirectory = await createFernDirectory(
            ["instances:", "  - url: plants.docs.buildwithfern.com", "navigation:", "  - api: API Reference", ""].join(
                "\n"
            )
        );

        const { project, errorSpy } = await load(fernDirectory);

        expect(project.apiWorkspaces).toEqual([]);
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("No API definition found"));
    });
});
