import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
    applyTranslatedApiNavigationTitlesInObject,
    getMissingEndpointKeys,
    getNonDefaultTranslationLocales,
    getTranslatedApiWorkspacePath,
    registerTranslatedApiOverrides,
    replaceApiDefinitionIdsInObject
} from "../translatedApiOverrides.js";

describe("translated API overrides", () => {
    let tmpDirs: string[] = [];

    afterEach(async () => {
        await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
        tmpDirs = [];
    });

    it("returns non-default translation locales", () => {
        expect(getNonDefaultTranslationLocales(["en", "zh", "ja"])).toEqual(["zh", "ja"]);
        expect(
            getNonDefaultTranslationLocales([{ lang: "zh", default: true }, { lang: "en" }, { lang: "ja" }])
        ).toEqual(["en", "ja"]);
    });

    it("detects translated API workspaces in supported locations", async () => {
        const root = await mkdtemp(join(tmpdir(), "fern-translated-api-"));
        tmpDirs.push(root);

        const directApi = join(root, "translations", "zh", "apis", "Plant Store API");
        await mkdir(directApi, { recursive: true });
        await writeFile(join(directApi, "generators.yml"), "api:\n  specs: []\n");

        const nestedApi = join(root, "translations", "ja", "fern", "apis", "Plant Store API", "definition");
        await mkdir(nestedApi, { recursive: true });

        const docsWorkspace = { absoluteFilePath: AbsoluteFilePath.of(root) };

        await expect(
            getTranslatedApiWorkspacePath({
                docsWorkspace,
                locale: "zh",
                apiName: "Plant Store API"
            })
        ).resolves.toBe(directApi);
        await expect(
            getTranslatedApiWorkspacePath({
                docsWorkspace,
                locale: "ja",
                apiName: "Plant Store API"
            })
        ).resolves.toBe(join(root, "translations", "ja", "fern", "apis", "Plant Store API"));
    });

    it("detects a default translated API workspace directly under the locale for single-API docs", async () => {
        const root = await mkdtemp(join(tmpdir(), "fern-translated-api-default-"));
        tmpDirs.push(root);

        const localeDir = join(root, "translations", "zh");
        await mkdir(localeDir, { recursive: true });
        await writeFile(join(localeDir, "generators.yml"), "api:\n  specs:\n    - openapi: openapi.json\n");

        await expect(
            getTranslatedApiWorkspacePath({
                docsWorkspace: { absoluteFilePath: AbsoluteFilePath.of(root) },
                locale: "zh",
                apiName: "Default API",
                allowDefaultApiOverride: true
            })
        ).resolves.toBe(localeDir);

        await expect(
            getTranslatedApiWorkspacePath({
                docsWorkspace: { absoluteFilePath: AbsoluteFilePath.of(root) },
                locale: "zh",
                apiName: "Default API"
            })
        ).resolves.toBeUndefined();
    });

    it("recursively replaces API definition IDs without changing unrelated IDs", () => {
        const translatedRoot = replaceApiDefinitionIdsInObject(
            {
                type: "root",
                child: {
                    apiDefinitionId: "base-api-definition-id",
                    nested: [{ apiDefinitionId: "other-api-definition-id" }, { endpointId: "base-api-definition-id" }]
                }
            },
            new Map([["base-api-definition-id", "translated-api-definition-id"]])
        );

        expect(translatedRoot).toEqual({
            type: "root",
            child: {
                apiDefinitionId: "translated-api-definition-id",
                nested: [{ apiDefinitionId: "other-api-definition-id" }, { endpointId: "base-api-definition-id" }]
            }
        });
    });

    it("recursively applies translated endpoint navigation titles", () => {
        const translatedRoot = applyTranslatedApiNavigationTitlesInObject(
            {
                type: "root",
                children: [
                    {
                        type: "endpoint",
                        apiDefinitionId: "base-api-definition-id",
                        endpointId: "endpoint_addPlant",
                        title: "Add a new plant to the store"
                    },
                    {
                        type: "endpoint",
                        apiDefinitionId: "other-api-definition-id",
                        endpointId: "endpoint_addPlant",
                        title: "Add a new plant to the store"
                    }
                ]
            },
            new Map([
                [
                    "base-api-definition-id",
                    {
                        endpointTitlesById: new Map([["endpoint_addPlant", "添加一株新的植物"]])
                    }
                ]
            ])
        );

        expect(translatedRoot).toEqual({
            type: "root",
            children: [
                {
                    type: "endpoint",
                    apiDefinitionId: "base-api-definition-id",
                    endpointId: "endpoint_addPlant",
                    title: "添加一株新的植物"
                },
                {
                    type: "endpoint",
                    apiDefinitionId: "other-api-definition-id",
                    endpointId: "endpoint_addPlant",
                    title: "Add a new plant to the store"
                }
            ]
        });
    });

    it("detects endpoints missing from a translated API", () => {
        expect(
            getMissingEndpointKeys({
                baseEndpointKeys: ["GET /plants", "POST /plants", "PUT /plants/{plantId}"],
                translatedEndpointKeys: ["GET /plants"]
            })
        ).toEqual(["POST /plants", "PUT /plants/{plantId}"]);
    });

    it("loads and registers a translated OpenAPI workspace", async () => {
        const root = await mkdtemp(join(tmpdir(), "fern-translated-api-register-"));
        tmpDirs.push(root);

        const translatedApi = join(root, "translations", "zh", "apis", "Plant Store API");
        await mkdir(translatedApi, { recursive: true });
        await writeFile(join(translatedApi, "generators.yml"), "api:\n  specs:\n    - openapi: openapi.yaml\n");
        await writeFile(
            join(translatedApi, "openapi.yaml"),
            [
                "openapi: 3.1.0",
                "info:",
                "  title: Translated Plant Store API",
                "  version: 1.0.0",
                "paths:",
                "  /plants:",
                "    get:",
                "      operationId: listPlantsZh",
                "      responses:",
                "        '200':",
                "          description: OK"
            ].join("\n")
        );

        const registerCalls: unknown[] = [];
        const translatedIds = await registerTranslatedApiOverrides({
            docsWorkspace: {
                type: "docs",
                workspaceName: undefined,
                absoluteFilePath: AbsoluteFilePath.of(root),
                absoluteFilepathToDocsConfig: AbsoluteFilePath.of(join(root, "docs.yml")),
                config: {
                    instances: [],
                    navigation: [],
                    translations: ["en", "zh"]
                }
            },
            cliVersion: "*",
            context: createMockTaskContext(),
            registeredApiIdsByName: new Map([["Plant Store API", "base-api-definition-id"]]),
            registeredApiConfigsByName: new Map([["Plant Store API", { snippetsConfig: {} }]]),
            registerApiDefinition: async (opts) => {
                registerCalls.push(opts);
                return "translated-api-definition-id";
            }
        });

        expect(translatedIds.get("zh")?.get("base-api-definition-id")).toBe("translated-api-definition-id");
        expect(registerCalls).toHaveLength(1);
        expect(registerCalls[0]).toMatchObject({
            apiName: "Plant Store API",
            snippetsConfig: {},
            trackAsBaseApi: false
        });
    });

    it("warns when a translated OpenAPI workspace is missing default API endpoints", async () => {
        const root = await mkdtemp(join(tmpdir(), "fern-translated-api-missing-endpoints-"));
        tmpDirs.push(root);

        const translatedApi = join(root, "translations", "zh", "apis", "Plant Store API");
        await mkdir(translatedApi, { recursive: true });
        await writeFile(join(translatedApi, "generators.yml"), "api:\n  specs:\n    - openapi: openapi.yaml\n");
        await writeFile(
            join(translatedApi, "openapi.yaml"),
            [
                "openapi: 3.1.0",
                "info:",
                "  title: Translated Plant Store API",
                "  version: 1.0.0",
                "paths:",
                "  /plants:",
                "    get:",
                "      operationId: listPlants",
                "      responses:",
                "        '200':",
                "          description: OK"
            ].join("\n")
        );

        const logger = {
            disable: vi.fn(),
            enable: vi.fn(),
            trace: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            log: vi.fn()
        };

        await registerTranslatedApiOverrides({
            docsWorkspace: {
                type: "docs",
                workspaceName: undefined,
                absoluteFilePath: AbsoluteFilePath.of(root),
                absoluteFilepathToDocsConfig: AbsoluteFilePath.of(join(root, "docs.yml")),
                config: {
                    instances: [],
                    navigation: [],
                    translations: ["en", "zh"]
                }
            },
            cliVersion: "*",
            context: createMockTaskContext({ logger }),
            registeredApiIdsByName: new Map([["Plant Store API", "base-api-definition-id"]]),
            registeredApiConfigsByName: new Map([
                [
                    "Plant Store API",
                    {
                        snippetsConfig: {},
                        endpointKeys: ["GET /plants", "PUT /plants"]
                    }
                ]
            ]),
            registerApiDefinition: async () => "translated-api-definition-id"
        });

        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("PUT /plants"));
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("missing 1 endpoint"));
    });
});
