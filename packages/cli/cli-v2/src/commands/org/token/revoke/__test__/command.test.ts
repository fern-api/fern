import type { Logger } from "@fern-api/logger";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CliError } from "../../../../../errors/CliError.js";
import { RevokeTokenCommand } from "../command.js";

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

describe("RevokeTokenCommand", () => {
    let cmd: RevokeTokenCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new RevokeTokenCommand();
    });

    it("should revoke a token successfully", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockRevoke = vi.fn().mockResolvedValue({ ok: true });
        vi.mocked(createVenusService).mockReturnValue({
            apiKeys: { revokeTokenById: mockRevoke }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { tokenId: "tok_123" } as RevokeTokenCommand.Args);

        expect(mockRevoke).toHaveBeenCalledWith("tok_123");
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("has been revoked"));
    });

    it("should reject organization tokens", async () => {
        const context = createMockContext("organization");

        await expect(cmd.handle(context, { tokenId: "tok_123" } as RevokeTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("Organization tokens cannot revoke API tokens")
        );
    });

    it("should handle UnauthorizedError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockRevoke = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: any) => visitor.unauthorizedError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            apiKeys: { revokeTokenById: mockRevoke }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { tokenId: "tok_123" } as RevokeTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("not authorized to revoke"));
    });

    it("should handle TokenNotFoundError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockRevoke = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: any) => visitor.tokenNotFoundError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            apiKeys: { revokeTokenById: mockRevoke }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { tokenId: "tok_123" } as RevokeTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("was not found"));
    });

    it("should handle unknown errors", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockRevoke = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: any) => visitor._other()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            apiKeys: { revokeTokenById: mockRevoke }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { tokenId: "tok_123" } as RevokeTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to revoke token"));
    });
});
