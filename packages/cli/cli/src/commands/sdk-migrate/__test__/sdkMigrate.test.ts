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
    identifySourceDerivedApiFields,
    type ResolvedMigrationSourceSpec,
    resolveMigrationPathParameterStyle,
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
                    language: "typescript",
                    output: { delivery: "zip" }
                }
            ]
        });
        expect(result.sdkConfig.targets[0]).not.toHaveProperty("generatorVersion");
        expect(result.sdkConfig.sdkVersion).toBeUndefined();
        expect(result.sdkConfig.apiVersion).toBeUndefined();
        expect(result.sdkConfig.client).toBeUndefined();
        expect(result.sdkConfig.package).toBeUndefined();
        expect(result.sdkConfig.docs).toBeUndefined();
        expect(result.sdkConfig.generation).toBeUndefined();
    });

    it("preserves API-level path parameter behavior in the customer SDK Config", () => {
        const result = mapFernGroupToSdkConfig({
            fernWorkspace: { definition: createDefinition() },
            group: createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "4.0.0")]),
            source: createSource(),
            clientPathParameterStyle: "wrapped"
        });

        expect(result.sdkConfig.client?.pathParameterStyle).toBe("wrapped");
    });

    it("maps supported Python generator settings into SDK Config", () => {
        const generator = createGenerator("fernapi/fern-python-sdk", "python", "4.3.10");
        generator.config = {
            client: {
                class_name: "BaseSdkClient",
                filename: "base_client.py",
                exported_class_name: "SdkClient",
                exported_filename: "client.py"
            },
            pydantic_config: { skip_validation: true },
            follow_redirects_by_default: true,
            default_bytes_stream_chunk_size: 1024,
            recursion_limit: 10_000,
            extras: { audio: ["audio-runtime"] },
            additional_init_exports: [{ from: "types", imports: ["ApiError"] }]
        };

        const result = mapFernGroupToSdkConfig({
            fernWorkspace: { definition: createDefinition() },
            group: createGroup([generator]),
            source: createSource()
        });

        expect(result.sdkConfig.client).toMatchObject({ responseValidation: false });
        expect(result.sdkConfig.generation).toMatchObject({
            naming: { clientName: "BaseSdkClient", exportedClientName: "SdkClient" }
        });
        expect(result.sdkConfig.targets[0]?.generation).toMatchObject({
            client: { fileName: "base_client.py", exportedFileName: "client.py" },
            followRedirectsByDefault: true,
            defaultBytesStreamChunkSize: 1024,
            recursionLimit: 10_000,
            extras: { audio: ["audio-runtime"] },
            additionalInitExports: [{ from: "types", imports: ["ApiError"] }]
        });
        expect(result.diagnostics).toEqual([]);
    });

    it("preserves package metadata and language-specific README sections across SDK targets", () => {
        const typescript = createGenerator("fernapi/fern-typescript-sdk", "typescript", "4.0.0");
        typescript.config = {
            fetchSupport: "native",
            packageJson: {
                description: "TypeScript SDK for the Example API.",
                author: {
                    name: "Example SDK Team",
                    url: "https://sdk.example.com",
                    email: "support@example.com"
                }
            }
        };
        const php = createGenerator("fernapi/fern-php-sdk", "php", "3.0.0");
        php.config = {
            composerJson: {
                description: "PHP SDK for the Example API.",
                author: {
                    name: "Example SDK Team",
                    url: "https://sdk.example.com",
                    email: "support@example.com"
                },
                license: "MIT"
            }
        };
        const python = createGenerator("fernapi/fern-python-sdk", "python", "6.0.0");
        python.config = {
            pydantic_config: { skip_validation: true },
            additional_init_exports: [{ from: "types", imports: ["SdkError"] }]
        };
        const readme: generatorsYml.ReadmeSchema = {
            apiName: "Example API",
            customSections: [
                { title: "TypeScript usage", language: "typescript", content: "TypeScript example." },
                { title: "PHP usage", language: "php", content: "PHP example." },
                { title: "Python usage", language: "python", content: "Python example." }
            ]
        };
        typescript.readme = readme;
        php.readme = readme;
        python.readme = readme;

        const result = mapFernGroupToSdkConfig({
            fernWorkspace: { definition: createDefinition() },
            group: createGroup([typescript, php, python]),
            source: createSource()
        });

        expect(result.sdkConfig.docs).toEqual({ readme: { apiName: "Example API" } });
        expect(result.sdkConfig.targets).toMatchObject([
            {
                language: "typescript",
                docs: { readme: { customSections: [{ title: "TypeScript usage", content: "TypeScript example." }] } },
                package: {
                    description: "TypeScript SDK for the Example API.",
                    authors: [
                        {
                            name: "Example SDK Team",
                            email: "support@example.com",
                            url: "https://sdk.example.com"
                        }
                    ]
                },
                generation: { httpClient: { name: "fetch" } }
            },
            {
                language: "php",
                docs: { readme: { customSections: [{ title: "PHP usage", content: "PHP example." }] } },
                package: {
                    description: "PHP SDK for the Example API.",
                    authors: [
                        {
                            name: "Example SDK Team",
                            email: "support@example.com",
                            url: "https://sdk.example.com"
                        }
                    ],
                    license: { type: "MIT" }
                }
            },
            {
                language: "python",
                client: { responseValidation: false },
                docs: { readme: { customSections: [{ title: "Python usage", content: "Python example." }] } },
                generation: {
                    additionalInitExports: [{ from: "types", imports: ["SdkError"] }]
                }
            }
        ]);
        expect(result.diagnostics).toEqual([]);
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

    it("omits environments and auth that are already represented by the source specification", () => {
        const definition = createDefinition();
        definition.rootApiFile.contents.auth = "ApiKeyAuth";
        definition.rootApiFile.contents["auth-schemes"] = {
            ApiKeyAuth: { header: "x-api-key" }
        };

        const result = mapFernGroupToSdkConfig({
            fernWorkspace: { definition },
            group: createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "4.0.0")]),
            source: createSource(),
            sourceDerivedApiFields: { auth: true, environments: true, headerNames: [] }
        });

        expect(result.sdkConfig.api).toEqual({
            audiences: [],
            headers: [{ name: "apiVersion", environmentVariable: "API_VERSION" }]
        });
        expect(result.diagnostics).toEqual([]);
    });

    it("omits only global headers that are already represented by the source specification", () => {
        const definition = createDefinition();
        definition.rootApiFile.contents.headers = {
            "X-API-Version": {
                name: "apiVersion",
                type: "optional<string>",
                env: "API_VERSION"
            },
            "X-Request-ID": {
                name: "requestId",
                type: "optional<string>"
            }
        };

        const result = mapFernGroupToSdkConfig({
            fernWorkspace: { definition },
            group: createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "4.0.0")]),
            source: createSource(),
            sourceDerivedApiFields: {
                auth: false,
                environments: false,
                headerNames: ["x-api-version"]
            }
        });

        expect(result.sdkConfig.api?.headers).toEqual([{ name: "requestId" }]);
    });

    it("only identifies API fields as source-derived for OSS workspaces without Fern overrides", () => {
        const group = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "4.0.0")]);
        const sourceOnly = createWorkspace("payments", [group]);
        const definition = createDefinition(["X-API-Version"]);
        Object.assign(sourceOnly, { type: "oss" });

        expect(identifySourceDerivedApiFields({ workspace: sourceOnly, groups: [group], definition })).toEqual({
            auth: true,
            environments: true,
            headerNames: ["X-API-Version"]
        });

        const generatorsConfiguration = sourceOnly.generatorsConfiguration;
        if (generatorsConfiguration == null) {
            throw new Error("Expected generators configuration");
        }
        sourceOnly.generatorsConfiguration = {
            ...generatorsConfiguration,
            api: {
                type: "singleNamespace",
                definitions: [],
                auth: "ApiKeyAuth",
                "auth-schemes": { ApiKeyAuth: { header: "x-api-key" } },
                environments: { Production: "https://api.example.com" },
                "default-environment": "Production",
                headers: { "X-Configured": "string" }
            }
        };
        expect(identifySourceDerivedApiFields({ workspace: sourceOnly, groups: [group], definition })).toEqual({
            auth: false,
            environments: false,
            headerNames: []
        });

        Object.assign(sourceOnly, { type: "fern" });
        expect(identifySourceDerivedApiFields({ workspace: sourceOnly, groups: [group], definition })).toEqual({
            auth: false,
            environments: false,
            headerNames: []
        });
    });

    it("fails explicitly when a clone loses global header provenance", () => {
        const group = createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "4.0.0")]);
        const workspace = createWorkspace("payments", [group]);
        Object.assign(workspace, { type: "oss" });
        const definitionWithoutProvenance = structuredClone(createDefinition(["X-API-Version"]));

        expect(() =>
            identifySourceDerivedApiFields({ workspace, groups: [group], definition: definitionWithoutProvenance })
        ).toThrowError(/Could not determine global-header provenance/);
    });

    it("keeps generator-level authentication overrides in SDK Config", () => {
        const generator = createGenerator("fernapi/fern-typescript-sdk", "typescript", "4.0.0");
        generator.apiOverride = {
            auth: "ApiKeyAuth",
            "auth-schemes": { ApiKeyAuth: { header: "x-api-key" } }
        };
        const group = createGroup([generator]);
        const workspace = createWorkspace("payments", [group]);
        Object.assign(workspace, { type: "oss" });

        expect(
            identifySourceDerivedApiFields({ workspace, groups: [group], definition: createDefinition() }).auth
        ).toBe(false);
    });

    it("keeps generator-level header overrides in SDK Config", () => {
        const generator = createGenerator("fernapi/fern-typescript-sdk", "typescript", "4.0.0");
        generator.apiOverride = {
            headers: { "X-API-Version": { name: "apiVersion", type: "optional<string>" } }
        };
        const group = createGroup([generator]);
        const workspace = createWorkspace("payments", [group]);
        const definition = createDefinition(["X-API-Version"]);
        Object.assign(workspace, { type: "oss" });

        expect(identifySourceDerivedApiFields({ workspace, groups: [group], definition }).headerNames).toEqual([]);
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
                        First: [createConfiguredOpenApiDefinition("../specs/first.yml", true, false)],
                        Second: [createConfiguredOpenApiDefinition("../specs/second.yml", false, false)]
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
        expect(resolveMigrationPathParameterStyle(specs)).toBe("wrapped");
    });

    it("projects supported Fern API import settings into SDK Config", () => {
        const absoluteFilepath = AbsoluteFilePath.of("/tmp/specs/sample.yml");
        const configuredDefinition = createConfiguredOpenApiDefinition("../specs/sample.yml", false, false);
        configuredDefinition.settings = {
            ...configuredDefinition.settings,
            respectReadonlySchemas: true,
            shouldUseUndiscriminatedUnionsWithLiterals: true,
            inlineAllOfSchemas: true,
            resolveSchemaCollisions: true,
            asyncApiMessageNaming: "v2"
        } as generatorsYml.APIDefinitionSettings;
        const workspace = {
            absoluteFilePath: AbsoluteFilePath.of("/tmp/fern"),
            allSpecs: [createWorkspaceOpenApiSpec("Sample", absoluteFilepath)],
            generatorsConfiguration: {
                api: {
                    type: "multiNamespace",
                    definitions: { Sample: [configuredDefinition] },
                    rootDefinitions: undefined
                }
            }
        } as unknown as AbstractAPIWorkspace<unknown>;

        const [spec] = resolveMigrationSourceSpecs({
            workspace,
            fernWorkspace: {} as FernWorkspace,
            generator: createGenerator("fernapi/fern-python-sdk", "python", "4.3.10")
        });

        expect(spec?.apiImportSettings).toEqual({
            titleAsSchemaName: false,
            respectReadonlySchemas: true,
            discriminatedUnionV2: true,
            undiscriminatedUnionsWithLiterals: true,
            inlineAllOfSchemas: true,
            resolveSchemaCollisions: true,
            asyncApiMessageNaming: "v2"
        });
    });

    it("projects generator-level source import settings into SDK Config", () => {
        const generator = createGenerator("fernapi/fern-python-sdk", "python", "4.3.10");
        generator.apiOverride = {
            specs: [
                {
                    openapi: "../specs/sample.yml",
                    namespace: "Sample",
                    settings: {
                        "respect-readonly-schemas": true,
                        "prefer-undiscriminated-unions-with-literals": true,
                        "inline-all-of-schemas": true,
                        "resolve-schema-collisions": true
                    }
                }
            ]
        };
        const workspace = createWorkspace("sample", [createGroup([generator])]);
        workspace.absoluteFilePath = AbsoluteFilePath.of("/tmp/fern");

        const [spec] = resolveMigrationSourceSpecs({
            workspace,
            fernWorkspace: {} as FernWorkspace,
            generator
        });

        expect(spec?.apiImportSettings).toEqual({
            respectReadonlySchemas: true,
            discriminatedUnionV2: true,
            undiscriminatedUnionsWithLiterals: true,
            inlineAllOfSchemas: true,
            resolveSchemaCollisions: true
        });
    });

    it("rejects git-backed API specifications instead of serializing temporary clone paths", () => {
        const absoluteFilepath = AbsoluteFilePath.of("/tmp/mock-clone/openapi/service.yml");
        const configuredDefinition = createConfiguredOpenApiDefinition("openapi/service.yml", false, false);
        configuredDefinition.gitSource = {
            repo: "https://github.com/acme/api-specs.git",
            ref: "main",
            path: "openapi/service.yml"
        };
        const workspace = {
            absoluteFilePath: AbsoluteFilePath.of("/tmp/fern"),
            allSpecs: [createWorkspaceOpenApiSpec("Payments", absoluteFilepath)],
            generatorsConfiguration: {
                api: {
                    type: "multiNamespace",
                    definitions: { Payments: [configuredDefinition] },
                    rootDefinitions: undefined
                }
            }
        } as unknown as AbstractAPIWorkspace<unknown>;

        expect(() =>
            resolveMigrationSourceSpecs({
                workspace,
                fernWorkspace: {} as FernWorkspace,
                generator: createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")
            })
        ).toThrow("cannot create durable local paths for git-backed API specification");
    });

    it("rejects conflicting API-level path parameter behavior across source specs", () => {
        const inline = {
            ...createResolvedSourceSpec("inline", undefined),
            clientPathParameterStyle: "inline" as const,
            clientPathParameterStyleExplicit: true
        };
        const wrapped = {
            ...createResolvedSourceSpec("wrapped", undefined),
            clientPathParameterStyle: "wrapped" as const,
            clientPathParameterStyleExplicit: true
        };

        expect(() => resolveMigrationPathParameterStyle([inline, wrapped])).toThrow(
            "conflicting inline-path-parameters settings across API specifications: inline=inline, wrapped=wrapped"
        );
    });

    it("treats omitted path parameter behavior as neutral", () => {
        const inline = {
            ...createResolvedSourceSpec("inline", undefined),
            clientPathParameterStyle: "inline" as const,
            clientPathParameterStyleExplicit: true
        };
        const omitted = createResolvedSourceSpec("omitted", undefined);

        expect(resolveMigrationPathParameterStyle([inline, omitted])).toBe("inline");
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
        const output = AbsoluteFilePath.of(join(temporaryDirectory, "nested", "sdk-config.yml"));
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
        const output = AbsoluteFilePath.of(join(temporaryDirectory, "sdk-config.yml"));
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
        const workspace = createLoadableWorkspace([typescript, python], [definition, cloneDefinition(definition)]);

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
            workspace: createLoadableWorkspace([typescript, python], [definition, cloneDefinition(definition)]),
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
                    [definition, cloneDefinition(definition)]
                ),
                groups: [publicGroup, internalGroup],
                cliContext: createTaskCliContext()
            })
        ).rejects.toBeInstanceOf(CliError);
    });
});

function createDefinition(sourceDerivedGlobalHeaderNames: string[] = []): FernDefinition {
    const definition: FernDefinition = {
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
    Object.defineProperty(definition, "sourceDerivedGlobalHeaderNames", {
        configurable: true,
        enumerable: false,
        value: sourceDerivedGlobalHeaderNames,
        writable: true
    });
    return definition;
}

function cloneDefinition(definition: FernDefinition): FernDefinition {
    const clone = structuredClone(definition);
    Object.defineProperty(clone, "sourceDerivedGlobalHeaderNames", {
        configurable: true,
        enumerable: false,
        value: [...(definition.sourceDerivedGlobalHeaderNames ?? [])],
        writable: true
    });
    return clone;
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
    shouldUseTitleAsName: boolean,
    inlinePathParameters?: boolean
): generatorsYml.APIDefinitionLocation {
    return {
        schema: { type: "oss", path: configuredPath },
        origin: undefined,
        overrides: undefined,
        overlays: undefined,
        audiences: undefined,
        settings: { shouldUseTitleAsName, inlinePathParameters } as generatorsYml.APIDefinitionSettings
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
