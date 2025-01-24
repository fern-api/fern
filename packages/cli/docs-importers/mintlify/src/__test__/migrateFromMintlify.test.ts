import { mkdir, rmdir } from "fs/promises";
import path from "path";

import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { runMintlifyMigration } from "../runMintlifyMigration";

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
                await rmdir(outputPath, { recursive: true });
            }

            await mkdir(outputPath, { recursive: true });

            const taskContext = createMockTaskContext({ logger: CONSOLE_LOGGER });

            await runMintlifyMigration({
                absolutePathToMintJson,
                outputPath,
                taskContext,
                versionOfCli: "*"
            });
        });
    }
});
