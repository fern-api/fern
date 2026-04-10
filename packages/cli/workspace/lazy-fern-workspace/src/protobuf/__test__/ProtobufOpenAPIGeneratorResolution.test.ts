import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext, TaskResult } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependencies before importing the module under test
vi.mock("@fern-api/logging-execa", () => ({
    createLoggingExecutable: vi.fn()
}));

vi.mock("../ProtocGenOpenAPIDownloader.js", () => ({
    resolveProtocGenOpenAPI: vi.fn()
}));

vi.mock("../utils.js", () => ({
    ensureBufCommand: vi.fn(),
    detectAirGappedModeForProtobuf: vi.fn(),
    getProtobufYamlV1: vi.fn().mockReturnValue("version: v1\n")
}));

vi.mock("fs/promises", async () => {
    const actual = await vi.importActual<typeof import("fs/promises")>("fs/promises");
    return {
        ...actual,
        cp: vi.fn(),
        writeFile: vi.fn(),
        readFile: vi.fn(),
        rename: vi.fn(),
        unlink: vi.fn(),
        access: vi.fn()
    };
});

vi.mock("tmp-promise", () => ({
    default: {
        dir: vi.fn().mockResolvedValue({ path: "/tmp/test-dir" }),
        file: vi.fn().mockResolvedValue({ path: "/tmp/test-file.yaml" })
    }
}));

import { createLoggingExecutable, LoggingExecutable } from "@fern-api/logging-execa";
import { ProtobufOpenAPIGenerator } from "../ProtobufOpenAPIGenerator.js";
import { resolveProtocGenOpenAPI } from "../ProtocGenOpenAPIDownloader.js";
import { ensureBufCommand } from "../utils.js";

function createMockTaskContext(): TaskContext {
    return {
        logger: {
            disable: vi.fn(),
            enable: vi.fn(),
            trace: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            log: vi.fn()
        },
        takeOverTerminal: async () => {
            return;
        },
        failAndThrow: vi.fn((message?: string) => {
            throw new Error(message ?? "Task failed");
        }) as unknown as TaskContext["failAndThrow"],
        failWithoutThrowing: vi.fn(),
        getResult: () => TaskResult.Success,
        addInteractiveTask: () => {
            throw new Error("Not implemented in mock");
        },
        runInteractiveTask: async () => false,
        instrumentPostHogEvent: () => {
            return;
        }
    };
}

describe("ProtobufOpenAPIGenerator resolution order", () => {
    let context: TaskContext;
    let mockWhichExecutable: ReturnType<typeof vi.fn>;
    let mockBufExecutable: ReturnType<typeof vi.fn>;
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        context = createMockTaskContext();
        process.env = { ...originalEnv };

        // Mock buf command
        vi.mocked(ensureBufCommand).mockResolvedValue("buf");

        // Default mock for createLoggingExecutable
        mockWhichExecutable = vi.fn();
        mockBufExecutable = vi.fn().mockResolvedValue({ exitCode: 0, stdout: "", stderr: "" });
        vi.mocked(createLoggingExecutable).mockImplementation(
            (cmd: string) => (cmd === "which" ? mockWhichExecutable : mockBufExecutable) as unknown as LoggingExecutable
        );
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.clearAllMocks();
    });

    describe("ensureProtocGenOpenAPIResolved (via prepare)", () => {
        it("prefers auto-downloaded fern fork over PATH", async () => {
            const cachedDir = AbsoluteFilePath.of("/home/user/.fern/bin");
            vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(cachedDir);

            const generator = new ProtobufOpenAPIGenerator({ context });
            const result = await generator.prepare({
                absoluteFilepathToProtobufRoot: AbsoluteFilePath.of("/tmp/proto"),
                relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                local: true,
                deps: []
            });

            // Auto-download should be called
            expect(resolveProtocGenOpenAPI).toHaveBeenCalledOnce();

            // which should NOT be called (auto-download succeeded, no fallback needed)
            expect(mockWhichExecutable).not.toHaveBeenCalled();

            // envOverride should include the cached directory in PATH
            expect(result.envOverride).toBeDefined();
            expect(result.envOverride?.PATH).toContain("/home/user/.fern/bin");
        });

        it("falls back to PATH when auto-download returns undefined", async () => {
            vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(undefined);
            mockWhichExecutable.mockResolvedValue({ stdout: "/usr/local/bin/protoc-gen-openapi" });

            const generator = new ProtobufOpenAPIGenerator({ context });
            const result = await generator.prepare({
                absoluteFilepathToProtobufRoot: AbsoluteFilePath.of("/tmp/proto"),
                relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                local: true,
                deps: []
            });

            // Auto-download should be called first
            expect(resolveProtocGenOpenAPI).toHaveBeenCalledOnce();

            // which should be called as fallback
            expect(mockWhichExecutable).toHaveBeenCalledWith(["protoc-gen-openapi"]);

            // envOverride should be undefined (using PATH version)
            expect(result.envOverride).toBeUndefined();
        });

        it("throws error when both auto-download and PATH fail", async () => {
            vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(undefined);
            mockWhichExecutable.mockRejectedValue(new Error("not found"));

            const generator = new ProtobufOpenAPIGenerator({ context });

            await expect(
                generator.prepare({
                    absoluteFilepathToProtobufRoot: AbsoluteFilePath.of("/tmp/proto"),
                    relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                    local: true,
                    deps: []
                })
            ).rejects.toThrow("Missing required dependency");
        });

        it("does not call auto-download when FERN_USE_LOCAL_PROTOC_GEN_OPENAPI=true", async () => {
            process.env.FERN_USE_LOCAL_PROTOC_GEN_OPENAPI = "true";
            mockWhichExecutable.mockResolvedValue({ stdout: "/custom/path/protoc-gen-openapi" });

            const generator = new ProtobufOpenAPIGenerator({ context });
            const result = await generator.prepare({
                absoluteFilepathToProtobufRoot: AbsoluteFilePath.of("/tmp/proto"),
                relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                local: true,
                deps: []
            });

            // Auto-download should NOT be called
            expect(resolveProtocGenOpenAPI).not.toHaveBeenCalled();

            // which should be called instead
            expect(mockWhichExecutable).toHaveBeenCalledWith(["protoc-gen-openapi"]);

            // envOverride should be undefined (using PATH version)
            expect(result.envOverride).toBeUndefined();
        });

        it("throws when FERN_USE_LOCAL_PROTOC_GEN_OPENAPI=true but not on PATH", async () => {
            process.env.FERN_USE_LOCAL_PROTOC_GEN_OPENAPI = "true";
            mockWhichExecutable.mockRejectedValue(new Error("not found"));

            const generator = new ProtobufOpenAPIGenerator({ context });

            await expect(
                generator.prepare({
                    absoluteFilepathToProtobufRoot: AbsoluteFilePath.of("/tmp/proto"),
                    relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                    local: true,
                    deps: []
                })
            ).rejects.toThrow("FERN_USE_LOCAL_PROTOC_GEN_OPENAPI is set but protoc-gen-openapi was not found on PATH");
        });

        it("does not trigger auto-download for non-true FERN_USE_LOCAL_PROTOC_GEN_OPENAPI values", async () => {
            // Test that only strict "true" bypasses auto-download
            process.env.FERN_USE_LOCAL_PROTOC_GEN_OPENAPI = "1";
            const cachedDir = AbsoluteFilePath.of("/home/user/.fern/bin");
            vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(cachedDir);

            const generator = new ProtobufOpenAPIGenerator({ context });
            await generator.prepare({
                absoluteFilepathToProtobufRoot: AbsoluteFilePath.of("/tmp/proto"),
                relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                local: true,
                deps: []
            });

            // Auto-download SHOULD be called (env var is "1" not "true")
            expect(resolveProtocGenOpenAPI).toHaveBeenCalledOnce();
        });

        it("caches resolution result across multiple calls", async () => {
            const cachedDir = AbsoluteFilePath.of("/home/user/.fern/bin");
            vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(cachedDir);

            const generator = new ProtobufOpenAPIGenerator({ context });

            // First call
            await generator.prepare({
                absoluteFilepathToProtobufRoot: AbsoluteFilePath.of("/tmp/proto"),
                relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                local: true,
                deps: []
            });

            // Second call
            await generator.prepare({
                absoluteFilepathToProtobufRoot: AbsoluteFilePath.of("/tmp/proto"),
                relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                local: true,
                deps: []
            });

            // resolveProtocGenOpenAPI should only be called once
            expect(resolveProtocGenOpenAPI).toHaveBeenCalledOnce();
        });
    });
});
