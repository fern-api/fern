import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fern-api/lazy-fern-workspace", () => ({
    resolveBuf: vi.fn(),
    resolveProtocGenOpenAPI: vi.fn()
}));

import { resolveBuf, resolveProtocGenOpenAPI } from "@fern-api/lazy-fern-workspace";
import { CliContext } from "../../../cli-context/CliContext.js";
import { installDependencies } from "../installDependencies.js";

describe("installDependencies", () => {
    let mockContext: {
        logger: {
            info: ReturnType<typeof vi.fn>;
            error: ReturnType<typeof vi.fn>;
            warn: ReturnType<typeof vi.fn>;
            debug: ReturnType<typeof vi.fn>;
        };
        failAndThrow: ReturnType<typeof vi.fn>;
    };
    let mockCliContext: CliContext;

    beforeEach(() => {
        vi.clearAllMocks();

        mockContext = {
            logger: {
                info: vi.fn(),
                error: vi.fn(),
                warn: vi.fn(),
                debug: vi.fn()
            },
            failAndThrow: vi.fn((message: string) => {
                throw new Error(message);
            })
        };

        // Mock CliContext.runTask to invoke the callback with our mock context
        mockCliContext = {
            runTask: vi.fn(async (fn: (ctx: typeof mockContext) => Promise<void>) => {
                await fn(mockContext);
            })
        } as unknown as CliContext;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("succeeds when both buf and protoc-gen-openapi resolve", async () => {
        vi.mocked(resolveBuf).mockResolvedValue(AbsoluteFilePath.of("/home/user/.fern/bin/buf"));
        vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(AbsoluteFilePath.of("/home/user/.fern/bin"));

        await installDependencies({ cliContext: mockCliContext });

        expect(resolveBuf).toHaveBeenCalledOnce();
        expect(resolveProtocGenOpenAPI).toHaveBeenCalledOnce();
        expect(mockContext.logger.info).toHaveBeenCalledWith("All dependencies installed successfully.");
        expect(mockContext.failAndThrow).not.toHaveBeenCalled();
    });

    it("logs buf install path on success", async () => {
        const bufPath = AbsoluteFilePath.of("/home/user/.fern/bin/buf");
        vi.mocked(resolveBuf).mockResolvedValue(bufPath);
        vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(AbsoluteFilePath.of("/home/user/.fern/bin"));

        await installDependencies({ cliContext: mockCliContext });

        expect(mockContext.logger.info).toHaveBeenCalledWith(`buf installed: ${bufPath}`);
    });

    it("logs protoc-gen-openapi install path on success", async () => {
        const protocDir = AbsoluteFilePath.of("/home/user/.fern/bin");
        vi.mocked(resolveBuf).mockResolvedValue(AbsoluteFilePath.of("/home/user/.fern/bin/buf"));
        vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(protocDir);

        await installDependencies({ cliContext: mockCliContext });

        expect(mockContext.logger.info).toHaveBeenCalledWith(`protoc-gen-openapi installed: ${protocDir}`);
    });

    it("fails when buf resolution returns undefined", async () => {
        vi.mocked(resolveBuf).mockResolvedValue(undefined);
        vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(AbsoluteFilePath.of("/home/user/.fern/bin"));

        await expect(installDependencies({ cliContext: mockCliContext })).rejects.toThrow("Failed to install: buf");

        expect(mockContext.logger.error).toHaveBeenCalledWith("Failed to install buf");
        expect(mockContext.failAndThrow).toHaveBeenCalledWith(
            expect.stringContaining("Failed to install: buf"),
            undefined,
            { code: CliError.Code.EnvironmentError }
        );
    });

    it("fails when protoc-gen-openapi resolution returns undefined", async () => {
        vi.mocked(resolveBuf).mockResolvedValue(AbsoluteFilePath.of("/home/user/.fern/bin/buf"));
        vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(undefined);

        await expect(installDependencies({ cliContext: mockCliContext })).rejects.toThrow(
            "Failed to install: protoc-gen-openapi"
        );

        expect(mockContext.logger.error).toHaveBeenCalledWith("Failed to install protoc-gen-openapi");
    });

    it("reports both failures when both resolutions return undefined", async () => {
        vi.mocked(resolveBuf).mockResolvedValue(undefined);
        vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(undefined);

        await expect(installDependencies({ cliContext: mockCliContext })).rejects.toThrow(
            "Failed to install: buf, protoc-gen-openapi"
        );

        expect(mockContext.logger.error).toHaveBeenCalledWith("Failed to install buf");
        expect(mockContext.logger.error).toHaveBeenCalledWith("Failed to install protoc-gen-openapi");
    });

    it("calls resolveBuf before resolveProtocGenOpenAPI", async () => {
        const callOrder: string[] = [];

        vi.mocked(resolveBuf).mockImplementation(async () => {
            callOrder.push("buf");
            return AbsoluteFilePath.of("/home/user/.fern/bin/buf");
        });
        vi.mocked(resolveProtocGenOpenAPI).mockImplementation(async () => {
            callOrder.push("protoc-gen-openapi");
            return AbsoluteFilePath.of("/home/user/.fern/bin");
        });

        await installDependencies({ cliContext: mockCliContext });

        expect(callOrder).toEqual(["buf", "protoc-gen-openapi"]);
    });

    it("still attempts protoc-gen-openapi even if buf fails", async () => {
        vi.mocked(resolveBuf).mockResolvedValue(undefined);
        vi.mocked(resolveProtocGenOpenAPI).mockResolvedValue(AbsoluteFilePath.of("/home/user/.fern/bin"));

        await expect(installDependencies({ cliContext: mockCliContext })).rejects.toThrow();

        // Both should have been called
        expect(resolveBuf).toHaveBeenCalledOnce();
        expect(resolveProtocGenOpenAPI).toHaveBeenCalledOnce();
    });
});
