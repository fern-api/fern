import stripAnsi from "strip-ansi";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
describe("fern docs broken-links", () => {
    it("simple broken links", async () => {
        const { stdout } = await runFernCli(["docs", "broken-links"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple")),
            reject: false
        });
        expect(
            stripAnsi(stdout)
                // The expected stdout for the "simple" fixture includes
                // an elapsed time that can change on every test run.
                // So, we truncate the last 15 characters to remove the
                // variable part of the output.
                .slice(0, -15)
        ).toMatchSnapshot();
    }, 20_000);
});
