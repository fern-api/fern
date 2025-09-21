import { readFile } from "fs/promises";
import path from "path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("overrides", () => {
    itFixture("simple");
});

function itFixture(fixtureName: string) {
    it(// eslint-disable-next-line jest/valid-title
    fixtureName, async () => {
        const fixturePath = path.join(FIXTURES_DIR, fixtureName);
        for (const filename of ["openapi.yml", "openapi.json"]) {
            const outputPath = path.join(fixturePath, "output", filename);
            await runFernCli(["export", outputPath], {
                cwd: fixturePath
            });
            expect((await readFile(AbsoluteFilePath.of(outputPath))).toString()).toMatchSnapshot();
        }
    }, 90_000);
}
