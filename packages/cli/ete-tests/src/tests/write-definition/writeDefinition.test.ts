import { AbsoluteFilePath, doesPathExist, getDirectoryContents } from "@fern-api/fs-utils";
import { rm } from "fs/promises";
import path from "path";
import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("validate", () => {
    itFixture("petstore");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const definitionOutputPath = path.join(fixturePath, "fern", ".definition");
            if (await doesPathExist(AbsoluteFilePath.of(definitionOutputPath))) {
                await rm(definitionOutputPath, { force: true, recursive: true });
            }

            await runFernCli(["write-definition", "--log-level", "debug"], {
                cwd: fixturePath
            });

            expect(await getDirectoryContents(AbsoluteFilePath.of(definitionOutputPath))).toMatchSnapshot();
        },
        90_000
    );
}
