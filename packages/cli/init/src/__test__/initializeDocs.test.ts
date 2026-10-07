import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initializeDocs } from "../initializeDocs.js";
import { LoadOpenAPIStatus, loadOpenAPIFromUrl } from "../utils/loadOpenApiFromUrl.js";

vi.mock("../utils/loadOpenApiFromUrl.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../utils/loadOpenApiFromUrl.js")>()),
    loadOpenAPIFromUrl: vi.fn()
}));

const MINIMAL_OPENAPI = {
    openapi: "3.0.0",
    info: { title: "Pets", version: "1.0.0" },
    paths: {
        "/pets": {
            get: { operationId: "listPets", responses: { "200": { description: "ok" } } }
        }
    }
};

describe("initializeDocs", () => {
    const originalCwd = process.cwd();
    const originalDomainSuffix = process.env.DOCS_DOMAIN_SUFFIX;
    const temporaryDirectories: string[] = [];
    let projectDirectory: string;

    beforeEach(async () => {
        projectDirectory = await createTemporaryDirectory();
        process.chdir(projectDirectory);
        process.env.DOCS_DOMAIN_SUFFIX = "docs.example.com";
    });

    afterEach(async () => {
        vi.resetAllMocks();
        process.chdir(originalCwd);
        if (originalDomainSuffix == null) {
            delete process.env.DOCS_DOMAIN_SUFFIX;
        } else {
            process.env.DOCS_DOMAIN_SUFFIX = originalDomainSuffix;
        }
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    });

    async function createTemporaryDirectory(): Promise<string> {
        const directory = await realpath(await mkdtemp(path.join(tmpdir(), "fern-init-docs-")));
        temporaryDirectories.push(directory);
        return directory;
    }

    async function writeSpec(): Promise<string> {
        const specPath = path.join(await createTemporaryDirectory(), "petstore.json");
        await writeFile(specPath, JSON.stringify(MINIMAL_OPENAPI));
        return specPath;
    }

    function existsInProject(...segments: string[]): Promise<boolean> {
        return doesPathExist(AbsoluteFilePath.of(path.join(projectDirectory, ...segments)));
    }

    async function readDocsYml(): Promise<unknown> {
        return yaml.load(await readFile(path.join(projectDirectory, "fern", "docs.yml"), "utf8"));
    }

    function initialize(openApi?: string, taskContext = createMockTaskContext()): Promise<void> {
        return initializeDocs({ organization: "acme", versionOfCli: "0.0.0", taskContext, openApi });
    }

    it("copies the spec into fern/ and declares it under the api entry in docs.yml", async () => {
        await initialize(await writeSpec());

        expect(await readDocsYml()).toMatchObject({
            navigation: [
                { api: "API Reference", paginated: true, specs: [{ type: "openapi", path: "./openapi.json" }] }
            ]
        });
        const copiedSpec = JSON.parse(await readFile(path.join(projectDirectory, "fern", "openapi.json"), "utf8"));
        expect(copiedSpec.paths["/pets"].get.operationId).toBe("listPets");
        // The API reference is the whole navigation, so there is no placeholder welcome page.
        expect(await existsInProject("fern", "pages", "welcome.mdx")).toBe(false);
    });

    it("downloads a spec given as a URL", async () => {
        const downloadedSpec = await writeSpec();
        vi.mocked(loadOpenAPIFromUrl).mockResolvedValue({
            status: LoadOpenAPIStatus.Success,
            filePath: downloadedSpec
        });

        await initialize("https://example.com/openapi.json");

        expect(loadOpenAPIFromUrl).toHaveBeenCalledWith(
            expect.objectContaining({ url: "https://example.com/openapi.json" })
        );
        expect(await readDocsYml()).toMatchObject({
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./openapi.json" }] }]
        });
    });

    it("fails before creating anything when the spec does not exist", async () => {
        await expect(initialize("./missing.json")).rejects.toBeDefined();

        expect(await existsInProject("fern")).toBe(false);
    });

    async function createFernDirectory(): Promise<string> {
        const fernDirectory = path.join(projectDirectory, "fern");
        await mkdir(fernDirectory, { recursive: true });
        await writeFile(
            path.join(fernDirectory, "fern.config.json"),
            JSON.stringify({ organization: "acme", version: "0.0.0" })
        );
        return fernDirectory;
    }

    it("leaves an existing API's spec alone and writes the new spec under the next free name", async () => {
        const fernDirectory = await createFernDirectory();
        await writeFile(path.join(fernDirectory, "sdk-config.yml"), "sdkName: api\n");
        await writeFile(path.join(fernDirectory, "openapi.json"), "{}");

        await initialize(await writeSpec());

        // sdk-config.yml still points at openapi.json, so that file must be exactly as it was.
        expect(await readFile(path.join(fernDirectory, "openapi.json"), "utf8")).toBe("{}");
        const newSpec = JSON.parse(await readFile(path.join(fernDirectory, "openapi-1.json"), "utf8"));
        expect(newSpec.paths["/pets"].get.operationId).toBe("listPets");
        expect(await readDocsYml()).toMatchObject({
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./openapi-1.json" }] }]
        });
    });

    it("keeps counting up when earlier copies are taken too", async () => {
        const fernDirectory = await createFernDirectory();
        await writeFile(path.join(fernDirectory, "openapi.json"), "{}");
        await writeFile(path.join(fernDirectory, "openapi-1.json"), "{}");

        await initialize(await writeSpec());

        expect(await existsInProject("fern", "openapi-2.json")).toBe(true);
        expect(await readDocsYml()).toMatchObject({
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./openapi-2.json" }] }]
        });
    });

    it("keeps the welcome page and no api entry when no spec is given", async () => {
        await initialize();

        expect(await readDocsYml()).toMatchObject({ navigation: [{ page: "Welcome", path: "pages/welcome.mdx" }] });
        expect(await existsInProject("fern", "pages", "welcome.mdx")).toBe(true);
    });

    it("warns and leaves docs.yml alone when docs.yml already exists", async () => {
        await initialize();
        const docsYmlBefore = await readFile(path.join(projectDirectory, "fern", "docs.yml"), "utf8");
        const warnings: string[] = [];
        const logger = createLogger((level, ...args) => {
            if (level === LogLevel.Warn) {
                warnings.push(args.join(" "));
            }
        });

        await initialize(await writeSpec(), createMockTaskContext({ logger }));

        expect(await readFile(path.join(projectDirectory, "fern", "docs.yml"), "utf8")).toBe(docsYmlBefore);
        expect(await existsInProject("fern", "openapi.json")).toBe(false);
        expect(warnings.join("\n")).toContain("The OpenAPI spec was not added");
    });
});
