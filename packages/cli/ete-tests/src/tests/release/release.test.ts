import path from "path";
import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("release", () => {
    itFixture("simple");
});

function itFixture(fixtureName: string) {
    // runFernCli throws if the command exits with a non-zero exit code
    // eslint-disable-next-line jest/expect-expect
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            await runFernCli(["release", "0.0.0"], {
                cwd: fixturePath,
            });
        },
        90_000
    );
}
