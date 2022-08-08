import { WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import { readFile } from "fs/promises";
import path from "path";
import { runFernCli } from "../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern-upgrade-tests", () => {
    itFixture("simple");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);

            await runFernCli(["upgrade"], {
                cwd: fixturePath,
                reject: false,
            });

            const fileContents = await readFile(path.join(fixturePath, "api", WORKSPACE_CONFIGURATION_FILENAME));
            expect(fileContents.toString()).toMatchSnapshot();
        },
        90_000
    );
}
