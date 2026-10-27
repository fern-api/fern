import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import type { AbstractAPIWorkspace, FernWorkspace, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import path from "path";
import { describe, expect, it, vi } from "vitest";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { resolveMigrationSourceSpecs, serializeMigrationSource } from "../projectMigrationSource.js";
import { resolveDocsSourceSpecs } from "../sdkMigrate.js";

const ANDURIL_WORKSPACE = "/repo/build_configs/fern/anduril/fern";
const ANDURIL_PROTO_ROOT = "/repo/specs/anduril/public-apis";

describe("SDK Config migration of protobuf specs", () => {
    it("migrates a proto-only API whose protos are generated from OpenAPI", () => {
        const proto = protobufSpec({
            root: "/repo/fern/proto",
            target: "/repo/fern/proto/user/v1/user.proto",
            fromOpenAPI: true
        });
        const workspace = ossWorkspace({
            absoluteFilePath: "/repo/fern",
            allSpecs: [],
            specs: [proto],
            definitions: [protoDefinition({ root: "proto", target: "proto/user/v1/user.proto", fromOpenAPI: true })]
        });

        expect(migrate(workspace, "/repo/fern")).toEqual({
            specs: [
                {
                    id: "user",
                    proto: { root: "./proto", target: "./proto/user/v1/user.proto", fromOpenApi: true }
                }
            ]
        });
    });

    it("migrates every proto setting of a docs-only proto", () => {
        const proto = protobufSpec({
            root: "/repo/fern/proto",
            target: "/repo/fern/proto/user/v1/user.proto",
            overrides: "/repo/fern/overrides/user.yml",
            generateLocally: true,
            dependencies: ["buf.build/googleapis/googleapis"]
        });
        const workspace = ossWorkspace({
            absoluteFilePath: "/repo/fern",
            allSpecs: [proto],
            specs: [],
            definitions: [protoDefinition({ root: "proto", target: "proto/user/v1/user.proto" })]
        });

        expect(migrate(workspace, "/repo/fern").specs).toEqual([
            {
                id: "user",
                proto: {
                    root: "./proto",
                    target: "./proto/user/v1/user.proto",
                    overrides: ["./overrides/user.yml"],
                    dependencies: ["buf.build/googleapis/googleapis"],
                    localGeneration: true,
                    fromOpenApi: false
                }
            }
        ]);
    });

    it("keeps OpenAPI and proto specs in generators.yml order, including protos generated from OpenAPI", () => {
        const entities = openApiSpec(`${ANDURIL_PROTO_ROOT}/anduril/entitymanager/v1/entities_service_openapi.yml`, {
            overrides: `${ANDURIL_WORKSPACE}/overrides/entitymanager/v1/overrides.yml`
        });
        const tasksProto = protobufSpec({
            root: ANDURIL_PROTO_ROOT,
            target: `${ANDURIL_PROTO_ROOT}/anduril/taskmanager/v1/task_manager_api.pub.proto`,
            fromOpenAPI: true
        });
        const objectStore = openApiSpec("/repo/specs/anduril/openapi/objectstore/v1/object_store.yaml");
        const entitiesProto = protobufSpec({
            root: ANDURIL_PROTO_ROOT,
            target: `${ANDURIL_PROTO_ROOT}/anduril/entitymanager/v1/entity_manager_api.pub.proto`,
            generateLocally: true
        });
        const workspace = ossWorkspace({
            absoluteFilePath: ANDURIL_WORKSPACE,
            // loadAPIWorkspace splits one ordered list into these two views.
            allSpecs: [entities, objectStore, entitiesProto],
            specs: [entities, tasksProto, objectStore],
            definitions: [
                openApiDefinition(
                    "../../../../specs/anduril/public-apis/anduril/entitymanager/v1/entities_service_openapi.yml"
                ),
                protoDefinition({
                    root: "../../../../specs/anduril/public-apis/",
                    target: "../../../../specs/anduril/public-apis/anduril/taskmanager/v1/task_manager_api.pub.proto",
                    fromOpenAPI: true
                }),
                openApiDefinition("../../../../specs/anduril/openapi/objectstore/v1/object_store.yaml"),
                protoDefinition({
                    root: "../../../../specs/anduril/public-apis/",
                    target: "../../../../specs/anduril/public-apis/anduril/entitymanager/v1/entity_manager_api.pub.proto",
                    localGeneration: true
                })
            ]
        });

        const source = migrate(workspace, ANDURIL_WORKSPACE);

        expect(source.specs).toEqual([
            {
                id: "entities_service_openapi",
                type: "openapi",
                path: "./specs/anduril/public-apis/anduril/entitymanager/v1/entities_service_openapi.yml",
                overrides: ["./build_configs/fern/anduril/fern/overrides/entitymanager/v1/overrides.yml"]
            },
            {
                id: "task_manager_api.pub",
                proto: {
                    root: "./specs/anduril/public-apis",
                    target: "./specs/anduril/public-apis/anduril/taskmanager/v1/task_manager_api.pub.proto",
                    fromOpenApi: true
                }
            },
            {
                id: "object_store",
                type: "openapi",
                path: "./specs/anduril/openapi/objectstore/v1/object_store.yaml"
            },
            {
                id: "entity_manager_api.pub",
                proto: {
                    root: "./specs/anduril/public-apis",
                    target: "./specs/anduril/public-apis/anduril/entitymanager/v1/entity_manager_api.pub.proto",
                    localGeneration: true,
                    fromOpenApi: false
                }
            }
        ]);
        expect(() => validateSdkConfigV1(sdkConfigDocument(source))).not.toThrow();
    });

    it("writes a proto root that fern generate does not count toward the source root relative to it", () => {
        const proto = protobufSpec({
            root: "/repo/specs/proto",
            target: "/repo/specs/proto/user/v1/user.proto",
            fromOpenAPI: true
        });
        const workspace = ossWorkspace({
            absoluteFilePath: "/repo/fern",
            allSpecs: [],
            specs: [proto],
            definitions: [
                protoDefinition({
                    root: "../specs/proto",
                    target: "../specs/proto/user/v1/user.proto",
                    fromOpenAPI: true
                })
            ]
        });

        expect(migrate(workspace, "/repo/fern").specs).toEqual([
            {
                id: "user",
                proto: { root: "../specs/proto", target: "../specs/proto/user/v1/user.proto", fromOpenApi: true }
            }
        ]);
    });

    it("keeps multiple proto overrides in order", () => {
        const proto = protobufSpec({
            root: "/repo/fern/proto",
            target: undefined,
            overrides: ["/repo/fern/overrides/second.yml", "/repo/fern/overrides/first.yml"]
        });
        const workspace = ossWorkspace({
            absoluteFilePath: "/repo/fern",
            allSpecs: [proto],
            specs: [],
            definitions: [protoDefinition({ root: "proto" })]
        });

        expect(migrate(workspace, "/repo/fern").specs).toEqual([
            {
                id: "proto",
                proto: {
                    root: "./proto",
                    overrides: ["./overrides/second.yml", "./overrides/first.yml"],
                    fromOpenApi: false
                }
            }
        ]);
    });

    it("gives specs that share a root distinct ids from their targets", () => {
        const first = protobufSpec({ root: "/repo/fern/proto", target: "/repo/fern/proto/a/v1/service.proto" });
        const second = protobufSpec({ root: "/repo/fern/proto", target: "/repo/fern/proto/b/v1/service.proto" });
        const workspace = ossWorkspace({
            absoluteFilePath: "/repo/fern",
            allSpecs: [first, second],
            specs: [],
            definitions: [
                protoDefinition({ root: "proto", target: "proto/a/v1/service.proto" }),
                protoDefinition({ root: "proto", target: "proto/b/v1/service.proto" })
            ]
        });

        expect(migrate(workspace, "/repo/fern").specs.map((spec) => spec.id)).toEqual(["service", "service-2"]);
    });

    it("maps a git root to a git remote instead of the temporary clone path", () => {
        const proto = protobufSpec({
            root: "/tmp/fern-clone/proto",
            target: "/tmp/fern-clone/proto/user/v1/user.proto",
            overrides: "/repo/fern/overrides/user.yml",
            fromOpenAPI: true
        });
        const definition = protoDefinition({ root: "proto", target: "proto/user/v1/user.proto", fromOpenAPI: true });
        definition.gitSource = { repo: "https://github.com/acme/protos.git", ref: "v1.2.0", path: "proto" };
        const workspace = ossWorkspace({
            absoluteFilePath: "/repo/fern",
            allSpecs: [],
            specs: [proto],
            definitions: [definition]
        });

        expect(migrate(workspace, "/repo/fern").specs).toEqual([
            {
                id: "user",
                proto: {
                    root: { git: { repo: "https://github.com/acme/protos.git", ref: "v1.2.0", path: "proto" } },
                    target: "proto/user/v1/user.proto",
                    overrides: ["./overrides/user.yml"],
                    fromOpenApi: true
                }
            }
        ]);
    });

    it("pairs git protos whose paths are suffixes of each other with their own entries", () => {
        const nested = protobufSpec({
            root: "/tmp/fern-clone-a/a/proto",
            target: "/tmp/fern-clone-a/a/proto/user.proto",
            generateLocally: true
        });
        const plain = protobufSpec({
            root: "/tmp/fern-clone-b/proto",
            target: "/tmp/fern-clone-b/proto/user.proto",
            fromOpenAPI: true
        });
        const plainDefinition = protoDefinition({ root: "proto", target: "proto/user.proto", fromOpenAPI: true });
        plainDefinition.gitSource = { repo: "https://github.com/acme/plain.git", path: "proto" };
        const nestedDefinition = protoDefinition({
            root: "a/proto",
            target: "a/proto/user.proto",
            localGeneration: true
        });
        nestedDefinition.gitSource = { repo: "https://github.com/acme/nested.git", path: "a/proto" };
        const workspace = ossWorkspace({
            absoluteFilePath: "/repo/fern",
            // The from-openapi proto comes first in generators.yml but is only in `specs`.
            allSpecs: [nested],
            specs: [plain],
            definitions: [plainDefinition, nestedDefinition]
        });

        expect(migrate(workspace, "/repo/fern").specs).toEqual([
            {
                id: "user",
                proto: {
                    root: { git: { repo: "https://github.com/acme/plain.git", path: "proto" } },
                    target: "proto/user.proto",
                    fromOpenApi: true
                }
            },
            {
                id: "user-2",
                proto: {
                    root: { git: { repo: "https://github.com/acme/nested.git", path: "a/proto" } },
                    target: "a/proto/user.proto",
                    localGeneration: true,
                    fromOpenApi: false
                }
            }
        ]);
    });

    it("maps a git root at the repository root", () => {
        const proto = protobufSpec({
            root: "/tmp/fern-clone",
            target: "/tmp/fern-clone/proto/user/v1/user.proto",
            fromOpenAPI: true
        });
        const definition = protoDefinition({ root: ".", target: "proto/user/v1/user.proto", fromOpenAPI: true });
        definition.gitSource = { repo: "https://github.com/acme/protos.git", path: "." };
        const workspace = ossWorkspace({
            absoluteFilePath: "/repo/fern",
            allSpecs: [],
            specs: [proto],
            definitions: [definition]
        });

        expect(migrate(workspace, "/repo/fern").specs).toEqual([
            {
                id: "user",
                proto: {
                    root: { git: { repo: "https://github.com/acme/protos.git", path: "." } },
                    target: "proto/user/v1/user.proto",
                    fromOpenApi: true
                }
            }
        ]);
    });

    it.each([
        { label: "true", setting: "\n      from-openapi: true", expected: true },
        { label: "false", setting: "\n      from-openapi: false", expected: false },
        { label: "absent", setting: "", expected: false }
    ])("migrates a generators.yml proto with from-openapi $label", async ({ setting, expected }) => {
        const workspacePath = await mkdtemp(path.join(tmpdir(), "sdk-migrate-proto-"));
        try {
            await mkdir(path.join(workspacePath, "proto/user/v1"), { recursive: true });
            await writeFile(path.join(workspacePath, "proto/user/v1/user.proto"), 'syntax = "proto3";\n');
            await writeFile(path.join(workspacePath, "overrides.yml"), "{}\n");
            await writeFile(
                path.join(workspacePath, "generators.yml"),
                `api:\n  specs:\n    - proto:\n        root: proto\n        target: proto/user/v1/user.proto\n        overrides: overrides.yml${setting.replaceAll("\n", "\n  ")}\n`
            );
            const loaded = await loadAPIWorkspace({
                absolutePathToWorkspace: AbsoluteFilePath.of(workspacePath),
                context: createMockTaskContext(),
                cliVersion: "0.0.0",
                workspaceName: undefined
            });
            if (!loaded.didSucceed) {
                throw new Error(`Could not load the test workspace: ${JSON.stringify(loaded.failures)}`);
            }

            expect(migrate(loaded.workspace, workspacePath).specs).toEqual([
                {
                    id: "user",
                    proto: {
                        root: "./proto",
                        target: "./proto/user/v1/user.proto",
                        overrides: ["./overrides.yml"],
                        fromOpenApi: expected
                    }
                }
            ]);
        } finally {
            await rm(workspacePath, { recursive: true, force: true });
        }
    });

    it("explains why a proto source of a workspace without its own specs cannot be migrated", () => {
        const workspace = { absoluteFilePath: AbsoluteFilePath.of("/repo/fern") } as AbstractAPIWorkspace<unknown>;
        const fernWorkspace = {
            sources: [
                {
                    type: "protobuf",
                    id: "user",
                    absoluteFilePath: AbsoluteFilePath.of("/repo/proto/user.proto")
                }
            ]
        } as unknown as FernWorkspace;

        expect(() =>
            resolveMigrationSourceSpecs({ workspace, fernWorkspace, generator: typescriptGenerator() })
        ).toThrow("does not list its own protobuf specs");
    });

    it("leaves docs.yml unchanged with a warning when the API has proto specs", () => {
        const warn = vi.fn();
        const workspace = ossWorkspace({
            absoluteFilePath: "/repo/fern",
            allSpecs: [openApiSpec("/repo/fern/openapi.yml"), protobufSpec({ root: "/repo/fern/proto" })],
            specs: [openApiSpec("/repo/fern/openapi.yml")],
            definitions: [openApiDefinition("openapi.yml"), protoDefinition({ root: "proto" })]
        });

        const docsSpecs = resolveDocsSourceSpecs({
            cliContext: { stderr: { warn } } as unknown as CliContext,
            group: { groupName: "sdk", audiences: { type: "all" }, generators: [], reviewers: undefined },
            sourceSpecs: [],
            workspace
        });

        expect(docsSpecs).toEqual([]);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("docs.yml was not updated"));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("protobuf"));
    });
});

function migrate(workspace: AbstractAPIWorkspace<unknown>, workingDirectory: string) {
    const specs = resolveMigrationSourceSpecs({
        workspace,
        fernWorkspace: {} as FernWorkspace,
        generator: typescriptGenerator()
    });
    return serializeMigrationSource({ specs, workingDirectory });
}

function sdkConfigDocument(source: ReturnType<typeof migrate>): unknown {
    return {
        api: { audiences: [] },
        schemaVersion: "sdk-config/v1",
        sdkName: "lattice",
        source,
        targets: [{ language: "typescript", output: { delivery: "zip" } }]
    };
}

function ossWorkspace({
    absoluteFilePath,
    allSpecs,
    specs,
    definitions
}: {
    absoluteFilePath: string;
    allSpecs: Spec[];
    specs: Spec[];
    definitions: generatorsYml.APIDefinitionLocation[];
}): AbstractAPIWorkspace<unknown> {
    return {
        absoluteFilePath: AbsoluteFilePath.of(absoluteFilePath),
        allSpecs,
        specs,
        generatorsConfiguration: { api: { type: "singleNamespace", definitions } }
    } as unknown as AbstractAPIWorkspace<unknown>;
}

function openApiSpec(absoluteFilepath: string, { overrides }: { overrides?: string } = {}): Spec {
    return {
        type: "openapi",
        absoluteFilepath: AbsoluteFilePath.of(absoluteFilepath),
        absoluteFilepathToOverrides: overrides == null ? undefined : AbsoluteFilePath.of(overrides),
        absoluteFilepathToOverlays: undefined,
        source: { type: "openapi", file: AbsoluteFilePath.of(absoluteFilepath) }
    };
}

function protobufSpec({
    root,
    target,
    overrides,
    generateLocally = false,
    fromOpenAPI = false,
    dependencies = []
}: {
    root: string;
    target?: string;
    overrides?: string | string[];
    generateLocally?: boolean;
    fromOpenAPI?: boolean;
    dependencies?: string[];
}): ProtobufSpec {
    return {
        type: "protobuf",
        absoluteFilepathToProtobufRoot: AbsoluteFilePath.of(root),
        absoluteFilepathToProtobufTarget: target == null ? undefined : AbsoluteFilePath.of(target),
        absoluteFilepathToOverrides:
            overrides == null
                ? undefined
                : Array.isArray(overrides)
                  ? overrides.map((override) => AbsoluteFilePath.of(override))
                  : AbsoluteFilePath.of(overrides),
        relativeFilepathToProtobufRoot: RelativeFilePath.of(path.basename(root)),
        generateLocally,
        fromOpenAPI,
        dependencies
    };
}

function openApiDefinition(configuredPath: string): generatorsYml.APIDefinitionLocation {
    return {
        schema: { type: "oss", path: configuredPath },
        origin: undefined,
        overrides: undefined,
        overlays: undefined,
        audiences: undefined,
        settings: undefined
    };
}

function protoDefinition({
    root,
    target = "",
    localGeneration = false,
    fromOpenAPI = false
}: {
    root: string;
    target?: string;
    localGeneration?: boolean;
    fromOpenAPI?: boolean;
}): generatorsYml.APIDefinitionLocation {
    return {
        schema: { type: "protobuf", root, target, localGeneration, fromOpenAPI, dependencies: [] },
        origin: undefined,
        overrides: undefined,
        overlays: undefined,
        audiences: [],
        settings: undefined
    };
}

function typescriptGenerator(): generatorsYml.GeneratorInvocation {
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
        language: "typescript",
        name: "fernapi/fern-typescript-sdk",
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined,
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        version: "3.63.3"
    };
}
