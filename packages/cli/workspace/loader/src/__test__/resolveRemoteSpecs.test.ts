import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import * as Github from "@fern-api/github";
import { createMockTaskContext } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resolveRemoteSpecs } from "../resolveRemoteSpecs.js";

vi.mock("@fern-api/github", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/github")>()),
    cloneRepositoryAtRef: vi.fn()
}));

describe("resolveRemoteSpecs", () => {
    const context = createMockTaskContext();
    const cloneRepositoryAtRef = vi.mocked(Github.cloneRepositoryAtRef);

    beforeEach(() => {
        vi.clearAllMocks();
        cloneRepositoryAtRef.mockResolvedValue("/tmp/mock-clone-dir");
    });

    it("returns definitions unchanged when no git sources are present", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "./openapi.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined
            }
        ];

        const result = await resolveRemoteSpecs({ definitions, context });
        expect(result).toBe(definitions); // same reference (short-circuit)
    });

    it("resolves git source definitions to local paths", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "openapi/service.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs.git",
                    ref: "main",
                    path: "openapi/service.yml"
                }
            }
        ];

        const result = await resolveRemoteSpecs({ definitions, context });

        expect(cloneRepositoryAtRef).toHaveBeenCalledWith({
            repositoryUrl: "https://github.com/org/specs.git",
            ref: "main"
        });

        expect(result[0]?.gitSource).toBeUndefined();
        expect(result[0]?.schema.type).toBe("oss");
        if (result[0]?.schema.type === "oss") {
            expect(result[0].schema.path).toBe(AbsoluteFilePath.of("/tmp/mock-clone-dir/openapi/service.yml"));
        }
    });

    it("deduplicates clones for same repo+ref", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "openapi/a.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs.git",
                    ref: "main",
                    path: "openapi/a.yml"
                }
            },
            {
                schema: { type: "oss", path: "openapi/b.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs.git",
                    ref: "main",
                    path: "openapi/b.yml"
                }
            }
        ];

        await resolveRemoteSpecs({ definitions, context });

        // Should only clone once since both use the same repo+ref
        expect(cloneRepositoryAtRef).toHaveBeenCalledTimes(1);
    });

    it("clones different repos separately", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "openapi/a.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs-a.git",
                    ref: "main",
                    path: "openapi/a.yml"
                }
            },
            {
                schema: { type: "oss", path: "openapi/b.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs-b.git",
                    ref: "v1.0",
                    path: "openapi/b.yml"
                }
            }
        ];

        await resolveRemoteSpecs({ definitions, context });

        expect(cloneRepositoryAtRef).toHaveBeenCalledTimes(2);
    });

    it("forwards an undefined ref to clone the default branch", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "spec.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs.git",
                    ref: undefined,
                    path: "spec.yml"
                }
            }
        ];

        await resolveRemoteSpecs({ definitions, context });

        expect(cloneRepositoryAtRef).toHaveBeenCalledWith({
            repositoryUrl: "https://github.com/org/specs.git",
            ref: undefined
        });
    });

    it("throws auth error on authentication failure", async () => {
        cloneRepositoryAtRef.mockRejectedValue(
            new Error("Failed to clone https://github.com/org/private.git: authentication failed")
        );

        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "spec.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/private.git",
                    ref: "main",
                    path: "spec.yml"
                }
            }
        ];

        await expect(resolveRemoteSpecs({ definitions, context })).rejects.toThrow("authentication failed");
    });

    it("throws not-found error when repo does not exist", async () => {
        cloneRepositoryAtRef.mockRejectedValue(
            new Error("Failed to clone https://github.com/org/nonexistent.git: repository not found")
        );

        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "spec.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/nonexistent.git",
                    ref: "main",
                    path: "spec.yml"
                }
            }
        ];

        await expect(resolveRemoteSpecs({ definitions, context })).rejects.toThrow("repository not found");
    });

    it("resolves protobuf definitions correctly (root and target)", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: {
                    type: "protobuf",
                    root: "proto/",
                    target: "proto/user/v1/user.proto",
                    localGeneration: false,
                    fromOpenAPI: false,
                    dependencies: []
                },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/proto-defs.git",
                    ref: "v2.0",
                    path: "proto/"
                }
            }
        ];

        const result = await resolveRemoteSpecs({ definitions, context });

        expect(result[0]?.gitSource).toBeUndefined();
        expect(result[0]?.resolvedAbsolutePath).toBe(true);
        if (result[0]?.schema.type === "protobuf") {
            expect(result[0].schema.root).toBe(AbsoluteFilePath.of("/tmp/mock-clone-dir/proto"));
            expect(result[0].schema.target).toBe("/tmp/mock-clone-dir/proto/user/v1/user.proto");
        }
    });

    it("resolves protobuf target as empty string when not specified", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: {
                    type: "protobuf",
                    root: "proto/",
                    target: "",
                    localGeneration: false,
                    fromOpenAPI: false,
                    dependencies: []
                },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/proto-defs.git",
                    ref: "v2.0",
                    path: "proto/"
                }
            }
        ];

        const result = await resolveRemoteSpecs({ definitions, context });

        if (result[0]?.schema.type === "protobuf") {
            expect(result[0].schema.target).toBe("");
        }
    });

    it("forwards commit SHA refs", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "openapi/service.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs.git",
                    ref: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
                    path: "openapi/service.yml"
                }
            }
        ];

        await resolveRemoteSpecs({ definitions, context });

        expect(cloneRepositoryAtRef).toHaveBeenCalledWith({
            repositoryUrl: "https://github.com/org/specs.git",
            ref: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
        });
    });

    it("forwards branch and tag refs", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "spec.yml" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs.git",
                    ref: "v1.2.3",
                    path: "spec.yml"
                }
            }
        ];

        await resolveRemoteSpecs({ definitions, context });

        expect(cloneRepositoryAtRef).toHaveBeenCalledWith({
            repositoryUrl: "https://github.com/org/specs.git",
            ref: "v1.2.3"
        });
    });

    it("rejects absolute paths that escape the cloned directory", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "/etc/passwd" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs.git",
                    ref: "main",
                    path: "/etc/passwd"
                }
            }
        ];

        await expect(resolveRemoteSpecs({ definitions, context })).rejects.toThrow(
            "path must be relative to the repository root and cannot traverse outside it"
        );
    });

    it("rejects paths with directory traversal sequences", async () => {
        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: { type: "oss", path: "../../proc/self/environ" },
                origin: undefined,
                overrides: undefined,
                overlays: undefined,
                audiences: [],
                settings: undefined,
                gitSource: {
                    repo: "https://github.com/org/specs.git",
                    ref: "main",
                    path: "../../proc/self/environ"
                }
            }
        ];

        await expect(resolveRemoteSpecs({ definitions, context })).rejects.toThrow(
            "path must be relative to the repository root and cannot traverse outside it"
        );
    });
});
