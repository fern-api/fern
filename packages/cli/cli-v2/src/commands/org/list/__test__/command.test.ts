import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListCommand } from "../command.js";

vi.mock("@fern-api/core", () => ({
    createVenusService: vi.fn()
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
        isTTY: false,
        headers: { "X-Request-Id": "test-request-id" },
        getTokenOrPrompt: vi.fn().mockResolvedValue({ type: tokenType, value: "test-token" })
    } as unknown as import("../../../../context/Context.js").Context;
}

describe("ListCommand", () => {
    let cmd: ListCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new ListCommand();
    });

    it("should list organizations successfully", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGetMyOrgs = vi.fn().mockResolvedValue({
            ok: true,
            body: { organizations: ["acme", "other-org"], nextPage: null }
        });
        vi.mocked(createVenusService).mockReturnValue({
            user: { getMyOrganizations: mockGetMyOrgs }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context);

        expect(createVenusService).toHaveBeenCalledWith(
            expect.objectContaining({ headers: { "X-Request-Id": "test-request-id" } })
        );
        expect(context.stdout.info).toHaveBeenCalledWith("acme");
        expect(context.stdout.info).toHaveBeenCalledWith("other-org");
    });

    it("should paginate through multiple pages", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGetMyOrgs = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                body: { organizations: ["acme"], nextPage: 2 }
            })
            .mockResolvedValueOnce({
                ok: true,
                body: { organizations: ["other-org"], nextPage: null }
            });
        vi.mocked(createVenusService).mockReturnValue({
            user: { getMyOrganizations: mockGetMyOrgs }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context);

        expect(mockGetMyOrgs).toHaveBeenCalledTimes(2);
        expect(mockGetMyOrgs).toHaveBeenNthCalledWith(1, { pageId: 1 });
        expect(mockGetMyOrgs).toHaveBeenNthCalledWith(2, { pageId: 2 });
        expect(context.stdout.info).toHaveBeenCalledWith("acme");
        expect(context.stdout.info).toHaveBeenCalledWith("other-org");
    });

    it("should show empty message when no organizations", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGetMyOrgs = vi.fn().mockResolvedValue({
            ok: true,
            body: { organizations: [], nextPage: null }
        });
        vi.mocked(createVenusService).mockReturnValue({
            user: { getMyOrganizations: mockGetMyOrgs }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await cmd.handle(context);

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("not a member of any organizations"));
        expect(context.stdout.info).not.toHaveBeenCalled();
    });

    it("should reject organization tokens", async () => {
        const context = createMockContext("organization");

        await expect(cmd.handle(context)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("Organization tokens cannot list organizations")
        );
    });

    it("should throw on API error", async () => {
        const { createVenusService } = await import("@fern-api/core");
        const mockGetMyOrgs = vi.fn().mockResolvedValue({ ok: false });
        vi.mocked(createVenusService).mockReturnValue({
            user: { getMyOrganizations: mockGetMyOrgs }
        } as unknown as ReturnType<typeof createVenusService>);

        const context = createMockContext();
        await expect(cmd.handle(context)).rejects.toThrow(CliError);
    });
});
