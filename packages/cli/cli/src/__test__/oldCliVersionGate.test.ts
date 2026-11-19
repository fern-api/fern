import * as loggingExecaModule from "@fern-api/logging-execa";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    ALLOW_OLD_CLI_VERSION_ENV_VAR,
    ALLOW_OLD_CLI_VERSION_FLAG,
    hasOldCliVersionConsent,
    isOlderThanMinimumIsolatedCliVersion,
    MINIMUM_ISOLATED_CLI_VERSION,
    warnAboutOldCliVersion,
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
    const warn = vi.spyOn(cliContext.stderr, "warn");
    const error = vi.spyOn(cliContext.stderr, "error");
    const stdoutInfo = vi.spyOn(cliContext.logger, "info");
    const stdoutWarn = vi.spyOn(cliContext.logger, "warn");
    const stdoutError = vi.spyOn(cliContext.logger, "error");
    return { cliContext, confirmPrompt, failAndThrow, warn, error, stdoutInfo, stdoutWarn, stdoutError };
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

    it("removes disabled forms of the flag", () => {
        expect(
            withoutAllowOldCliVersionFlag([
                "check",
                `${ALLOW_OLD_CLI_VERSION_FLAG}=false`,
                `--no-${ALLOW_OLD_CLI_VERSION_FLAG.slice(2)}`
            ])
        ).toEqual(["check"]);
    });
});

describe("hasOldCliVersionConsent", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("accepts the flag or the environment variable", () => {
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "");
        expect(hasOldCliVersionConsent(["upgrade"])).toBe(false);
        expect(hasOldCliVersionConsent(["upgrade", `${ALLOW_OLD_CLI_VERSION_FLAG}=false`])).toBe(false);
        expect(hasOldCliVersionConsent(["upgrade", ALLOW_OLD_CLI_VERSION_FLAG])).toBe(true);
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "true");
        expect(hasOldCliVersionConsent(["upgrade"])).toBe(true);
    });
});

describe("warnAboutOldCliVersion", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it("does not warn for the minimum version", async () => {
        const { cliContext, warn } = await createContext({ isInteractive: true });
        warnAboutOldCliVersion({ version: MINIMUM_ISOLATED_CLI_VERSION, cliContext, args: [] });
        expect(warn).not.toHaveBeenCalled();
    });

    it.each([true, false])("warns loudly without prompting or failing (interactive: %s)", async (isInteractive) => {
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "");
        const { cliContext, confirmPrompt, failAndThrow, warn, stdoutInfo, stdoutWarn, stdoutError } =
            await createContext({ isInteractive });
        warnAboutOldCliVersion({ version: OLD_VERSION, cliContext, args: ["generate"] });
        expect(confirmPrompt).not.toHaveBeenCalled();
        expect(failAndThrow).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0]?.[0]).toContain("WARNING");
        expect(warn.mock.calls[0]?.[0]).toContain("fern upgrade");
        // Scripts capture stdout (e.g. `$(fern --version)`), so nothing may be printed there.
        expect(stdoutInfo).not.toHaveBeenCalled();
        expect(stdoutWarn).not.toHaveBeenCalled();
        expect(stdoutError).not.toHaveBeenCalled();
    });

    it("prints a short warning with the flag", async () => {
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "");
        const { cliContext, warn } = await createContext({ isInteractive: false });
        warnAboutOldCliVersion({ version: OLD_VERSION, cliContext, args: ["generate", ALLOW_OLD_CLI_VERSION_FLAG] });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0]?.[0]).not.toContain("WARNING");
    });

    it("prints a short warning with the environment variable", async () => {
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "true");
        const { cliContext, warn } = await createContext({ isInteractive: false });
        warnAboutOldCliVersion({ version: OLD_VERSION, cliContext, args: ["generate"] });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0]?.[0]).not.toContain("WARNING");
    });
});

describe("rerunFernCliAtVersion old CLI warning", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it("runs an old version after warning", async () => {
        vi.stubEnv(ALLOW_OLD_CLI_VERSION_ENV_VAR, "");
        const { cliContext, warn } = await createContext({ isInteractive: false });
        const execa = vi.spyOn(loggingExecaModule, "loggingExeca").mockResolvedValue({
            failed: false,
            stdout: "",
            stderr: ""
        } as Awaited<ReturnType<typeof loggingExecaModule.loggingExeca>>);
        await rerunFernCliAtVersion({ version: OLD_VERSION, cliContext, args: ["generate"] });
        expect(warn).toHaveBeenCalled();
        expect(execa.mock.calls[0]?.[2]).toContain(`${cliContext.environment.packageName}@${OLD_VERSION}`);
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
