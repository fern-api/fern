import type { Logger } from "@fern-api/logger";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CliError } from "../../../../../errors/CliError.js";
import { InviteMemberCommand } from "../command.js";

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

describe("InviteMemberCommand", () => {
    let cmd: InviteMemberCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new InviteMemberCommand();
    });

    it("should invite a member successfully", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockInviteUser = vi.fn().mockResolvedValue({ ok: true });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, inviteUser: mockInviteUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args);

        expect(mockGet).toHaveBeenCalledWith("acme");
        expect(mockInviteUser).toHaveBeenCalledWith({
            emailAddress: "user@example.com",
            auth0OrgId: "org_abc123"
        });
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Invited"));
    });

    it("should output JSON when --json flag is set", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockInviteUser = vi.fn().mockResolvedValue({ ok: true });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, inviteUser: mockInviteUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, {
            email: "user@example.com",
            org: "acme",
            json: true
        } as InviteMemberCommand.Args);

        expect(context.stdout.info).toHaveBeenCalledWith(
            JSON.stringify({ success: true, email: "user@example.com", org: "acme" }, null, 2)
        );
        expect(context.stderr.info).not.toHaveBeenCalled();
    });

    it("should reject organization tokens", async () => {
        const context = createMockContext("organization");

        await expect(
            cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("Organization tokens cannot manage members")
        );
    });

    it("should handle org lookup failure", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { unauthorizedError: () => void }) => visitor.unauthorizedError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("do not have access to organization")
        );
    });

    it("should handle UnauthorizedError from inviteUser", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockInviteUser = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { unauthorizedError: () => void }) => visitor.unauthorizedError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, inviteUser: mockInviteUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("do not have permission to invite"));
    });

    it("should handle UserIdDoesNotExistError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockInviteUser = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { userIdDoesNotExistError: () => void }) => visitor.userIdDoesNotExistError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, inviteUser: mockInviteUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("No user found with email"));
    });

    it("should handle unknown errors", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockInviteUser = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { _other: () => void }) => visitor._other()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet, inviteUser: mockInviteUser }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to invite member"));
    });
});
