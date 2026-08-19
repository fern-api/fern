import { AbsoluteFilePath, doesPathExist, getDirectoryContentsForSnapshot } from "@fern-api/fs-utils";
import { rm } from "fs/promises";
import path from "path";

import { runFernCli } from "../../utils/runFernCli.js";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("write-definition", () => {
    itFixture("petstore");
    itFixture("namespaced");
    itFixture("namespaced-asyncapi");
    itFixture("namespaced-fleshedout");
    itFixture("header-overrides");
    itFixture("multiple-no-endpoint");
    itFixture("multiple-no-endpoint-async");
    itFixture("multiple-with-endpoint");
    itFixture("multiple-with-endpoint-async");
    itFixture("single-no-endpoint");
    itFixture("single-no-endpoint-async");
    itFixture("single-with-endpoint");
    itFixture("single-with-endpoint-async");
});

function itFixture(fixtureName: string) {
    it.concurrent(// eslint-disable-next-line jest/valid-title
    fixtureName, async ({ expect, signal }) => {
        const fixturePath = path.join(FIXTURES_DIR, fixtureName);
        const definitionOutputPath = path.join(fixturePath, "fern", ".definition");
        if (await doesPathExist(AbsoluteFilePath.of(definitionOutputPath))) {
            await rm(definitionOutputPath, { force: true, recursive: true });
        }

        await runFernCli(["write-definition", "--log-level", "debug"], { cwd: fixturePath, signal });

        expect(await getDirectoryContentsForSnapshot(AbsoluteFilePath.of(definitionOutputPath))).toMatchSnapshot();

        await runFernCli(["check", "--log-level", "debug"], { cwd: fixturePath, signal });
    }, 90_000);
}
