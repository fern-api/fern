import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/fs-utils";
import path from "path";
import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("overrides", () => {
    itFixture("petstore");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const outputPath = path.join(fixturePath, "fern", "openapi", "openapi-overrides.yml");

            await runFernCli(["write-overrides"], {
                cwd: fixturePath
            });
            expect(await getDirectoryContents(AbsoluteFilePath.of(outputPath))).toMatchSnapshot();
        },
        90_000
    );
}
