import path from "path";
import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("release", () => {
    itFixture("simple");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const { exitCode } = await runFernCli(["release", "0.0.0"], {
                cwd: fixturePath,
            });
            expect(exitCode).toBe(0);
        },
        90_000
    );
}
