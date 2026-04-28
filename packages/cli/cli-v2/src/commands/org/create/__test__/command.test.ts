import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateCommand } from "../command.js";

vi.mock("@fern-api/auth", () => ({
    createOrganizationIfDoesNotExist: vi.fn(),
    getOrganizationNameValidationError: vi.fn()
}));

vi.mock("../../../../ui/withSpinner.js", () => ({
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
        cwd: "/tmp",
        getTokenOrPrompt: vi.fn().mockResolvedValue({ type: tokenType, value: "test-token" })
    } as unknown as import("../../../../context/Context.js").Context;
}

describe("CreateCommand (org)", () => {
    let cmd: CreateCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new CreateCommand();
    });

    it("creates an org from the positional name", async () => {
        const { createOrganizationIfDoesNotExist, getOrganizationNameValidationError } = await import("@fern-api/auth");
        vi.mocked(getOrganizationNameValidationError).mockReturnValue(undefined);
        vi.mocked(createOrganizationIfDoesNotExist).mockResolvedValue(true);

        const context = createMockContext();
        await cmd.handle(context, { name: "acme" } as CreateCommand.Args);

        expect(createOrganizationIfDoesNotExist).toHaveBeenCalledWith(
            expect.objectContaining({ organization: "acme" })
        );
    });

    it("accepts --params with a valid JSON payload", async () => {
        const { createOrganizationIfDoesNotExist, getOrganizationNameValidationError } = await import("@fern-api/auth");
        vi.mocked(getOrganizationNameValidationError).mockReturnValue(undefined);
        vi.mocked(createOrganizationIfDoesNotExist).mockResolvedValue(true);

        const context = createMockContext();
        await cmd.handle(context, { params: JSON.stringify({ name: "acme" }) } as CreateCommand.Args);

        expect(createOrganizationIfDoesNotExist).toHaveBeenCalledWith(
            expect.objectContaining({ organization: "acme" })
        );
    });

    it("rejects --params combined with the positional name", async () => {
        const context = createMockContext();

        await expect(
            cmd.handle(context, {
                name: "acme",
                params: JSON.stringify({ name: "other" })
            } as CreateCommand.Args)
        ).rejects.toMatchObject({
            message: expect.stringContaining("--params cannot be combined"),
            code: CliError.Code.ConfigError
        });
    });

    it("rejects an --params payload that does not match the schema", async () => {
        const context = createMockContext();

        await expect(
            cmd.handle(context, { params: JSON.stringify({ name: 123 }) } as CreateCommand.Args)
        ).rejects.toMatchObject({
            message: expect.stringContaining("did not match the org-create-input schema"),
            code: CliError.Code.ValidationError
        });
    });

    it("rejects a missing name when neither positional nor --params is provided", async () => {
        const context = createMockContext();

        await expect(cmd.handle(context, {} as CreateCommand.Args)).rejects.toMatchObject({
            message: expect.stringContaining("Missing required argument"),
            code: CliError.Code.ConfigError
        });
    });
});
