import { existsSync } from "fs";
import { chmod, mkdir, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { describe, expect, it } from "vitest";

import { RerunCliError, rerunFernCliAtVersion } from "../rerunFernCliAtVersion.js";
import { createMockCliContext } from "./mockCliContext.js";

describe("rerunFernCliAtVersion", () => {
    it("does not run a CLI executable from the project directory", async () => {
        const { path: projectDir, cleanup } = await tmp.dir({ unsafeCleanup: true });
        const originalCwd = process.cwd();
        try {
            const cliContext = await createMockCliContext();
            const version = "1.2.3";
            const markerPath = path.join(projectDir, "marker.txt");

            // npx would resolve this file for `<package>@<version>` if it ran inside the project.
            const binDir = path.join(projectDir, "node_modules", ".bin");
            await mkdir(binDir, { recursive: true });
            const plantedPath = path.join(binDir, `${cliContext.environment.packageName}@${version}`);
            await writeFile(plantedPath, `#!/bin/sh\necho ran > "${markerPath}"\n`);
            await chmod(plantedPath, 0o755);

            process.chdir(projectDir);
            let error: unknown;
            try {
                await rerunFernCliAtVersion({
                    version,
                    cliContext,
                    args: ["--version"],
                    throwOnError: true,
                    // Point npm at a closed port so the real package can't be fetched either.
                    env: { npm_config_registry: "http://127.0.0.1:9/", npm_config_offline: "true" }
                });
            } catch (caught) {
                error = caught;
            }

            expect(existsSync(markerPath)).toBe(false);
            expect(error).toBeInstanceOf(RerunCliError);
        } finally {
            process.chdir(originalCwd);
            await cleanup();
        }
    }, 60_000);
});
