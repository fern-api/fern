import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertIrToFdrApi } from "@fern-api/register";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, describe, expect, it } from "vitest";
import {
    applyTranslatedApiNavigationTitlesInObject,
    type RegisterApiDefinitionOptions,
    registerTranslatedApiOverrides,
    replaceApiDefinitionIdsInObject,
    type TranslatedApiNavigationTitleOverridesByLocale
} from "../translatedApiOverrides.js";

type RegisteredApi = {
    apiDefinitionId: string;
    apiName: string;
    definition: unknown;
};

describe("translated OpenAPI publish path e2e", () => {
    let tmpDirs: string[] = [];

    afterEach(async () => {
        await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
        tmpDirs = [];
    });

    it("uploads a translated OpenAPI JSON and embeds that API definition in fdr_zh.json", async () => {
        const fernDir = await createTranslatedOpenApiProject();
        tmpDirs.push(fernDir);

        const context = createMockTaskContext();
        const fakeFdr = createFakeFdr(context);
        const translatedApiNavigationTitleOverridesByLocale: TranslatedApiNavigationTitleOverridesByLocale = new Map();

        const translatedApiIdsByLocale = await registerTranslatedApiOverrides({
            docsWorkspace: {
                type: "docs",
                workspaceName: undefined,
                absoluteFilePath: AbsoluteFilePath.of(fernDir),
                absoluteFilepathToDocsConfig: AbsoluteFilePath.of(join(fernDir, "docs.yml")),
                config: {
                    instances: [{ url: "translated-openapi.docs.dev.buildwithfern.com" }],
                    navigation: [],
                    translations: [{ lang: "en", default: true }, { lang: "zh" }]
                }
            },
            cliVersion: "*",
            context,
            registeredApiIdsByName: new Map([["Plant Store API", "api-definition-base"]]),
            registeredApiConfigsByName: new Map([["Plant Store API", { snippetsConfig: {} }]]),
            registerApiDefinition: fakeFdr.registerApiDefinition,
            translatedApiNavigationTitleOverridesByLocale
        });

        const zhApiId = translatedApiIdsByLocale.get("zh")?.get("api-definition-base");
        expect(zhApiId).toBe("api-definition-translated-zh");
        const zhTitleOverrides = translatedApiNavigationTitleOverridesByLocale.get("zh");
        const translatedEndpointId = Array.from(
            zhTitleOverrides?.get("api-definition-base")?.endpointTitlesById.keys() ?? []
        )[0];
        expect(translatedEndpointId).toBeDefined();

        const baseRoot = {
            type: "root",
            child: {
                type: "apiReference",
                apiDefinitionId: "api-definition-base",
                children: [
                    {
                        type: "endpoint",
                        apiDefinitionId: "api-definition-base",
                        endpointId: translatedEndpointId,
                        title: "List plants"
                    }
                ]
            }
        };

        const translatedRootWithTitles = applyTranslatedApiNavigationTitlesInObject(
            baseRoot,
            translatedApiNavigationTitleOverridesByLocale.get("zh") ?? new Map()
        );
        const translatedRoot = replaceApiDefinitionIdsInObject(
            translatedRootWithTitles,
            translatedApiIdsByLocale.get("zh") ?? new Map()
        );
        const fdrZhJson = fakeFdr.writeTranslation({
            locale: "zh",
            docsDefinition: {
                apis: {},
                apiNameToId: {},
                config: {
                    root: translatedRoot
                }
            }
        });

        expect(fakeFdr.registeredApis).toHaveLength(1);
        expect(JSON.stringify(fakeFdr.registeredApis[0]?.definition)).toContain("列出植物");
        expect(JSON.stringify(fakeFdr.registeredApis[0]?.definition)).toContain("返回本地化的植物列表");
        expect(JSON.stringify(fdrZhJson.config.root)).toContain("api-definition-translated-zh");
        expect(JSON.stringify(fdrZhJson.config.root)).toContain("列出植物");
        expect(JSON.stringify(fdrZhJson.config.root)).not.toContain("List plants");
        expect(fdrZhJson.apis["api-definition-translated-zh"]).toBeDefined();
        expect(JSON.stringify(fdrZhJson.apis["api-definition-translated-zh"])).toContain("返回本地化的植物列表");
        expect(fdrZhJson.apiNameToId["Plant Store API"]).toBe("api-definition-translated-zh");
        expect(JSON.stringify(fdrZhJson)).not.toContain("api-definition-base");
    });
});

function createFakeFdr(context: ReturnType<typeof createMockTaskContext>): {
    registeredApis: RegisteredApi[];
    registerApiDefinition: (opts: RegisterApiDefinitionOptions) => Promise<string>;
    writeTranslation: (input: {
        locale: string;
        docsDefinition: {
            apis: Record<string, unknown>;
            apiNameToId: Record<string, string>;
            config: { root: unknown };
        };
    }) => {
        apis: Record<string, unknown>;
        apiNameToId: Record<string, string>;
        config: { root: unknown };
    };
} {
    const registeredApis: RegisteredApi[] = [];

    return {
        registeredApis,
        registerApiDefinition: async (opts) => {
            const apiDefinitionId = "api-definition-translated-zh";
            registeredApis.push({
                apiDefinitionId,
                apiName: opts.apiName ?? "Plant Store API",
                definition: convertIrToFdrApi({
                    ir: opts.ir,
                    snippetsConfig: opts.snippetsConfig,
                    playgroundConfig: opts.playgroundConfig,
                    graphqlOperations: opts.graphqlOperations,
                    graphqlTypes: opts.graphqlTypes,
                    context,
                    apiNameOverride: opts.apiName
                })
            });
            return apiDefinitionId;
        },
        writeTranslation: ({ docsDefinition }) => {
            const apiIds = collectApiDefinitionIds(docsDefinition.config.root);
            return {
                ...docsDefinition,
                apis: {
                    ...docsDefinition.apis,
                    ...Object.fromEntries(
                        apiIds.flatMap((apiId) => {
                            const api = registeredApis.find((registeredApi) => registeredApi.apiDefinitionId === apiId);
                            return api == null ? [] : [[apiId, api.definition]];
                        })
                    )
                },
                apiNameToId: {
                    ...docsDefinition.apiNameToId,
                    ...Object.fromEntries(
                        apiIds.flatMap((apiId) => {
                            const api = registeredApis.find((registeredApi) => registeredApi.apiDefinitionId === apiId);
                            return api == null ? [] : [[api.apiName, apiId]];
                        })
                    )
                }
            };
        }
    };
}

async function createTranslatedOpenApiProject(): Promise<string> {
    const fernDir = await mkdtemp(join(tmpdir(), "fern-publish-translated-openapi-"));
    await mkdir(join(fernDir, "translations", "zh", "apis", "Plant Store API"), { recursive: true });

    await writeFile(
        join(fernDir, "translations", "zh", "apis", "Plant Store API", "generators.yml"),
        "api:\n  specs:\n    - openapi: openapi.json\n"
    );
    await writeFile(
        join(fernDir, "translations", "zh", "apis", "Plant Store API", "openapi.json"),
        JSON.stringify(
            {
                openapi: "3.1.0",
                info: {
                    title: "Plant Store API",
                    version: "1.0.0"
                },
                paths: {
                    "/plants": {
                        get: {
                            operationId: "listPlants",
                            summary: "列出植物",
                            description: "返回本地化的植物列表",
                            responses: {
                                "200": {
                                    description: "返回本地化的植物列表",
                                    content: {
                                        "application/json": {
                                            schema: {
                                                type: "object",
                                                properties: {
                                                    message: {
                                                        type: "string",
                                                        description: "本地化消息"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            null,
            2
        )
    );

    return fernDir;
}

function collectApiDefinitionIds(value: unknown): string[] {
    const ids = new Set<string>();
    const visit = (current: unknown) => {
        if (Array.isArray(current)) {
            current.forEach(visit);
            return;
        }
        if (current != null && typeof current === "object") {
            for (const [key, child] of Object.entries(current)) {
                if (key === "apiDefinitionId" && typeof child === "string") {
                    ids.add(child);
                }
                visit(child);
            }
        }
    };
    visit(value);
    return Array.from(ids);
}
