import { rm } from "fs/promises";
import path from "path";
import stripAnsi from "strip-ansi";

import { createTempFixture } from "../../utils/createTempFixture.js";
import { runFernCli } from "../../utils/runFernCli.js";

const FIXTURES_DIR = path.join(__dirname, "fixtures");
const FERN_CONFIG_JSON = `{
  "version": "*",
  "organization": "fern"
}
`;
const DOCS_WITH_MULTIPLE_APIS = `instances:
  - url: test.docs.buildwithfern.com

check:
  rules:
    broken-links: error

navigation:
  - page: Home
    path: home.mdx
  - api: First API
    api-name: first
  - api: Second API
    api-name: second
`;
const API_GENERATORS_YML = `api:
  specs:
    - openapi: openapi.yml
groups: {}
`;
const OPENAPI_YML = `openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
paths:
  /health:
    get:
      operationId: healthCheck
      responses:
        "200":
          description: OK
`;

describe("validate", () => {
    itFixture("simple");
    itFixture("docs");
    itFixture("no-api");
    itFixture("no-generator");

    it("check with --api resolves all APIs referenced by docs", async ({ signal }) => {
        const fixture = await createTempFixture({
            "fern/fern.config.json": FERN_CONFIG_JSON,
            "fern/docs.yml": DOCS_WITH_MULTIPLE_APIS,
            "fern/home.mdx": "# Home\n",
            "fern/apis/first/generators.yml": API_GENERATORS_YML,
            "fern/apis/first/openapi.yml": OPENAPI_YML,
            "fern/apis/second/generators.yml": API_GENERATORS_YML,
            "fern/apis/second/openapi.yml": OPENAPI_YML
        });

        try {
            const checkAll = await runFernCli(["check"], {
                cwd: fixture.path,
                reject: false,
                signal
            });
            const checkScoped = await runFernCli(["check", "--api", "first"], {
                cwd: fixture.path,
                reject: false,
                signal
            });

            expect(checkAll.exitCode).toBe(0);
            expect(checkScoped.exitCode).toBe(0);
            expect(stripAnsi(checkScoped.stdout)).not.toContain('Rule "valid-markdown-links" failed to initialize');
        } finally {
            await fixture.cleanup();
        }
    }, 90_000);
});

function itFixture(fixtureName: string) {
    it(// eslint-disable-next-line jest/valid-title
    fixtureName, async ({ signal }) => {
        const fixturePath = path.join(FIXTURES_DIR, fixtureName);
        const irOutputPath = path.join(fixturePath, "api", "ir.json");
        await rm(irOutputPath, { force: true, recursive: true });

        const { stdout } = await runFernCli(["check"], {
            cwd: fixturePath,
            reject: false,
            signal
        });

        const trimmed = stripAnsi(stdout)
            // for some reason, locally the output contains a newline that Circle doesn't
            .trim()
            // Replace variable elapsed time (e.g. "in 0.039 seconds") with a
            // stable placeholder so snapshots don't flake.
            .replace(/in \d+\.\d+ seconds/g, "in __ELAPSED__ seconds");

        expect(trimmed).toMatchSnapshot();
    }, 90_000);
}
