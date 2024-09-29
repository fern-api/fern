import {
    AbsoluteFilePath,
    doesPathExist,
    getDirectoryContentsForSnapshot,
    join,
    RelativeFilePath
} from "@fern-api/fs-utils";
import path from "path";
import { migrateFromMintlify } from "..";
import tmp from "tmp-promise";
import { mkdir, rmdir } from "fs/promises";

const FIXTURES_PATH = AbsoluteFilePath.of(path.join(__dirname, "fixtures"));
const OUTPUTS_PATH = AbsoluteFilePath.of(path.join(__dirname, "outputs"));

const fixtures = ["bland", "layerfi", "zep"];

describe("add-generator-groups", () => {
    for (const fixture of fixtures) {
        it(`${fixture}`, async () => {
            const fixturePath = join(FIXTURES_PATH, RelativeFilePath.of(fixture));
            const outputPath = join(OUTPUTS_PATH, RelativeFilePath.of(fixture));
            if (await doesPathExist(outputPath)) {
                await rmdir(outputPath, { recursive: true });
            }
            await mkdir(outputPath);

            await migrateFromMintlify({
                mintlifyDirectory: fixturePath,
                organization: fixture,
                outputDirectory: outputPath
            });
        });
    }
});
