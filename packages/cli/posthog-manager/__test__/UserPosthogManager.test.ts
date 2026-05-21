import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAlias, mockCapture, mockDoesPathExist, mockFlush, mockMkdir, mockReadFile, mockUuid, mockWriteFile } =
    vi.hoisted(() => ({
        mockAlias: vi.fn(),
        mockCapture: vi.fn(),
        mockDoesPathExist: vi.fn(async () => false),
        mockFlush: vi.fn(async () => undefined),
        mockMkdir: vi.fn(async () => undefined),
        mockReadFile: vi.fn(async () => Buffer.from("persisted-id")),
        mockUuid: vi.fn(() => "generated-id"),
        mockWriteFile: vi.fn(async () => undefined)
    }));

vi.mock("@fern-api/cli-telemetry", () => ({
    getRunIdProperties: () => ({})
}));

vi.mock("@fern-api/core", () => ({
    createVenusService: vi.fn()
}));

vi.mock("@fern-api/fs-utils", () => ({
    AbsoluteFilePath: {
        of: (path: string) => path
    },
    RelativeFilePath: {
        of: (path: string) => path
    },
    doesPathExist: mockDoesPathExist,
    join: (...parts: string[]) => parts.join("/")
}));

vi.mock("fs/promises", () => ({
    mkdir: mockMkdir,
    readFile: mockReadFile,
    writeFile: mockWriteFile
}));

vi.mock("os", () => ({
    homedir: () => "/Users/test"
}));

vi.mock("posthog-node", () => ({
    PostHog: class {
        public readonly alias = mockAlias;
        public readonly capture = mockCapture;
        public readonly flush = mockFlush;
    }
}));

vi.mock("uuid", () => ({
    v4: mockUuid
}));

import { UserPosthogManager } from "../src/UserPosthogManager.js";

describe("UserPosthogManager", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDoesPathExist.mockResolvedValue(false);
        mockMkdir.mockResolvedValue(undefined);
        mockReadFile.mockResolvedValue(Buffer.from("persisted-id"));
        mockUuid.mockReturnValue("generated-id");
        mockWriteFile.mockResolvedValue(undefined);
    });

    it("falls back to an in-memory distinct ID when persisted ID storage is not writable", async () => {
        const manager = new UserPosthogManager({ token: undefined, posthogApiKey: "test-api-key" });
        mockMkdir.mockRejectedValue(
            Object.assign(new Error("EPERM: operation not permitted, mkdir"), { code: "EPERM" })
        );

        await expect(manager.sendEvent({ command: "check" })).resolves.toBeUndefined();

        expect(mockCapture).toHaveBeenCalledWith(
            expect.objectContaining({
                distinctId: "generated-id"
            })
        );
        expect(mockWriteFile).not.toHaveBeenCalled();
        expect(mockReadFile).not.toHaveBeenCalled();
    });

    it("reuses the in-memory fallback after a storage failure", async () => {
        const manager = new UserPosthogManager({ token: undefined, posthogApiKey: "test-api-key" });
        mockMkdir.mockRejectedValue(
            Object.assign(new Error("EPERM: operation not permitted, mkdir"), { code: "EPERM" })
        );

        await manager.sendEvent({ command: "check" });
        await manager.sendEvent({ command: "generate" });

        expect(mockMkdir).toHaveBeenCalledTimes(1);
        expect(mockCapture).toHaveBeenCalledTimes(2);
        expect(mockCapture).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                distinctId: "generated-id"
            })
        );
    });
});
