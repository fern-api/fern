import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { CliError, createMockTaskContext } from "@fern-api/task-context";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { vi } from "vitest";

import { runMintlifyMigration } from "../runMintlifyMigration.js";

const FIXTURES_PATH = AbsoluteFilePath.of(path.join(__dirname, "fixtures"));
const OUTPUTS_PATH = AbsoluteFilePath.of(path.join(__dirname, "outputs"));

const fixtures = ["bland", "layerfi", "zep"];

describe("add-generator-groups", () => {
    for (const fixture of fixtures) {
        it(`${fixture}`, async () => {
            const fixturePath = join(FIXTURES_PATH, RelativeFilePath.of(fixture));
            const absolutePathToMintJson = join(fixturePath, RelativeFilePath.of("mint.json"));

            const outputPath = join(OUTPUTS_PATH, RelativeFilePath.of(fixture));

            if (await doesPathExist(outputPath)) {
                await rm(outputPath, { recursive: true });
            }

            await mkdir(outputPath, { recursive: true });

            const taskContext = createMockTaskContext({ logger: CONSOLE_LOGGER });

            await runMintlifyMigration({
                absolutePathToMintJson,
                outputPath,
                taskContext,
                versionOfCli: "*",
                organization: "fern"
            });
        });
    }

    it("throws a config error when navigation is missing from mint.json", async () => {
        const fixturePath = AbsoluteFilePath.of(await mkdtemp(path.join(os.tmpdir(), "mintlify-invalid-navigation-")));
        const absolutePathToMintJson = join(fixturePath, RelativeFilePath.of("mint.json"));

        try {
            await writeFile(
                absolutePathToMintJson,
                JSON.stringify({
                    name: "Invalid Mintlify docs",
                    favicon: "/favicon.ico",
                    colors: {
                        primary: "#000000"
                    }
                })
            );

            const taskContext = createMockTaskContext({ logger: CONSOLE_LOGGER });
            const failAndThrow = vi.spyOn(taskContext, "failAndThrow");

            await expect(
                runMintlifyMigration({
                    absolutePathToMintJson,
                    outputPath: fixturePath,
                    taskContext,
                    versionOfCli: "*",
                    organization: "fern"
                })
            ).rejects.toThrow();

            expect(failAndThrow).toHaveBeenCalledWith("Expected navigation in mint.json to be an array.", undefined, {
                code: CliError.Code.ConfigError
            });
        } finally {
            await rm(fixturePath, { recursive: true, force: true });
        }
    });
});
