import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateCommand } from "../command.js";

vi.mock("@fern-api/auth", () => ({
    createOrganizationIfDoesNotExist: vi.fn(),
    getOrganizationNameValidationError: vi.fn().mockReturnValue(null)
}));

vi.mock("../../../../ui/withSpinner.js", () => ({
    withSpinner: vi.fn(({ operation }: { operation: () => Promise<unknown> }) => operation())
}));

vi.mock("../../../../context/adapter/TaskContextAdapter.js", () => ({
    TaskContextAdapter: vi.fn()
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
    } as unknown as import("../../../../context/Context.js").Context;
}

describe("CreateCommand", () => {
    let cmd: CreateCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new CreateCommand();
    });

    it("should create an organization successfully", async () => {
        const { createOrganizationIfDoesNotExist } = await import("@fern-api/auth");
        vi.mocked(createOrganizationIfDoesNotExist).mockResolvedValue(true);

        const context = createMockContext();
        await cmd.handle(context, { name: "acme" } as CreateCommand.Args);

        expect(createOrganizationIfDoesNotExist).toHaveBeenCalledWith(
            expect.objectContaining({ headers: { "X-Request-Id": "test-request-id" } })
        );
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining('Created organization "acme"'));
    });

    it("should show message when organization already exists", async () => {
        const { createOrganizationIfDoesNotExist } = await import("@fern-api/auth");
        vi.mocked(createOrganizationIfDoesNotExist).mockResolvedValue(false);

        const context = createMockContext();
        await cmd.handle(context, { name: "acme" } as CreateCommand.Args);

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining('Organization "acme" already exists'));
    });

    it("should reject organization tokens", async () => {
        const context = createMockContext("organization");

        await expect(cmd.handle(context, { name: "acme" } as CreateCommand.Args)).rejects.toThrow(CliError);

        expect(context.stderr.error).toHaveBeenCalledWith(
            expect.stringContaining("Organization tokens cannot create organizations")
        );
    });

    it("should throw on invalid organization name", async () => {
        const { getOrganizationNameValidationError } = await import("@fern-api/auth");
        vi.mocked(getOrganizationNameValidationError).mockReturnValue("Name must not contain spaces");

        const context = createMockContext();
        await expect(cmd.handle(context, { name: "bad name" } as CreateCommand.Args)).rejects.toThrow(CliError);
    });
});
