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

    function initialize(openApi?: string, taskContext = createMockTaskContext(), useSdkConfig = true): Promise<void> {
        return initializeDocs({ organization: "acme", versionOfCli: "0.0.0", taskContext, openApi, useSdkConfig });
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

    it("references a spec that already lives in fern/ instead of copying it", async () => {
        const fernDirectory = await createFernDirectory();
        const specInFern = path.join(fernDirectory, "openapi.json");
        await writeFile(specInFern, JSON.stringify(MINIMAL_OPENAPI));

        await initialize(specInFern);

        expect(await readDocsYml()).toMatchObject({
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./openapi.json" }] }]
        });
        expect(await existsInProject("fern", "openapi-1.json")).toBe(false);
    });

    it("does not list a spec twice when the docs already reference it", async () => {
        const fernDirectory = await createFernDirectory();
        const specInFern = path.join(fernDirectory, "openapi.json");
        await writeFile(specInFern, JSON.stringify(MINIMAL_OPENAPI));
        await initialize(specInFern);

        await initialize(specInFern);

        expect(await readDocsYml()).toMatchObject({
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./openapi.json" }] }]
        });
    });

    it("references a spec in a folder whose name starts with two dots", async () => {
        const fernDirectory = await createFernDirectory();
        await mkdir(path.join(fernDirectory, "..specs"));
        const specInFolder = path.join(fernDirectory, "..specs", "openapi.json");
        await writeFile(specInFolder, JSON.stringify(MINIMAL_OPENAPI));

        await initialize(specInFolder);

        expect(await readDocsYml()).toMatchObject({
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./..specs/openapi.json" }] }]
        });
        expect(await existsInProject("fern", "openapi.json")).toBe(false);
    });

    it("only says it added a spec to an existing docs.yml when it did", async () => {
        const fernDirectory = await createFernDirectory();
        const specInFern = path.join(fernDirectory, "openapi.json");
        await writeFile(specInFern, JSON.stringify(MINIMAL_OPENAPI));
        await initialize(specInFern);
        const messages: string[] = [];
        const logger = createLogger((level, ...args) => {
            if (level === LogLevel.Info) {
                messages.push(args.join(" "));
            }
        });

        await initialize(specInFern, createMockTaskContext({ logger }));

        expect(messages.join("\n")).toContain("Docs configuration already exists");
        expect(messages.join("\n")).not.toContain("Added the OpenAPI spec");
    });

    it("warns and changes nothing when an existing docs.yml cannot be parsed", async () => {
        await initialize();
        const docsYmlPath = path.join(projectDirectory, "fern", "docs.yml");
        await writeFile(docsYmlPath, "navigation: [unclosed");
        const warnings: string[] = [];
        const logger = createLogger((level, ...args) => {
            if (level === LogLevel.Warn) {
                warnings.push(args.join(" "));
            }
        });

        await initialize(await writeSpec(), createMockTaskContext({ logger }));

        expect(await readFile(docsYmlPath, "utf8")).toBe("navigation: [unclosed");
        expect(warnings.join("\n")).toContain("could not be parsed");
    });

    it("keeps the welcome page and no api entry when no spec is given", async () => {
        await initialize();

        expect(await readDocsYml()).toMatchObject({ navigation: [{ page: "Welcome", path: "pages/welcome.mdx" }] });
        expect(await existsInProject("fern", "pages", "welcome.mdx")).toBe(true);
    });

    it("adds each spec to an existing docs.yml as an api entry of its own", async () => {
        await initialize();

        await initialize(await writeSpec());
        await initialize(await writeSpec());

        expect(await readDocsYml()).toMatchObject({
            navigation: [
                { page: "Welcome", path: "pages/welcome.mdx" },
                { api: "API Reference", paginated: true, specs: [{ type: "openapi", path: "./openapi.json" }] },
                { api: "API Reference 2", paginated: true, specs: [{ type: "openapi", path: "./openapi-1.json" }] }
            ]
        });
    });

    it("ignores --openapi when SDK Config init is off", async () => {
        await initialize(await writeSpec(), createMockTaskContext(), false);

        expect(await readDocsYml()).toMatchObject({ navigation: [{ page: "Welcome", path: "pages/welcome.mdx" }] });
        expect(await existsInProject("fern", "openapi.json")).toBe(false);
    });

    it("does not validate or download a spec when SDK Config init is off", async () => {
        await initialize("./missing.json", createMockTaskContext(), false);

        expect(loadOpenAPIFromUrl).not.toHaveBeenCalled();
    });

    it("does not warn about an ignored spec when SDK Config init is off and docs.yml already exists", async () => {
        await initialize();
        const warnings: string[] = [];
        const logger = createLogger((level, ...args) => {
            if (level === LogLevel.Warn) {
                warnings.push(args.join(" "));
            }
        });

        await initialize(await writeSpec(), createMockTaskContext({ logger }), false);

        expect(warnings).toEqual([]);
    });

    it("warns and changes nothing when the navigation of an existing docs.yml uses tabs", async () => {
        await initialize();
        const docsYmlPath = path.join(projectDirectory, "fern", "docs.yml");
        const docsYmlWithTabs = "navigation:\n  - tab: docs\n    layout:\n      - page: Welcome\n        path: w.mdx\n";
        await writeFile(docsYmlPath, docsYmlWithTabs);
        const warnings: string[] = [];
        const logger = createLogger((level, ...args) => {
            if (level === LogLevel.Warn) {
                warnings.push(args.join(" "));
            }
        });

        await initialize(await writeSpec(), createMockTaskContext({ logger }));

        expect(await readFile(docsYmlPath, "utf8")).toBe(docsYmlWithTabs);
        expect(await existsInProject("fern", "openapi.json")).toBe(false);
        expect(warnings.join("\n")).toContain("The OpenAPI spec was not added");
    });

    async function createSdkConfigApi({
        directory,
        specs = [{ path: "./openapi.json" }]
    }: {
        directory: string;
        specs?: Array<{ path?: string; url?: string; type?: string }>;
    }): Promise<void> {
        await mkdir(directory, { recursive: true });
        await writeFile(path.join(directory, "openapi.json"), JSON.stringify(MINIMAL_OPENAPI));
        await writeFile(
            path.join(directory, "sdk-config.yml"),
            yaml.dump({
                schemaVersion: "sdk-config/v1",
                sdkName: path.basename(directory),
                source: { specs: specs.map((spec, index) => ({ id: `spec${index}`, type: "openapi", ...spec })) }
            })
        );
    }

    describe("existing SDK Config APIs", () => {
        it("gives each API in fern/apis an api entry that declares its spec", async () => {
            const fernDirectory = await createFernDirectory();
            await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", "api") });
            await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", "api1") });

            await initialize();

            expect(await readDocsYml()).toMatchObject({
                navigation: [
                    {
                        api: "API Reference",
                        paginated: true,
                        specs: [{ type: "openapi", path: "./apis/api/openapi.json" }]
                    },
                    {
                        api: "API Reference 2",
                        paginated: true,
                        specs: [{ type: "openapi", path: "./apis/api1/openapi.json" }]
                    }
                ]
            });
            expect(await existsInProject("fern", "pages", "welcome.mdx")).toBe(false);
        });

        it("orders the apis by number, not as text", async () => {
            const fernDirectory = await createFernDirectory();
            for (const name of ["api", "api1", "api2", "api10"]) {
                await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", name) });
            }

            await initialize();

            const docsConfig = (await readDocsYml()) as { navigation: Array<{ specs: Array<{ path: string }> }> };
            expect(docsConfig.navigation.map((item) => item.specs[0]?.path)).toEqual([
                "./apis/api/openapi.json",
                "./apis/api1/openapi.json",
                "./apis/api2/openapi.json",
                "./apis/api10/openapi.json"
            ]);
        });

        it("does not warn that the API definition is empty", async () => {
            const fernDirectory = await createFernDirectory();
            await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", "api") });
            await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", "api1") });
            const warnings: string[] = [];
            const logger = createLogger((level, ...args) => {
                if (level === LogLevel.Warn) {
                    warnings.push(args.join(" "));
                }
            });

            await initialize(undefined, createMockTaskContext({ logger }));

            expect(warnings).toEqual([]);
        });

        it("finds the API of a fern directory that has no apis folder", async () => {
            const fernDirectory = await createFernDirectory();
            await createSdkConfigApi({ directory: fernDirectory });

            await initialize();

            expect(await readDocsYml()).toMatchObject({
                navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./openapi.json" }] }]
            });
        });

        it("puts the specs of one API on one api entry", async () => {
            const fernDirectory = await createFernDirectory();
            const directory = path.join(fernDirectory, "apis", "api");
            await createSdkConfigApi({ directory, specs: [{ path: "./openapi.json" }, { path: "./second.json" }] });
            await writeFile(path.join(directory, "second.json"), JSON.stringify(MINIMAL_OPENAPI));

            await initialize();

            expect(await readDocsYml()).toMatchObject({
                navigation: [
                    {
                        api: "API Reference",
                        specs: [
                            { type: "openapi", path: "./apis/api/openapi.json" },
                            { type: "openapi", path: "./apis/api/second.json" }
                        ]
                    }
                ]
            });
        });

        it("leaves out a spec that is a URL or a missing file, and falls back to the welcome page when none is left", async () => {
            const fernDirectory = await createFernDirectory();
            await createSdkConfigApi({
                directory: path.join(fernDirectory, "apis", "api"),
                specs: [{ url: "https://example.com/openapi.json" }]
            });
            await createSdkConfigApi({
                directory: path.join(fernDirectory, "apis", "api1"),
                specs: [{ path: "./missing.json" }]
            });

            await initialize();

            expect(await readDocsYml()).toMatchObject({ navigation: [{ page: "Welcome", path: "pages/welcome.mdx" }] });
        });

        it("is not stopped by an sdk-config.yml that cannot be parsed", async () => {
            const fernDirectory = await createFernDirectory();
            await mkdir(path.join(fernDirectory, "apis", "api"), { recursive: true });
            await writeFile(path.join(fernDirectory, "apis", "api", "sdk-config.yml"), "source: [unclosed");
            await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", "api1") });

            await initialize();

            expect(await readDocsYml()).toMatchObject({
                navigation: [{ api: "API Reference", specs: [{ path: "./apis/api1/openapi.json" }] }]
            });
        });

        it("does not list the spec of an API that was just created twice", async () => {
            const fernDirectory = await createFernDirectory();
            await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", "api") });
            await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", "api1") });

            await initialize(path.join(fernDirectory, "apis", "api1", "openapi.json"));

            expect(await readDocsYml()).toMatchObject({
                navigation: [
                    { api: "API Reference", specs: [{ path: "./apis/api/openapi.json" }] },
                    { api: "API Reference 2", specs: [{ path: "./apis/api1/openapi.json" }] }
                ]
            });
        });

        it("adds the spec of a newly created API as its own api entry to an existing docs.yml", async () => {
            const fernDirectory = await createFernDirectory();
            await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", "api") });
            await initialize();
            await createSdkConfigApi({ directory: path.join(fernDirectory, "apis", "api1") });

            await initialize(path.join(fernDirectory, "apis", "api1", "openapi.json"));

            expect(await readDocsYml()).toMatchObject({
                navigation: [
                    {
                        api: "API Reference",
                        paginated: true,
                        specs: [{ type: "openapi", path: "./apis/api/openapi.json" }]
                    },
                    {
                        api: "API Reference 2",
                        paginated: true,
                        specs: [{ type: "openapi", path: "./apis/api1/openapi.json" }]
                    }
                ]
            });
        });
    });
});
