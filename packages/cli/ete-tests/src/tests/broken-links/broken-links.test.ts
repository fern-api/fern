import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import stripAnsi from "strip-ansi";

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

    it("external link with docs domain in query param should not be flagged", async () => {
        const { stdout } = await runFernCli(["docs", "broken-links"], {
            cwd: join(fixturesDir, RelativeFilePath.of("external-link-query-param")),
            reject: false
        });
        // This fixture should have no broken links - external URLs with the docs domain
        // in query parameters (e.g., ?source=docs.example.com) should NOT be flagged
        expect(stripAnsi(stdout)).toContain("All checks passed");
    }, 20_000);
});
