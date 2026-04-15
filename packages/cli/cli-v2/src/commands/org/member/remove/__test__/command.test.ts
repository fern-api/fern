import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RemoveMemberCommand } from "../command.js";

vi.mock("@fern-api/core", () => ({
    createVenusService: vi.fn()
}));

vi.mock("../../../../../ui/withSpinner.js", () => ({
    withSpinner: vi.fn(({ operation }: { operation: () => Promise<unknown> }) => operation())
}));

function createMockLogger(): Logger {
    return {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
}

function createMockContext(tokenType: "user" | "organization" = "user") {
    return {
        stdout: createMockLogger(),
        stderr: createMockLogger(),
        getTokenOrPrompt: vi.fn().mockResolvedValue({ type: tokenType, value: "test-token" })
    } as unknown as import("../../../../../context/Context.js").Context;
}

function mockOrgLookupSuccess() {
    return vi.fn().mockResolvedValue({
        ok: true,
        body: { auth0Id: "org_abc123" }
    });
}

describe("RemoveMemberCommand", () => {
    let cmd: RemoveMemberCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new RemoveMemberCommand();
    });

    it("should remove a member successfully", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockRemoveUser = vi.fn().mockResolvedValue({ ok: true });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, removeUser: mockRemoveUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { userId: "user123", org: "acme" } as RemoveMemberCommand.Args);

        expect(mockGet).toHaveBeenCalledWith("acme");
        expect(mockRemoveUser).toHaveBeenCalledWith({
            userId: "user123",
            auth0OrgId: "org_abc123"
        });
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Removed user"));
    });

    it("should output JSON when --json flag is set", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockRemoveUser = vi.fn().mockResolvedValue({ ok: true });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, removeUser: mockRemoveUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { userId: "user123", org: "acme", json: true } as RemoveMemberCommand.Args);

        expect(context.stdout.info).toHaveBeenCalledWith(
            JSON.stringify({ success: true, userId: "user123", org: "acme" }, null, 2)
        );
        expect(context.stderr.info).not.toHaveBeenCalled();
    });

    it("should reject organization tokens", async () => {
        const context = createMockContext("organization");

        await expect(
            cmd.handle(context, { userId: "user123", org: "acme" } as RemoveMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("Organization tokens cannot remove members")
        );
    });

    it("should handle org lookup failure", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { _other: () => void }) => visitor._other()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { userId: "user123", org: "acme" } as RemoveMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("was not found"));
    });

    it("should handle UnauthorizedError from removeUser", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockRemoveUser = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { unauthorizedError: () => void }) => visitor.unauthorizedError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, removeUser: mockRemoveUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { userId: "user123", org: "acme" } as RemoveMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("do not have permission to remove members")
        );
    });

    it("should handle UserIdDoesNotExistError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockRemoveUser = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { userIdDoesNotExistError: () => void }) => visitor.userIdDoesNotExistError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, removeUser: mockRemoveUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { userId: "user123", org: "acme" } as RemoveMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("was not found"));
    });

    it("should handle unknown errors", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockRemoveUser = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { _other: () => void }) => visitor._other()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, removeUser: mockRemoveUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { userId: "user123", org: "acme" } as RemoveMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to remove member"));
    });
});
