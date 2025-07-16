import { rm } from "fs/promises";
import path from "path";
import stripAnsi from "strip-ansi";

import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("validate", () => {
    itFixture("simple");
    itFixture("docs");
    itFixture("no-api");
    itFixture("no-generator");
});

function itFixture(fixtureName: string) {
    it(// eslint-disable-next-line jest/valid-title
    fixtureName, async () => {
        const fixturePath = path.join(FIXTURES_DIR, fixtureName);
        const irOutputPath = path.join(fixturePath, "api", "ir.json");
        await rm(irOutputPath, { force: true, recursive: true });

        const { stdout } = await runFernCli(["check"], {
            cwd: fixturePath,
            reject: false
        });

        if (fixtureName == "simple") {
            expect(
                stripAnsi(stdout)
                    // for some reason, locally the output contains a newline that Circle doesn't
                    .trim()
                    // The expected stdout for the "simple" fixture includes
                    // an elapsed time that can change on every test run.
                    // So, we truncate the last 15 characters to remove the
                    // variable part of the output.
                    .slice(0, -15)
            ).toMatchSnapshot();
        } else {
            expect(
                stripAnsi(stdout)
                    // for some reason, locally the output contains a newline that Circle doesn't
                    .trim()
            ).toMatchSnapshot();
        }
    }, 90_000);
}
