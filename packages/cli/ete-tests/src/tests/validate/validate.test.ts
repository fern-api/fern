import { rm } from "fs/promises";
import path from "path";
import stripAnsi from "strip-ansi";
import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern-ir-tests", () => {
    itFixture("simple");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const irOutputPath = path.join(fixturePath, "api", "ir.json");
            await rm(irOutputPath, { force: true, recursive: true });

            const { stdout } = await runFernCli(["check"], {
                cwd: fixturePath,
                reject: false,
            });
            expect(stripAnsi(stdout)).toContain("Type MissingType is not defined");
        },
        90_000
    );
}
