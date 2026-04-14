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

describe("InviteMemberCommand", () => {
    let cmd: InviteMemberCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new InviteMemberCommand();
    });

    it("should invite a member successfully", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockInviteUser = vi.fn().mockResolvedValue({ ok: true });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { inviteUser: mockInviteUser }
        } as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args);

        expect(mockInviteUser).toHaveBeenCalledWith({
            emailAddress: "user@example.com",
            auth0OrgId: "acme"
        });
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Invited"));
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

    it("should handle UnauthorizedError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockInviteUser = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: Record<string, () => void>) => visitor.unauthorizedError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { inviteUser: mockInviteUser }
        } as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("do not have permission to invite"));
    });

    it("should handle UserIdDoesNotExistError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockInviteUser = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: Record<string, () => void>) => visitor.userIdDoesNotExistError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { inviteUser: mockInviteUser }
        } as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("No user found with email"));
    });

    it("should handle unknown errors", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockInviteUser = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: Record<string, () => void>) => visitor._other()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { inviteUser: mockInviteUser }
        } as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(
            cmd.handle(context, { email: "user@example.com", org: "acme" } as InviteMemberCommand.Args)
        ).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to invite member"));
    });
});
