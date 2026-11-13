import * as loggingExecaModule from "@fern-api/logging-execa";
import { TaskAbortSignal } from "@fern-api/task-context";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    ALLOW_OLD_CLI_VERSION_ENV_VAR,
    ALLOW_OLD_CLI_VERSION_FLAG,
    confirmOldCliVersionAllowed,
    isOlderThanMinimumIsolatedCliVersion,
    MINIMUM_ISOLATED_CLI_VERSION,
    withoutAllowOldCliVersionFlag
} from "../oldCliVersionGate.js";
import { rerunFernCliAtVersion } from "../rerunFernCliAtVersion.js";
import { createMockCliContext } from "./mockCliContext.js";

const OLD_VERSION = "5.211.0";

async function createContext({ isInteractive }: { isInteractive: boolean }) {
    const cliContext = await createMockCliContext();
    vi.spyOn(cliContext, "isInteractive", "get").mockReturnValue(isInteractive);
    const confirmPrompt = vi.spyOn(cliContext, "confirmPrompt");
    const failAndThrow = vi.spyOn(cliContext, "failAndThrow");
    const warn = vi.spyOn(cliContext.logger, "warn");
    return { cliContext, confirmPrompt, failAndThrow, warn };
}

describe("isOlderThanMinimumIsolatedCliVersion", () => {
    it("compares semver versions against the minimum", () => {
        expect(isOlderThanMinimumIsolatedCliVersion(OLD_VERSION)).toBe(true);
        expect(isOlderThanMinimumIsolatedCliVersion("0.45.0")).toBe(true);
        expect(isOlderThanMinimumIsolatedCliVersion(MINIMUM_ISOLATED_CLI_VERSION)).toBe(false);
        expect(isOlderThanMinimumIsolatedCliVersion("6.0.0")).toBe(false);
    });

    it("ignores versions that are not semver", () => {
        expect(isOlderThanMinimumIsolatedCliVersion("file:/tmp/cli")).toBe(false);
    });
});

describe("withoutAllowOldCliVersionFlag", () => {
    it("removes the flag and keeps other arguments", () => {
        expect(
            withoutAllowOldCliVersionFlag([
                "generate",
                ALLOW_OLD_CLI_VERSION_FLAG,
                "--group",
                "a",
                `${ALLOW_OLD_CLI_VERSION_FLAG}=true`
            ])
        ).toEqual(["generate", "--group", "a"]);
    });
});

describe("confirmOldCliVersionAllowed", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it("allows the minimum version without prompting", async () => {
        const { cliContext, confirmPrompt } = await createContext({ isInteractive: true });
        await confirmOldCliVersionAllowed({ version: MINIMUM_ISOLATED_CLI_VERSION, cliContext, args: [] });
        expect(confirmPrompt).not.toHaveBeenCalled();
    });

    it("fails without a prompt when not interactive", async () => {
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "");
        const { cliContext, confirmPrompt, failAndThrow } = await createContext({ isInteractive: false });
        await expect(
            confirmOldCliVersionAllowed({ version: OLD_VERSION, cliContext, args: ["generate"] })
        ).rejects.toBeInstanceOf(TaskAbortSignal);
        expect(confirmPrompt).not.toHaveBeenCalled();
        expect(failAndThrow.mock.calls[0]?.[0]).toContain(ALLOW_OLD_CLI_VERSION_FLAG);
    });

    it("allows the version with the flag", async () => {
        const { cliContext, confirmPrompt, warn } = await createContext({ isInteractive: false });
        await confirmOldCliVersionAllowed({
            version: OLD_VERSION,
            cliContext,
            args: ["generate", ALLOW_OLD_CLI_VERSION_FLAG]
        });
        expect(confirmPrompt).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
    });

    it("allows the version with the environment variable", async () => {
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "true");
        const { cliContext, confirmPrompt } = await createContext({ isInteractive: false });
        await confirmOldCliVersionAllowed({ version: OLD_VERSION, cliContext, args: ["generate"] });
        expect(confirmPrompt).not.toHaveBeenCalled();
    });

    it.each([
        { answer: true, allowed: true },
        { answer: false, allowed: false }
    ])("asks in an interactive terminal (answer: $answer)", async ({ answer, allowed }) => {
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "");
        const { cliContext, confirmPrompt } = await createContext({ isInteractive: true });
        confirmPrompt.mockResolvedValue(answer);
        const result = confirmOldCliVersionAllowed({ version: OLD_VERSION, cliContext, args: ["generate"] });
        if (allowed) {
            await expect(result).resolves.toBeUndefined();
        } else {
            await expect(result).rejects.toBeInstanceOf(TaskAbortSignal);
        }
        expect(confirmPrompt).toHaveBeenCalledWith(`Run Fern CLI ${OLD_VERSION} anyway?`, false);
    });
});

describe("rerunFernCliAtVersion old CLI gate", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it("does not start npx for an old version that is not allowed", async () => {
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "");
        const { cliContext } = await createContext({ isInteractive: false });
        const execa = vi.spyOn(loggingExecaModule, "loggingExeca");
        await expect(
            rerunFernCliAtVersion({ version: OLD_VERSION, cliContext, args: ["generate"], throwOnError: true })
        ).rejects.toBeInstanceOf(TaskAbortSignal);
        expect(execa).not.toHaveBeenCalled();
    });

    it("does not forward the flag to the older CLI", async () => {
        const { cliContext } = await createContext({ isInteractive: false });
        const execa = vi.spyOn(loggingExecaModule, "loggingExeca").mockResolvedValue({
            failed: false,
            stdout: "",
            stderr: ""
        } as Awaited<ReturnType<typeof loggingExecaModule.loggingExeca>>);
        await rerunFernCliAtVersion({
            version: OLD_VERSION,
            cliContext,
            args: ["generate", ALLOW_OLD_CLI_VERSION_FLAG, "--group", "sdk"]
        });
        const npxArgs = execa.mock.calls[0]?.[2] ?? [];
        expect(npxArgs).toContain(`${cliContext.environment.packageName}@${OLD_VERSION}`);
        expect(npxArgs.slice(npxArgs.indexOf("--") + 2)).toEqual(["generate", "--group", "sdk"]);
    });
});
