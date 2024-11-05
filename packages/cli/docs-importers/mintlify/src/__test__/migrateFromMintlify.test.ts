import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import path from "path";
import { MintlifyImporter } from "..";
import { mkdir, rmdir } from "fs/promises";
import { createMockTaskContext } from "@fern-api/task-context";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { FernDocsBuilderImpl } from "@fern-api/docs-importer-commons";
import { writeFile } from "fs/promises";
import { FERN_DIRECTORY, PROJECT_CONFIG_FILENAME } from "@fern-api/configuration";

const FIXTURES_PATH = AbsoluteFilePath.of(path.join(__dirname, "fixtures"));
const OUTPUTS_PATH = AbsoluteFilePath.of(path.join(__dirname, "outputs"));

const fixtures = ["bland", "layerfi", "zep"];

// @todo update tests to use runMintlifyMigration
describe("add-generator-groups", () => {
    for (const fixture of fixtures) {
        it(`${fixture}`, async () => {
            const fixturePath = join(FIXTURES_PATH, RelativeFilePath.of(fixture));
            const outputPath = join(OUTPUTS_PATH, RelativeFilePath.of(fixture));
            if (await doesPathExist(outputPath)) {
                await rmdir(outputPath, { recursive: true });
            }
            await mkdir(outputPath, { recursive: true });

            const context = createMockTaskContext({ logger: CONSOLE_LOGGER });
            const mintlifyImporter = new MintlifyImporter({
                context
            });
            const builder = new FernDocsBuilderImpl();

            await mintlifyImporter.import({
                args: { absolutePathToMintJson: join(fixturePath, RelativeFilePath.of("mint.json")) },
                builder
            });

            await builder.build({ outputDirectory: outputPath });

            await writeFile(
                join(
                    AbsoluteFilePath.of(outputPath),
                    RelativeFilePath.of(FERN_DIRECTORY),
                    RelativeFilePath.of(PROJECT_CONFIG_FILENAME)
                ),
                JSON.stringify(
                    {
                        version: "*",
                        organization: "fern"
                    },
                    undefined,
                    4
                )
            );
        });
    }
});
