import { rm } from "fs/promises";
import path from "path";

import { AbsoluteFilePath, doesPathExist, getDirectoryContentsForSnapshot } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("validate", () => {
    itFixture("petstore");
});

describe("validate namespaced API", () => {
    itFixture("namespaced");
});

describe("validate namespaced API with multiple namespaces", () => {
    itFixture("namespaced-asyncapi");
});

describe("validate namespaced API from Cohere", () => {
    itFixture("namespaced-fleshedout");
});

describe("validate header overrides", () => {
    itFixture("header-overrides");
});

describe("validate multi no endpoint", () => {
    itFixture("multiple-no-endpoint");
});

describe("validate multi no endpoint asyncapi", () => {
    itFixture("multiple-no-endpoint-async");
});

describe("validate multi with endpoint", () => {
    itFixture("multiple-with-endpoint");
});

describe("validate multi with endpoint async", () => {
    itFixture("multiple-with-endpoint-async");
});

describe("validate single no endpoint", () => {
    itFixture("single-no-endpoint");
});

describe("validate single no endpoint async", () => {
    itFixture("single-no-endpoint-async");
});

describe("validate single with endpoint", () => {
    itFixture("single-with-endpoint");
});

describe("validate single with endpoint async", () => {
    itFixture("single-with-endpoint-async");
});

function itFixture(fixtureName: string) {
    it(// eslint-disable-next-line jest/valid-title
    fixtureName, async () => {
        const fixturePath = path.join(FIXTURES_DIR, fixtureName);
        const definitionOutputPath = path.join(fixturePath, "fern", ".definition");
        if (await doesPathExist(AbsoluteFilePath.of(definitionOutputPath))) {
            await rm(definitionOutputPath, { force: true, recursive: true });
        }

        await runFernCli(["write-definition", "--log-level", "debug"], {
            cwd: fixturePath
        });

        expect(await getDirectoryContentsForSnapshot(AbsoluteFilePath.of(definitionOutputPath))).toMatchSnapshot();

        await runFernCli(["check", "--log-level", "debug"], {
            cwd: fixturePath
        });
    }, 90_000);
}
