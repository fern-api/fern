import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext, type TaskContext } from "@fern-api/task-context";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createFernDirectoryAndWorkspace } from "../createFernDirectoryAndOrganization.js";
import { createProtoWorkspace } from "../createProtoWorkspace.js";
import { createGrpcWorkspace } from "../createWorkspace.js";
import { initializeAPI } from "../initializeAPI.js";

vi.mock("../createFernDirectoryAndOrganization.js", () => ({ createFernDirectoryAndWorkspace: vi.fn() }));
vi.mock("../createProtoWorkspace.js", () => ({ createProtoWorkspace: vi.fn() }));
vi.mock("../createWorkspace.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../createWorkspace.js")>()),
    createGrpcWorkspace: vi.fn()
}));

describe("initializeAPI", () => {
    it("rejects Fern Definition initialization without exposing internal generation details", async () => {
        const failAndThrow = vi.fn((message: string | undefined) => {
            throw new Error(message);
        });
        const context = { failAndThrow } as unknown as TaskContext;
        await expect(
            initializeAPI({
                organization: "fern",
                versionOfCli: "0.0.0",
                openApiPath: undefined,
                useFernDefinition: true,
                useSdkConfig: true,
                includeDocs: false,
                context
            })
        ).rejects.toBeDefined();

        const message = failAndThrow.mock.calls[0]?.[0] ?? "";
        expect(message).toContain("fern init --openapi <path-or-url>");
        expect(message).not.toContain("FERN_USE_SDK_GEN_API");
        expect(message).not.toContain("SDK Gen API");
    });

    it("rejects gRPC initialization when SDK Config is enabled", async () => {
        const failAndThrow = vi.fn((message: string | undefined) => {
            throw new Error(message);
        });
        const context = { failAndThrow } as unknown as TaskContext;
        await expect(
            initializeAPI({
                organization: "fern",
                versionOfCli: "0.0.0",
                openApiPath: undefined,
                useFernDefinition: false,
                useSdkConfig: true,
                includeDocs: false,
                useGrpc: true,
                context
            })
        ).rejects.toBeDefined();

        expect(failAndThrow.mock.calls[0]?.[0]).toContain("gRPC initialization is not supported");
    });

    describe("gRPC workspaces", () => {
        let fernDirectory: string | undefined;

        afterEach(async () => {
            vi.resetAllMocks();
            if (fernDirectory != null) {
                await rm(fernDirectory, { recursive: true, force: true });
                fernDirectory = undefined;
            }
        });

        async function init(options: { useGrpc?: boolean; protoPath?: AbsoluteFilePath }): Promise<string> {
            fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-init-api-"));
            vi.mocked(createFernDirectoryAndWorkspace).mockResolvedValue({
                absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
                organization: "acme"
            });
            await initializeAPI({
                organization: "acme",
                versionOfCli: "0.0.0",
                openApiPath: undefined,
                useFernDefinition: false,
                useSdkConfig: false,
                includeDocs: false,
                context: createMockTaskContext(),
                ...options
            });
            return fernDirectory;
        }

        it("creates the sample gRPC workspace for useGrpc", async () => {
            const directory = await init({ useGrpc: true });

            expect(createGrpcWorkspace).toHaveBeenCalledWith(
                expect.objectContaining({ directoryOfWorkspace: directory })
            );
            expect(createProtoWorkspace).not.toHaveBeenCalled();
        });

        it("creates a workspace from the user's proto for protoPath", async () => {
            const protoPath = AbsoluteFilePath.of("/somewhere/protos");
            const directory = await init({ protoPath });

            expect(createProtoWorkspace).toHaveBeenCalledWith(
                expect.objectContaining({ directoryOfWorkspace: directory, protoPath })
            );
            expect(createGrpcWorkspace).not.toHaveBeenCalled();
        });

        it("rejects protoPath when SDK Config is enabled", async () => {
            const failAndThrow = vi.fn((message: string | undefined) => {
                throw new Error(message);
            });
            await expect(
                initializeAPI({
                    organization: "acme",
                    versionOfCli: "0.0.0",
                    openApiPath: undefined,
                    useFernDefinition: false,
                    useSdkConfig: true,
                    includeDocs: false,
                    protoPath: AbsoluteFilePath.of("/somewhere/protos"),
                    context: { failAndThrow } as unknown as TaskContext
                })
            ).rejects.toBeDefined();
            expect(createProtoWorkspace).not.toHaveBeenCalled();
        });
    });
});
