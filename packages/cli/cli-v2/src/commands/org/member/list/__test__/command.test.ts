import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListMembersCommand } from "../command.js";

vi.mock("../../../../../services/index.js", () => ({
    createVenusServiceV2: vi.fn()
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
        const { createVenusServiceV2 } = await import("../../../../../services/index.js");
        const mockGet = vi.fn().mockResolvedValue({
            ok: true,
            body: {
                users: [
                    { userId: "user1", displayName: "Alice", emailAddress: "alice@example.com" },
                    { userId: "user2", displayName: "Bob", emailAddress: null }
                ]
            }
        });
        vi.mocked(createVenusServiceV2).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusServiceV2>);

        const context = createMockContext();
        await cmd.handle(context, { org: "acme" } as ListMembersCommand.Args);

        expect(createVenusServiceV2).toHaveBeenCalledWith(
            expect.objectContaining({ headers: { "X-Request-Id": "test-request-id" } })
        );
        expect(mockGet).toHaveBeenCalledWith("acme");
        expect(context.stdout.info).toHaveBeenCalledTimes(2);
    });

    it("should output JSON when --json flag is set", async () => {
        const { createVenusServiceV2 } = await import("../../../../../services/index.js");
        const mockGet = vi.fn().mockResolvedValue({
            ok: true,
            body: {
                users: [
                    { userId: "user1", displayName: "Alice", emailAddress: "alice@example.com" },
                    { userId: "user2", displayName: "Bob", emailAddress: null }
                ]
            }
        });
        vi.mocked(createVenusServiceV2).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusServiceV2>);

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
        const { createVenusServiceV2 } = await import("../../../../../services/index.js");
        const mockGet = vi.fn().mockResolvedValue({
            ok: true,
            body: { users: [] }
        });
        vi.mocked(createVenusServiceV2).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusServiceV2>);

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
        const { createVenusServiceV2 } = await import("../../../../../services/index.js");
        const mockGet = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { unauthorizedError: () => void }) => visitor.unauthorizedError()
            }
        });
        vi.mocked(createVenusServiceV2).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusServiceV2>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as ListMembersCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("do not have access to organization")
        );
    });

    it("should handle unknown errors", async () => {
        const { createVenusServiceV2 } = await import("../../../../../services/index.js");
        const mockGet = vi.fn().mockResolvedValue({
            ok: false,
            error: {
                _visit: (visitor: { _other: () => void }) => visitor._other()
            }
        });
        vi.mocked(createVenusServiceV2).mockReturnValue({
            organization: { get: mockGet }
        } as unknown as ReturnType<typeof createVenusServiceV2>);

        const context = createMockContext();
        await expect(cmd.handle(context, { org: "acme" } as ListMembersCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to list members"));
    });
});
