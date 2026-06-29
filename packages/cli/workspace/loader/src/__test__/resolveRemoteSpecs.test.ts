import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resolveRemoteSpecs } from "../resolveRemoteSpecs.js";

// Mock simple-git
vi.mock("simple-git", () => {
    const mockClone = vi.fn();
    return {
        simpleGit: () => ({
            clone: mockClone
        }),
        __mockClone: mockClone
    };
});

// Mock tmp-promise
vi.mock("tmp-promise", () => ({
    default: {
        dir: vi.fn().mockResolvedValue({ path: "/tmp/mock-clone-dir", cleanup: vi.fn() })
    }
}));

// Mock child_process for isGitAvailable
vi.mock("child_process", () => ({
    execSync: vi.fn().mockReturnValue("git version 2.40.0")
}));

describe("resolveRemoteSpecs", () => {
    const context = createMockTaskContext();

    beforeEach(() => {
        vi.clearAllMocks();
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
        const { __mockClone } = (await import("simple-git")) as unknown as { __mockClone: ReturnType<typeof vi.fn> };
        __mockClone.mockResolvedValue(undefined);

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

        expect(__mockClone).toHaveBeenCalledWith("https://github.com/org/specs.git", "/tmp/mock-clone-dir", [
            "--depth",
            "1",
            "--config",
            "core.symlinks=false",
            "--branch",
            "main"
        ]);

        expect(result[0]?.gitSource).toBeUndefined();
        expect(result[0]?.schema.type).toBe("oss");
        if (result[0]?.schema.type === "oss") {
            expect(result[0].schema.path).toBe(AbsoluteFilePath.of("/tmp/mock-clone-dir/openapi/service.yml"));
        }
    });

    it("deduplicates clones for same repo+ref", async () => {
        const { __mockClone } = (await import("simple-git")) as unknown as { __mockClone: ReturnType<typeof vi.fn> };
        __mockClone.mockResolvedValue(undefined);

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
        expect(__mockClone).toHaveBeenCalledTimes(1);
    });

    it("clones different repos separately", async () => {
        const { __mockClone } = (await import("simple-git")) as unknown as { __mockClone: ReturnType<typeof vi.fn> };
        __mockClone.mockResolvedValue(undefined);

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

        expect(__mockClone).toHaveBeenCalledTimes(2);
    });

    it("omits --branch flag when ref is undefined", async () => {
        const { __mockClone } = (await import("simple-git")) as unknown as { __mockClone: ReturnType<typeof vi.fn> };
        __mockClone.mockResolvedValue(undefined);

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

        expect(__mockClone).toHaveBeenCalledWith("https://github.com/org/specs.git", "/tmp/mock-clone-dir", [
            "--depth",
            "1",
            "--config",
            "core.symlinks=false"
        ]);
    });

    it("throws auth error on authentication failure", async () => {
        const { __mockClone } = (await import("simple-git")) as unknown as { __mockClone: ReturnType<typeof vi.fn> };
        __mockClone.mockRejectedValue(new Error("Authentication failed for 'https://github.com/org/private.git'"));

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
        const { __mockClone } = (await import("simple-git")) as unknown as { __mockClone: ReturnType<typeof vi.fn> };
        __mockClone.mockRejectedValue(new Error("Repository not found"));

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

    it("resolves protobuf definitions correctly", async () => {
        const { __mockClone } = (await import("simple-git")) as unknown as { __mockClone: ReturnType<typeof vi.fn> };
        __mockClone.mockResolvedValue(undefined);

        const definitions: generatorsYml.APIDefinitionLocation[] = [
            {
                schema: {
                    type: "protobuf",
                    root: "proto/",
                    target: "user/v1/user.proto",
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
        if (result[0]?.schema.type === "protobuf") {
            expect(result[0].schema.root).toBe(AbsoluteFilePath.of("/tmp/mock-clone-dir/proto"));
        }
    });

    it("rejects absolute paths that escape the cloned directory", async () => {
        const { __mockClone } = (await import("simple-git")) as unknown as { __mockClone: ReturnType<typeof vi.fn> };
        __mockClone.mockResolvedValue(undefined);

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
        const { __mockClone } = (await import("simple-git")) as unknown as { __mockClone: ReturnType<typeof vi.fn> };
        __mockClone.mockResolvedValue(undefined);

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
