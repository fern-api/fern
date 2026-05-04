import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

function mockOrgLookupSuccess() {
    return vi.fn().mockResolvedValue({
        ok: true,
        body: { auth0Id: "org_abc123" }
    });
}

describe("CreateTokenCommand", () => {
    let cmd: CreateTokenCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new CreateTokenCommand();
    });

    it("should create a token successfully", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockCreate = vi.fn().mockResolvedValue({
            ok: true,
            body: { tokenId: "tok_123", token: "fern_abc123" }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { create: mockCreate }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme", description: "CI token" } as CreateTokenCommand.Args);

        expect(mockGet).toHaveBeenCalledWith("acme");
        expect(mockCreate).toHaveBeenCalledWith({
            organizationId: "org_abc123",
            description: "CI token"
        });
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Token created successfully"));
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("tok_123"));
        expect(context.stdout.info).toHaveBeenCalledWith("fern_abc123");
    });

    it("should output JSON when --json flag is set", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockCreate = vi.fn().mockResolvedValue({
            ok: true,
            body: { tokenId: "tok_123", token: "fern_abc123" }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { create: mockCreate }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme", description: "CI token", json: true } as CreateTokenCommand.Args);

        expect(context.stdout.info).toHaveBeenCalledWith(
            JSON.stringify({ tokenId: "tok_123", token: "fern_abc123" }, null, 2)
        );
        expect(context.stderr.info).not.toHaveBeenCalled();
    });

    it("should reject organization tokens", async () => {
        const context = createMockContext("organization");

        await expect(cmd.handle(context, { org: "acme" } as CreateTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("Organization tokens cannot manage API tokens")
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
        await expect(cmd.handle(context, { org: "acme" } as CreateTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("was not found"));
    });

    it("should handle UnauthorizedError from apiKeys.create", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockCreate = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { unauthorizedError: () => void }) => visitor.unauthorizedError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { create: mockCreate }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as CreateTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("do not have access to organization")
        );
    });

    it("should handle OrganizationNotFoundError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockCreate = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { organizationNotFoundError: () => void }) => visitor.organizationNotFoundError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { create: mockCreate }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as CreateTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("was not found"));
    });

    it("should handle unknown errors", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockCreate = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { _other: () => void }) => visitor._other()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { create: mockCreate }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as CreateTokenCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to create token"));
    });
});
