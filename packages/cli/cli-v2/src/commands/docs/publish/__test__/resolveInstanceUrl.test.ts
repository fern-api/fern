import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { createTestContext } from "../../../../__test__/utils/createTestContext.js";
import { PublishCommand } from "../command.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInstances(...urls: string[]): Array<{ url: string }> {
    return urls.map((url) => ({ url }));
}

/** Calls the private `resolveInstanceUrl` via type cast with isTTY forced to false. */
async function resolveInstanceUrl(
    cmd: PublishCommand,
    instances: Array<{ url: string }>,
    instance?: string
): Promise<string> {
    const context = await createTestContext({ cwd: AbsoluteFilePath.of("/tmp") });
    Object.defineProperty(context, "isTTY", { get: () => false });

    return (
        cmd as unknown as {
            resolveInstanceUrl: (opts: {
                context: typeof context;
                instances: Array<{ url: string }>;
                instance: string | undefined;
            }) => Promise<string>;
        }
    ).resolveInstanceUrl({ context, instances, instance });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PublishCommand.resolveInstanceUrl", () => {
    const cmd = new PublishCommand();

    describe("no instances configured", () => {
        it("throws CliError when instances array is empty", async () => {
            await expect(resolveInstanceUrl(cmd, [])).rejects.toSatisfy(
                (e) => e instanceof CliError && e.message.includes("No docs instances configured")
            );
        });
    });

    describe("single instance", () => {
        it("returns the only instance without prompting", async () => {
            const url = await resolveInstanceUrl(cmd, makeInstances("https://docs.example.com"));
            expect(url).toBe("https://docs.example.com");
        });
    });

    describe("--instance flag", () => {
        it("returns matching instance when --instance is specified", async () => {
            const url = await resolveInstanceUrl(
                cmd,
                makeInstances("https://docs.example.com", "https://docs-staging.example.com"),
                "https://docs-staging.example.com"
            );
            expect(url).toBe("https://docs-staging.example.com");
        });

        it("throws CliError when --instance does not match any configured instance", async () => {
            await expect(
                resolveInstanceUrl(
                    cmd,
                    makeInstances("https://docs.example.com", "https://docs-staging.example.com"),
                    "https://unknown.example.com"
                )
            ).rejects.toSatisfy(
                (e) =>
                    e instanceof CliError &&
                    e.message.includes("unknown.example.com") &&
                    e.message.includes("docs.example.com")
            );
        });
    });

    describe("multiple instances — non-TTY", () => {
        it("throws CliError listing all instances and --instance hint", async () => {
            await expect(
                resolveInstanceUrl(cmd, makeInstances("https://docs.example.com", "https://docs-staging.example.com"))
            ).rejects.toSatisfy(
                (e) =>
                    e instanceof CliError &&
                    e.message.includes("docs.example.com") &&
                    e.message.includes("docs-staging.example.com") &&
                    e.message.includes("--instance")
            );
        });
    });
});
