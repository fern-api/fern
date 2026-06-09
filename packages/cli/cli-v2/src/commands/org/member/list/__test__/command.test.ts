import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListMembersCommand } from "../command.js";

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
        headers: { "X-Request-Id": "test-request-id" },
        getTokenOrPrompt: vi.fn().mockResolvedValue({ type: tokenType, value: "test-token" })
    } as unknown as import("../../../../../context/Context.js").Context;
}

describe("ListMembersCommand", () => {
    let cmd: ListMembersCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new ListMembersCommand();
    });

    it("should list members successfully", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = vi.fn().mockResolvedValue({
            ok: true,
            body: {
                users: [
                    { userId: "user1", displayName: "Alice", emailAddress: "alice@example.com" },
                    { userId: "user2", displayName: "Bob", emailAddress: null }
                ]
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme" } as ListMembersCommand.Args);

        expect(createVenusService).toHaveBeenCalledWith(
            expect.objectContaining({ headers: { "X-Request-Id": "test-request-id" } })
        );
        expect(mockGet).toHaveBeenCalledWith({ orgId: "acme" });
        expect(context.stdout.info).toHaveBeenCalledTimes(2);
    });

    it("should output JSON when --json flag is set", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = vi.fn().mockResolvedValue({
            ok: true,
            body: {
                users: [
                    { userId: "user1", displayName: "Alice", emailAddress: "alice@example.com" },
                    { userId: "user2", displayName: "Bob", emailAddress: null }
                ]
            }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme", json: true } as ListMembersCommand.Args);

        expect(context.stdout.info).toHaveBeenCalledWith(
            JSON.stringify(
                [
                    { userId: "user1", displayName: "Alice", email: "alice@example.com" },
                    { userId: "user2", displayName: "Bob", email: null }
                ],
                null,
                2
            )
        );
    });

    it("should show empty message when no members", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = vi.fn().mockResolvedValue({
            ok: true,
            body: { users: [] }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme" } as ListMembersCommand.Args);

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("No members found"));
    });

    it("should reject organization tokens", async () => {
        const context = createMockContext("organization");

        await expect(cmd.handle(context, { org: "acme" } as ListMembersCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("Organization tokens cannot list members")
        );
    });

    it("should handle UnauthorizedError", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = vi.fn().mockResolvedValue({
            ok: false,
            rawResponse: { status: 403 }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as ListMembersCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("do not have access to organization")
        );
    });

    it("should handle unknown errors", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGet = vi.fn().mockResolvedValue({
            ok: false,
            rawResponse: { status: 500 }
        });
        vi.mocked(createVenusService).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as ListMembersCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to list members"));
    });
});
