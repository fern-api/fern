import type { Logger } from "@fern-api/logger";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CliError } from "../../../../../errors/CliError.js";
import { ListTokensCommand } from "../command.js";

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

describe("ListTokensCommand", () => {
    let cmd: ListTokensCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new ListTokensCommand();
    });

    it("should list tokens successfully", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockGetTokens = vi.fn().mockResolvedValue({
            ok: true,
            body: [
                {
                    tokenId: "tok_1",
                    status: { type: "active" },
                    createdTime: new Date("2026-01-01"),
                    description: "CI token"
                },
                {
                    tokenId: "tok_2",
                    status: { type: "revoked" },
                    createdTime: new Date("2026-02-01"),
                    description: null
                }
            ]
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { getTokensForOrganization: mockGetTokens }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme" } as ListTokensCommand.Args);

        expect(mockGet).toHaveBeenCalledWith("acme");
        expect(mockGetTokens).toHaveBeenCalledWith("org_abc123");
        expect(context.stdout.info).toHaveBeenCalledTimes(2);
    });

    it("should output JSON when --json flag is set", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockGetTokens = vi.fn().mockResolvedValue({
            ok: true,
            body: [
                {
                    tokenId: "tok_1",
                    status: { type: "active" },
                    createdTime: new Date("2026-01-01T00:00:00.000Z"),
                    description: "CI token"
                }
            ]
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { getTokensForOrganization: mockGetTokens }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme", json: true } as ListTokensCommand.Args);

        expect(context.stdout.info).toHaveBeenCalledWith(
            JSON.stringify(
                [
                    {
                        tokenId: "tok_1",
                        status: "active",
                        createdTime: "2026-01-01T00:00:00.000Z",
                        description: "CI token"
                    }
                ],
                null,
                2
            )
        );
    });

    it("should show empty message when no tokens", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockGetTokens = vi.fn().mockResolvedValue({
            ok: true,
            body: []
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { getTokensForOrganization: mockGetTokens }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme" } as ListTokensCommand.Args);

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("No tokens found"));
    });

    it("should reject organization tokens", async () => {
        const context = createMockContext("organization");

        await expect(cmd.handle(context, { org: "acme" } as ListTokensCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("Organization tokens cannot list API tokens")
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
        await expect(cmd.handle(context, { org: "acme" } as ListTokensCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("do not have access to organization")
        );
    });

    it("should handle UnauthorizedError from getTokensForOrganization", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockGetTokens = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { unauthorizedError: () => void }) => visitor.unauthorizedError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { getTokensForOrganization: mockGetTokens }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as ListTokensCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("do not have access to organization")
        );
    });

    it("should handle OrganizationNotFoundError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockGetTokens = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { organizationNotFoundError: () => void }) => visitor.organizationNotFoundError()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { getTokensForOrganization: mockGetTokens }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as ListTokensCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("was not found"));
    });

    it("should handle unknown errors", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = mockOrgLookupSuccess();
        const mockGetTokens = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { _other: () => void }) => visitor._other()
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet },
            apiKeys: { getTokensForOrganization: mockGetTokens }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as ListTokensCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to list tokens"));
    });
});
