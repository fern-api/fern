import { readFile, rm } from "fs/promises";
import path from "path";

import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("write-docs-definition", () => {
    itFixture("petstore");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);

            const docsDefinitionOutputPath = path.join(fixturePath, "docs-definition.json");
            if (await doesPathExist(AbsoluteFilePath.of(docsDefinitionOutputPath))) {
                await rm(docsDefinitionOutputPath, { force: true, recursive: true });
            }

            await runFernCli(["write-docs-definition", "docs-definition.json", "--log-level", "debug"], {
                cwd: fixturePath
            });

            expect(await readFile(AbsoluteFilePath.of(docsDefinitionOutputPath), "utf-8")).toMatchSnapshot();
        },
        90_000
    );
}
