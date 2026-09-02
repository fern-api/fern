import type { AbstractAPIWorkspace, FernDefinition, FernWorkspace, Spec } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { FernConfigMappingError } from "@postman/sdk-config/sdk-config/v1";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { loadCompatibleMigrationGroups } from "../loadCompatibleMigrationGroups.js";
import { mapFernDefinitionToSdkConfigApi, mapFernGroupToSdkConfig } from "../mapFernGroupToSdkConfig.js";
import {
    type ResolvedMigrationSourceSpec,
    resolveMigrationSourceSpecs,
    serializeMigrationSource
} from "../projectMigrationSource.js";
import { selectMigrationTarget } from "../selectMigrationTarget.js";
import { writeOutputFile } from "../writeOutputFile.js";

describe("SDK Config migration", () => {
    let temporaryDirectory: string;

    beforeEach(async () => {
        temporaryDirectory = await mkdtemp(join(tmpdir(), "fern-sdk-migrate-"));
    });

    afterEach(async () => {
        await rm(temporaryDirectory, { force: true, recursive: true });
    });

    it("maps a resolved generator group without reparsing Fern configuration", () => {
        const result = mapFernGroupToSdkConfig({
            fernWorkspace: { definition: createDefinition() },
            group: createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]),
            source: createSource()
        });

        expect(result.sdkConfig).toMatchObject({
            schemaVersion: "sdk-config/v1",
            api: {
                audiences: [],
                baseUrl: "https://api.example.com",
                defaultEnvironment: "Production",
                environments: [
                    {
                        name: "Production",
                        urls: [{ name: "default", url: "https://api.example.com" }]
                    }
                ],
                headers: [{ name: "apiVersion", environmentVariable: "API_VERSION" }]
            },
            targets: [
                {
                    generatorVersion: "3.63.3",
                    language: "typescript",
                    output: { delivery: "zip" }
                }
            ]
        });
        expect(result.sdkConfig.sdkVersion).toBeUndefined();
        expect(result.sdkConfig.apiVersion).toBeUndefined();
        expect(result.sdkConfig.client).toEqual({});
        expect(result.sdkConfig.generation).toEqual({});
    });

    it("maps endpoint-specific header authentication", () => {
        const definition = createDefinition();
        definition.rootApiFile.contents.auth = { "endpoint-security": {} };
        definition.rootApiFile.contents["auth-schemes"] = {
            ApiKeyAuth: {
                header: "x-api-key",
                name: "apiKey",
                env: "AIRWEAVE_API_KEY",
                docs: "API key authentication"
            }
        };

        const result = mapFernDefinitionToSdkConfigApi(definition);

        expect(result.diagnostics).toEqual([]);
        expect(result.api.auth).toEqual({
            endpointSecurity: true,
            schemes: [
                {
                    id: "ApiKeyAuth",
                    type: "api-key",
                    location: "header",
                    name: "x-api-key",
                    environmentVariable: "AIRWEAVE_API_KEY",
                    description: "API key authentication"
                }
            ]
        });
    });

    it("hoists API import settings shared by every source spec", () => {
        const settings = {
            titleAsSchemaName: true,
            objectQueryParameters: false,
            typeDatesAsStrings: true
        };

        const source = serializeMigrationSource({
            specs: [createResolvedSourceSpec("accounting", settings), createResolvedSourceSpec("ats", settings)],
            workingDirectory: "/tmp"
        });

        expect(source.apiImportSettings).toEqual(settings);
        expect(source.specs.map((spec) => spec.apiImportSettings)).toEqual([undefined, undefined]);
    });

    it("keeps differing and omitted API import settings on their source specs", () => {
        const source = serializeMigrationSource({
            specs: [
                createResolvedSourceSpec("accounting", {
                    titleAsSchemaName: true,
                    objectQueryParameters: false,
                    coerceEnumsToLiterals: true
                }),
                createResolvedSourceSpec("ats", {
                    titleAsSchemaName: true,
                    objectQueryParameters: true
                })
            ],
            workingDirectory: "/tmp"
        });

        expect(source.apiImportSettings).toEqual({ titleAsSchemaName: true });
        expect(source.specs[0]?.apiImportSettings).toEqual({
            objectQueryParameters: false,
            coerceEnumsToLiterals: true
        });
        expect(source.specs[1]?.apiImportSettings).toEqual({ objectQueryParameters: true });
    });

    it("matches API import settings to source specs by namespace and path", () => {
        const firstPath = AbsoluteFilePath.of("/tmp/specs/first.yml");
        const secondPath = AbsoluteFilePath.of("/tmp/specs/second.yml");
        const workspace = {
            absoluteFilePath: AbsoluteFilePath.of("/tmp/fern"),
            allSpecs: [
                createWorkspaceOpenApiSpec("Second", secondPath),
                createWorkspaceOpenApiSpec("First", firstPath)
            ],
            generatorsConfiguration: {
                api: {
                    type: "multiNamespace",
                    definitions: {
                        First: [createConfiguredOpenApiDefinition("../specs/first.yml", true)],
                        Second: [createConfiguredOpenApiDefinition("../specs/second.yml", false)]
                    },
                    rootDefinitions: undefined
                }
            }
        } as unknown as AbstractAPIWorkspace<unknown>;

        const specs = resolveMigrationSourceSpecs({
            workspace,
            fernWorkspace: {} as FernWorkspace,
            generator: createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")
        });

        expect(specs.map(({ namespace, apiImportSettings }) => ({ namespace, apiImportSettings }))).toEqual([
            { namespace: "Second", apiImportSettings: { titleAsSchemaName: false } },
            { namespace: "First", apiImportSettings: { titleAsSchemaName: true } }
        ]);
    });

    it("uses a common project root when source files live outside the Fern configuration directory", () => {
        const source = serializeMigrationSource({
            specs: [
                {
                    ...createResolvedSourceSpec("airweave", undefined),
                    absolutePath: "/repo/specs/airweave/openapi.json",
                    absoluteOverridePaths: ["/repo/build_configs/fern/airweave/fern/definition/overrides.yml"]
                }
            ],
            workingDirectory: "/repo/build_configs/fern/airweave"
        });

        expect(source.specs[0]).toMatchObject({
            path: "./specs/airweave/openapi.json",
            overrides: ["./build_configs/fern/airweave/fern/definition/overrides.yml"]
        });
    });

    it("reports unsupported authentication for manual review without partially mapping it", () => {
        const definition = createDefinition();
        definition.rootApiFile.contents.auth = "oauth";

        const result = mapFernDefinitionToSdkConfigApi(definition);

        expect(result.api.auth).toBeUndefined();
        expect(result.diagnostics).toEqual([
            expect.objectContaining({
                code: "FERN_API_AUTH_REQUIRES_REVIEW",
                path: ["api", "auth"],
                reason: expect.stringContaining("oauth")
            })
        ]);
    });

    it("sorts named environment URLs deterministically", () => {
        const definition = createDefinition();
        definition.rootApiFile.contents.environments = {
            Secondary: {
                urls: {
                    secondary: "https://secondary.example.com",
                    primary: "https://primary.example.com"
                }
            },
            Primary: "https://default.example.com"
        };

        const result = mapFernDefinitionToSdkConfigApi(definition);

        expect(result.api.environments).toEqual([
            {
                name: "Primary",
                urls: [{ name: "default", url: "https://default.example.com" }]
            },
            {
                name: "Secondary",
                urls: [
                    { name: "primary", url: "https://primary.example.com" },
                    { name: "secondary", url: "https://secondary.example.com" }
                ]
            }
        ]);
    });

    it("rejects duplicate target languages", () => {
        const group = createGroup([
            createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3"),
            createGenerator("fernapi/fern-typescript-node-sdk", "typescript", "2.8.0")
        ]);

        expect(() =>
            mapFernGroupToSdkConfig({
                fernWorkspace: { definition: createDefinition() },
                group,
                source: createSource()
            })
        ).toThrow(FernConfigMappingError);
    });

    it("creates parent directories and protects existing output unless forced", async () => {
        const output = AbsoluteFilePath.of(join(temporaryDirectory, "nested", "sdk-config.json"));
        await writeOutputFile(output, "first\n", false);
        expect(await readFile(output, "utf-8")).toBe("first\n");

        await expect(writeOutputFile(output, "second\n", false)).rejects.toSatisfy(
            (error) => error instanceof CliError && error.message.includes("already exists")
        );
        expect(await readFile(output, "utf-8")).toBe("first\n");

        await writeOutputFile(output, "second\n", true);
        expect(await readFile(output, "utf-8")).toBe("second\n");
    });

    it("does not replace an existing file when creating a new output fails", async () => {
        const output = AbsoluteFilePath.of(join(temporaryDirectory, "sdk-config.json"));
        await writeFile(output, "existing\n");

        await expect(writeOutputFile(output, "replacement\n", false)).rejects.toBeInstanceOf(CliError);
        expect(await readFile(output, "utf-8")).toBe("existing\n");
    });
});

describe("SDK Config migration target selection", () => {
    it("uses the configured default group", async () => {
        const first = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]);
        first.groupName = "first";
        const selected = createGroup([createGenerator("fernapi/fern-python-sdk", "python", "4.3.10")]);
        selected.groupName = "selected";

        const result = await selectMigrationTarget({
            project: createProject([createWorkspace("payments", [first, selected], "selected")]),
            cliContext: createCliContext(false),
            args: {}
        });

        expect(result.groups).toEqual([selected]);
    });

    it("requires --group for ambiguous non-interactive selection", async () => {
        const first = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]);
        first.groupName = "first";
        const second = createGroup([createGenerator("fernapi/fern-python-sdk", "python", "4.3.10")]);
        second.groupName = "second";

        await expect(
            selectMigrationTarget({
                project: createProject([createWorkspace("payments", [first, second])]),
                cliContext: createCliContext(false),
                args: {}
            })
        ).rejects.toSatisfy(
            (error) => error instanceof CliError && error.message.includes("Use --group to select one")
        );
    });

    it("prompts for an ambiguous group in an interactive terminal", async () => {
        const first = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]);
        first.groupName = "first";
        const second = createGroup([createGenerator("fernapi/fern-python-sdk", "python", "4.3.10")]);
        second.groupName = "second";
        const cliContext = createCliContext(true);
        vi.mocked(cliContext.selectPrompt).mockResolvedValue(second);

        const result = await selectMigrationTarget({
            project: createProject([createWorkspace("payments", [first, second])]),
            cliContext,
            args: {}
        });

        expect(result.groups).toEqual([second]);
        expect(cliContext.selectPrompt).toHaveBeenCalledOnce();
    });

    it("selects repeated groups and expands multi-group aliases in deterministic order", async () => {
        const typescript = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]);
        typescript.groupName = "typescript";
        const python = createGroup([createGenerator("fernapi/fern-python-sdk", "python", "4.3.10")]);
        python.groupName = "python";
        const workspace = createWorkspace("payments", [typescript, python], undefined, {
            all: ["typescript", "python"]
        });

        const repeated = await selectMigrationTarget({
            project: createProject([workspace]),
            cliContext: createCliContext(false),
            args: { group: ["python", "typescript", "python"] }
        });
        const alias = await selectMigrationTarget({
            project: createProject([workspace]),
            cliContext: createCliContext(false),
            args: { group: ["all"] }
        });

        expect(repeated.groups).toEqual([python, typescript]);
        expect(alias.groups).toEqual([typescript, python]);
    });

    it("selects an explicitly named API and rejects invalid API names", async () => {
        const group = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]);
        const payments = createWorkspace("payments", [group]);
        const users = createWorkspace("users", [group]);
        const defaultApi = createWorkspace(undefined, [group]);
        const cliContext = createCliContext(false);

        const result = await selectMigrationTarget({
            project: createProject([payments, users]),
            cliContext,
            args: { api: "users" }
        });
        expect(result.workspace).toBe(users);

        const selectedDefault = await selectMigrationTarget({
            project: createProject([payments, defaultApi]),
            cliContext,
            args: { api: "default" }
        });
        expect(selectedDefault.workspace).toBe(defaultApi);

        await expect(
            selectMigrationTarget({
                project: createProject([createWorkspace(undefined, [group])]),
                cliContext,
                args: { api: "missing" }
            })
        ).rejects.toSatisfy(
            (error) => error instanceof CliError && error.message === "API 'missing' not found. Available APIs: default"
        );
    });
});

describe("SDK Config migration group consolidation", () => {
    it("combines generators when every selected group resolves to the same API schema", async () => {
        const typescript = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]);
        typescript.groupName = "typescript";
        const python = createGroup([createGenerator("fernapi/fern-python-sdk", "python", "4.3.10")]);
        python.groupName = "python";
        const definition = createDefinition();
        const workspace = createLoadableWorkspace([typescript, python], [definition, structuredClone(definition)]);

        const result = await loadCompatibleMigrationGroups({
            workspace,
            groups: [typescript, python],
            cliContext: createTaskCliContext()
        });

        expect(result.group.groupName).toBe("typescript+python");
        expect(result.group.generators.map(({ language }) => language)).toEqual(["typescript", "python"]);
        expect(workspace.toFernWorkspace).toHaveBeenCalledOnce();
        expect(
            mapFernGroupToSdkConfig({
                fernWorkspace: result.fernWorkspace,
                group: result.group,
                source: createSource()
            }).sdkConfig.targets.map(({ language }) => language)
        ).toEqual(["typescript", "python"]);
    });

    it("treats selected audiences as an unordered set", async () => {
        const typescript = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]);
        typescript.groupName = "typescript";
        typescript.audiences = { type: "select", audiences: ["partner", "public"] };
        const python = createGroup([createGenerator("fernapi/fern-python-sdk", "python", "4.3.10")]);
        python.groupName = "python";
        python.audiences = { type: "select", audiences: ["public", "partner", "public"] };
        const definition = createDefinition();

        const result = await loadCompatibleMigrationGroups({
            workspace: createLoadableWorkspace([typescript, python], [definition, structuredClone(definition)]),
            groups: [typescript, python],
            cliContext: createTaskCliContext()
        });

        expect(result.group.generators).toHaveLength(2);
    });

    it("rejects groups whose resolved API definitions differ", async () => {
        const typescript = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]);
        typescript.groupName = "typescript";
        const python = createGroup([createGenerator("fernapi/fern-python-sdk", "python", "4.3.10")]);
        python.groupName = "python";
        const pythonGenerator = python.generators[0];
        if (pythonGenerator == null) {
            throw new Error("Expected the Python group to contain a generator");
        }
        pythonGenerator.apiOverride = { specs: [] };
        const first = createDefinition();
        const second = createDefinition();
        second.rootApiFile.contents.name = "different-api";

        await expect(
            loadCompatibleMigrationGroups({
                workspace: createLoadableWorkspace([typescript, python], [first, second]),
                groups: [typescript, python],
                cliContext: createTaskCliContext()
            })
        ).rejects.toSatisfy(
            (error) => error instanceof CliError && error.message.includes("resolve to different API schemas")
        );
    });

    it("treats different audience selections as different API schemas", async () => {
        const publicGroup = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")]);
        publicGroup.groupName = "public";
        publicGroup.audiences = { type: "select", audiences: ["public"] };
        const internalGroup = createGroup([createGenerator("fernapi/fern-python-sdk", "python", "4.3.10")]);
        internalGroup.groupName = "internal";
        internalGroup.audiences = { type: "select", audiences: ["internal"] };
        const definition = createDefinition();

        await expect(
            loadCompatibleMigrationGroups({
                workspace: createLoadableWorkspace(
                    [publicGroup, internalGroup],
                    [definition, structuredClone(definition)]
                ),
                groups: [publicGroup, internalGroup],
                cliContext: createTaskCliContext()
            })
        ).rejects.toBeInstanceOf(CliError);
    });
});

function createDefinition(): FernDefinition {
    return {
        absoluteFilePath: AbsoluteFilePath.of("/tmp/fern/definition"),
        importedDefinitions: {},
        namedDefinitionFiles: {},
        packageMarkers: {},
        rootApiFile: {
            defaultUrl: "https://api.example.com",
            rawContents: "",
            contents: {
                name: "migration-api",
                "default-environment": "Production",
                environments: { Production: "https://api.example.com" },
                headers: {
                    "X-API-Version": {
                        name: "apiVersion",
                        type: "optional<string>",
                        env: "API_VERSION"
                    }
                }
            }
        },
        specVersion: "2026-08-31"
    };
}

function createSource() {
    return {
        specs: [{ id: "migration-api", type: "openapi" as const, path: "./openapi.yml" }]
    };
}

function createResolvedSourceSpec(
    name: string,
    apiImportSettings: ResolvedMigrationSourceSpec["apiImportSettings"]
): ResolvedMigrationSourceSpec {
    return {
        absolutePath: `/tmp/${name}.yml`,
        absoluteOverlayPaths: [],
        absoluteOverridePaths: [],
        apiImportSettings,
        idHint: name,
        namespace: name,
        type: "openapi"
    };
}

function createWorkspaceOpenApiSpec(namespace: string, absoluteFilepath: AbsoluteFilePath): Spec {
    return {
        type: "openapi",
        absoluteFilepath,
        absoluteFilepathToOverrides: undefined,
        absoluteFilepathToOverlays: undefined,
        namespace,
        source: { type: "openapi", file: absoluteFilepath }
    };
}

function createConfiguredOpenApiDefinition(
    configuredPath: string,
    shouldUseTitleAsName: boolean
): generatorsYml.APIDefinitionLocation {
    return {
        schema: { type: "oss", path: configuredPath },
        origin: undefined,
        overrides: undefined,
        overlays: undefined,
        audiences: undefined,
        settings: { shouldUseTitleAsName } as generatorsYml.APIDefinitionSettings
    };
}

function createGroup(generators: generatorsYml.GeneratorInvocation[]): generatorsYml.GeneratorGroup {
    return {
        audiences: { type: "select", audiences: [] },
        generators,
        groupName: "production",
        reviewers: undefined
    };
}

function createGenerator(
    name: string,
    language: generatorsYml.GenerationLanguage,
    version: string
): generatorsYml.GeneratorInvocation {
    return {
        absolutePathToLocalOutput: undefined,
        absolutePathToLocalSnippets: undefined,
        automation: { generate: true, preview: true, upgrade: true, verify: true },
        config: {},
        containerImage: undefined,
        disableExamples: false,
        idempotencyKeyGenerationConfig: undefined,
        irVersionOverride: undefined,
        keywords: undefined,
        language,
        name,
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined,
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        version
    };
}

function createWorkspace(
    workspaceName: string | undefined,
    groups: generatorsYml.GeneratorGroup[],
    defaultGroup?: string,
    groupAliases: Record<string, string[]> = {}
): AbstractAPIWorkspace<unknown> {
    return {
        workspaceName,
        generatorsConfiguration: {
            defaultGroup,
            groupAliases,
            groups
        }
    } as unknown as AbstractAPIWorkspace<unknown>;
}

function createProject(apiWorkspaces: AbstractAPIWorkspace<unknown>[]): Project {
    return { apiWorkspaces } as unknown as Project;
}

function createLoadableWorkspace(
    groups: generatorsYml.GeneratorGroup[],
    definitions: FernDefinition[]
): AbstractAPIWorkspace<unknown> {
    let index = 0;
    return {
        absoluteFilePath: AbsoluteFilePath.of("/tmp/fern"),
        generatorsConfiguration: { defaultGroup: undefined, groupAliases: {}, groups },
        toFernWorkspace: vi.fn(async () => ({
            definition: definitions[index++],
            sources: [
                {
                    id: "migration-api",
                    type: "openapi",
                    absoluteFilePath: AbsoluteFilePath.of("/tmp/fern/openapi.yml")
                }
            ]
        }))
    } as unknown as AbstractAPIWorkspace<unknown>;
}

function createTaskCliContext(): CliContext {
    return {
        runTask: vi.fn(async (task: (context: never) => unknown) => task({} as never))
    } as unknown as CliContext;
}

function createCliContext(isTTY: boolean): CliContext {
    return {
        isTTY,
        selectPrompt: vi.fn()
    } as unknown as CliContext;
}
