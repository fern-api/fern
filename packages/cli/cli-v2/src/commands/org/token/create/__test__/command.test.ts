import type { Logger } from "@fern-api/logger";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CliError } from "../../../../../errors/CliError.js";
import { CreateTokenCommand } from "../command.js";

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

describe("CreateTokenCommand", () => {
    let cmd: CreateTokenCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new CreateTokenCommand();
    });

    it("should create a token successfully", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockCreate = vi.fn().mockResolvedValue({
            ok: true,
            body: { tokenId: "tok_123", token: "fern_abc123" }
        });
        vi.mocked(createVenusService).mockReturnValue({
            apiKeys: { create: mockCreate }
        } as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme", description: "CI token" } as CreateTokenCommand.Args);

        expect(mockCreate).toHaveBeenCalledWith({
            organizationId: "acme",
            description: "CI token"
        });
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Token created successfully"));
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("tok_123"));
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("fern_abc123"));
    });

    it("should reject organization tokens", async () => {
        const context = createMockContext("organization");

        await expect(cmd.handle(context, { org: "acme" } as CreateTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("Organization tokens cannot manage API tokens")
        );
    });

    it("should handle UnauthorizedError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockCreate = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: Record<string, () => void>) => visitor.unauthorizedError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            apiKeys: { create: mockCreate }
        } as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as CreateTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("do not have access to organization")
        );
    });

    it("should handle OrganizationNotFoundError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockCreate = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: Record<string, () => void>) => visitor.organizationNotFoundError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            apiKeys: { create: mockCreate }
        } as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as CreateTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("was not found"));
    });

    it("should handle unknown errors", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockCreate = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: Record<string, () => void>) => visitor._other()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            apiKeys: { create: mockCreate }
        } as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as CreateTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to create token"));
    });
});
