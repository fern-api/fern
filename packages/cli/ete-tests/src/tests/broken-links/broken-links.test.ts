import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import stripAnsi from "strip-ansi";

import { runFernCli } from "../../utils/runFernCli.js";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
describe("fern docs broken-links", () => {
    it("simple broken links", async ({ signal }) => {
        const { stdout } = await runFernCli(["docs", "broken-links"], {
            cwd: join(fixturesDir, RelativeFilePath.of("simple")),
            reject: false,
            signal
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

    it("external link with docs domain in query param should not be flagged", async ({ signal }) => {
        const { stdout } = await runFernCli(["docs", "broken-links"], {
            cwd: join(fixturesDir, RelativeFilePath.of("external-link-query-param")),
            reject: false,
            signal
        });
        // This fixture should have no broken links - external URLs with the docs domain
        // in query parameters (e.g., ?source=docs.example.com) should NOT be flagged
        expect(stripAnsi(stdout)).toContain("All checks passed");
    }, 20_000);

    it("links to paths with external redirects should not be flagged as broken", async ({ signal }) => {
        const { stdout } = await runFernCli(["docs", "broken-links"], {
            cwd: join(fixturesDir, RelativeFilePath.of("external-redirect")),
            reject: false,
            signal
        });
        // This fixture tests that links to internal paths (e.g., /ui) that have
        // redirects configured to external URLs (e.g., https://auth-platform.example.com)
        // should NOT be flagged as broken links
        expect(stripAnsi(stdout)).toContain("All checks passed");
    }, 20_000);

    it("links with Markdown snippet references should be resolved", async ({ signal }) => {
        const { stdout } = await runFernCli(["docs", "broken-links"], {
            cwd: join(fixturesDir, RelativeFilePath.of("snippet-link")),
            reject: false,
            signal
        });
        expect(stripAnsi(stdout)).toContain("All checks passed");
    }, 20_000);

    it("absolute links in versioned docs should resolve within version context", async ({ signal }) => {
        const { stdout } = await runFernCli(["docs", "broken-links"], {
            cwd: join(fixturesDir, RelativeFilePath.of("versioned-docs")),
            reject: false,
            signal
        });
        // Absolute links like /plants/aesthetic in versioned pages should resolve
        // within the version context (e.g., v2/plants/aesthetic) and not be flagged as broken
        expect(stripAnsi(stdout)).toContain("All checks passed");
    }, 20_000);

    it("absolute links in product-based docs should resolve within product context", async ({ signal }) => {
        const { stdout } = await runFernCli(["docs", "broken-links"], {
            cwd: join(fixturesDir, RelativeFilePath.of("product-docs")),
            reject: false,
            signal
        });
        // Absolute links like /guides/getting-started in product pages should resolve
        // within the product context (e.g., product-sdks/guides/getting-started) and not be flagged as broken
        expect(stripAnsi(stdout)).toContain("All checks passed");
    }, 20_000);

    it("broken links in sections with path property should be detected", async ({ signal }) => {
        const { stdout } = await runFernCli(["docs", "broken-links"], {
            cwd: join(fixturesDir, RelativeFilePath.of("section-with-path")),
            reject: false,
            signal
        });
        // This fixture tests that markdown files referenced by sections with a path
        // property are validated for broken links (not just pages)
        expect(stripAnsi(stdout).slice(0, -15)).toMatchSnapshot();
    }, 20_000);
});
