import { AbsoluteFilePath, doesPathExist, getDirectoryContents, getDirectoryContentsForSnapshot } from "@fern-api/fs-utils";
import { rm } from "fs/promises";
import path from "path";
import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("validate", () => {
    itFixture("petstore");
});

describe("validate namespaced API", () => {
    itFixture("namespaced");
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

            expect(await getDirectoryContentsForSnapshot(AbsoluteFilePath.of(definitionOutputPath))).toMatchSnapshot();
        },
        90_000
    );
}
