import * as loggingExecaModule from "@fern-api/logging-execa";
import { existsSync } from "fs";
import { chmod, mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import tmp from "tmp-promise";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RerunCliError, rerunFernCliAtVersion } from "../rerunFernCliAtVersion.js";
import { createMockCliContext } from "./mockCliContext.js";

const offlineNpmEnv = {
    npm_config_registry: "http://127.0.0.1:9/",
    npm_config_offline: "true",
    npm_config_fetch_retries: "0",
    npm_config_fetch_timeout: "1000"
};

// Tests stub os.tmpdir within this worker; never change the process working directory.
describe.sequential("rerunFernCliAtVersion", () => {
    afterEach(() => vi.restoreAllMocks());

    it.each([false, true])("does not run a project executable (nested temp directory: %s)", async (nestedTemp) => {
        const { path: projectDir, cleanup } = await tmp.dir({ unsafeCleanup: true });
        try {
            const cliContext = await createMockCliContext();
            const version = "99.0.0";
            const markerPath = path.join(projectDir, "marker.txt");
            const binDir = path.join(projectDir, "node_modules", ".bin");
            await mkdir(binDir, { recursive: true });
            await writeFile(path.join(projectDir, "package.json"), JSON.stringify({ private: true }));
            // This invalid project configuration must not affect the isolated installation.
            await writeFile(path.join(projectDir, ".npmrc"), "registry=not-a-registry\n");
            for (const name of [`${cliContext.environment.packageName}@${version}`, cliContext.environment.cliName]) {
                const plantedPath = path.join(binDir, name);
                await writeFile(plantedPath, `#!/bin/sh\necho ran > "${markerPath}"\n`);
                await chmod(plantedPath, 0o755);
                await writeFile(`${plantedPath}.cmd`, `@echo ran > "${markerPath}"\r\n`);
            }
            const plantedPackageDir = path.join(projectDir, "node_modules", cliContext.environment.packageName);
            await mkdir(plantedPackageDir);
            await writeFile(
                path.join(plantedPackageDir, "package.json"),
                JSON.stringify({
                    name: cliContext.environment.packageName,
                    version,
                    bin: { [cliContext.environment.cliName]: "index.js" }
                })
            );
            if (nestedTemp) {
                vi.spyOn(os, "tmpdir").mockReturnValue(projectDir);
            }
            await expect(
                rerunFernCliAtVersion({
                    version,
                    cliContext,
                    cwd: projectDir,
                    args: ["--version"],
                    throwOnError: true,
                    env: { ...offlineNpmEnv, npm_config_cache: path.join(projectDir, "npm-cache") }
                })
            ).rejects.toBeInstanceOf(RerunCliError);
            expect(existsSync(markerPath)).toBe(false);
        } finally {
            vi.restoreAllMocks();
            await cleanup();
        }
    }, 60_000);

    it.each([
        { packageName: "test-package", cliName: "test-cli", binName: "test-cli" },
        { packageName: "fern-api", cliName: "fern-local", binName: "fern" }
    ])("preserves the project and arguments through FERN_CWD ($cliName)", async ({ packageName, cliName, binName }) => {
        const { path: fixtureDir, cleanup } = await tmp.dir({ unsafeCleanup: true });
        try {
            const projectDir = path.join(fixtureDir, "project with spaces");
            const packageDir = path.join(fixtureDir, "fixture-cli");
            await mkdir(projectDir);
            await mkdir(packageDir);
            await writeFile(
                path.join(projectDir, "fern.config.json"),
                JSON.stringify({ organization: "test-project" })
            );
            await writeFile(
                path.join(packageDir, "package.json"),
                JSON.stringify({
                    name: packageName,
                    version: "1.2.3",
                    bin: { [binName]: "cli.cjs" }
                })
            );
            // Mirror the supported CLI startup contract before reading or writing project files.
            await writeFile(
                path.join(packageDir, "cli.cjs"),
                `#!/usr/bin/env node
                const fs = require("node:fs");
                process.chdir(process.env.FERN_CWD);
                fs.mkdirSync("sdk", { recursive: true });
                fs.writeFileSync("sdk/result.json", JSON.stringify({
                    config: JSON.parse(fs.readFileSync("fern.config.json", "utf8")),
                    args: process.argv.slice(2),
                    noRedirect: process.env.FERN_NO_VERSION_REDIRECTION
                }));
            `
            );
            await chmod(path.join(packageDir, "cli.cjs"), 0o755);
            const cliContext = await createMockCliContext();
            Object.assign(cliContext.environment, { packageName, cliName });
            await rerunFernCliAtVersion({
                cliContext,
                version: `file:${packageDir}`,
                cwd: projectDir,
                args: ["generate", "argument with spaces", "$(not-a-command)"],
                env: { ...offlineNpmEnv, npm_config_cache: path.join(fixtureDir, "npm-cache") },
                throwOnError: true
            });
            expect(JSON.parse(await readFile(path.join(projectDir, "sdk/result.json"), "utf8"))).toEqual({
                config: { organization: "test-project" },
                args: ["generate", "argument with spaces", "$(not-a-command)"],
                noRedirect: "true"
            });
            expect(existsSync(path.join(projectDir, "node_modules"))).toBe(false);
            expect(existsSync(path.join(projectDir, "package-lock.json"))).toBe(false);
        } finally {
            await cleanup();
        }
    }, 60_000);

    it("removes the temporary directory when process invocation throws", async () => {
        const cliContext = await createMockCliContext();
        const failure = new Error("spawn failed");
        let npxDirectory: string | undefined;
        vi.spyOn(loggingExecaModule, "loggingExeca").mockImplementationOnce(
            async (_logger, _command, _args, options) => {
                npxDirectory = String(options?.cwd);
                expect(existsSync(npxDirectory)).toBe(true);
                throw failure;
            }
        );
        await expect(rerunFernCliAtVersion({ version: "99.0.0", cliContext })).rejects.toBe(failure);
        expect(npxDirectory).toBeDefined();
        expect(existsSync(npxDirectory ?? "")).toBe(false);
    });
});
