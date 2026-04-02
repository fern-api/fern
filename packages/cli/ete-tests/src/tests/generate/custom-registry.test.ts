import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";

import { createTempFixture } from "../../utils/createTempFixture.js";
import { isDockerAvailable, type LocalRegistry, startLocalRegistry } from "../../utils/dockerRegistry.js";
import { runFernCli } from "../../utils/runFernCli.js";

const SOURCE_IMAGE = "fernapi/fern-typescript-sdk:3.60.9";
const SOURCE_IR_VERSION = 65;

const dockerAvailable = await isDockerAvailable();

describe.skipIf(!dockerAvailable)("fern generate --local with custom registry", () => {
    let registry: LocalRegistry;

    beforeAll(async () => {
        registry = await startLocalRegistry(SOURCE_IMAGE);
    }, 180_000);

    afterAll(async () => {
        await registry?.cleanup();
    }, 30_000);

    it("generates SDK from custom registry image", async ({ signal }) => {
        const fixture = await createTempFixture({
            "fern/fern.config.json": JSON.stringify({
                organization: "fern",
                version: "0.0.0"
            }),
            "fern/generators.yml": [
                "api:",
                "  specs:",
                "    - openapi: openapi.yml",
                "default-group: custom",
                "groups:",
                "  custom:",
                "    generators:",
                "      - image:",
                `          name: ${registry.testImage}`,
                `          registry: ${registry.url}`,
                `        version: ${registry.testTag}`,
                `        ir-version: v${SOURCE_IR_VERSION}`,
                "        output:",
                "          location: local-file-system",
                "          path: ../sdks/typescript"
            ].join("\n"),
            "fern/openapi.yml": MINIMAL_OPENAPI
        });

        try {
            await runFernCli(["generate", "--local", "--keepDocker"], {
                cwd: fixture.path,
                signal
            });

            expect(
                await doesPathExist(join(AbsoluteFilePath.of(fixture.path), RelativeFilePath.of("sdks/typescript")))
            ).toBe(true);
        } finally {
            await fixture.cleanup();
        }
    }, 300_000);
});

const MINIMAL_OPENAPI = `
openapi: 3.0.3
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
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
`.trimStart();
