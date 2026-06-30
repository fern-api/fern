import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";

import { createTempFixture } from "../../utils/createTempFixture.js";
import { isDockerAvailable, type LocalRegistry, startLocalRegistry } from "../../utils/dockerRegistry.js";
import { runFernCli } from "../../utils/runFernCli.js";

const SOURCE_IMAGE = "fernapi/fern-typescript-sdk:3.63.3";

const dockerAvailable = await isDockerAvailable();

describe.skipIf(!dockerAvailable)("fern generate --local with custom registry", () => {
    let registry: LocalRegistry;

    beforeAll(async () => {
        registry = await startLocalRegistry(SOURCE_IMAGE);
    }, 180_000);

    afterAll(async () => {
        await registry?.cleanup();
    }, 30_000);

    function generatorsYml(reg: LocalRegistry): string {
        return [
            "api:",
            "  specs:",
            "    - openapi: openapi.yml",
            "default-group: custom",
            "groups:",
            "  custom:",
            "    generators:",
            "      - image:",
            `          name: ${reg.testImage}`,
            `          registry: ${reg.url}`,
            `        version: ${reg.testTag}`,
            "        output:",
            "          location: local-file-system",
            "          path: ../sdks/typescript"
        ].join("\n");
    }

    it("generates SDK from custom registry image when authenticated", async ({ signal }) => {
        const fixture = await createTempFixture({
            "fern/fern.config.json": JSON.stringify({ organization: "fern", version: "0.0.0" }),
            "fern/generators.yml": generatorsYml(registry),
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

    it("fails to generate when not authenticated with custom registry", async ({ signal }) => {
        // Remove image from Docker daemon cache to force a fresh pull from the registry
        await loggingExeca(undefined, "docker", ["rmi", registry.fullImageRef], {
            doNotPipeOutput: true,
            reject: false
        });
        await registry.logout();

        const fixture = await createTempFixture({
            "fern/fern.config.json": JSON.stringify({ organization: "fern", version: "0.0.0" }),
            "fern/generators.yml": generatorsYml(registry),
            "fern/openapi.yml": MINIMAL_OPENAPI
        });

        try {
            const { failed } = await runFernCli(["generate", "--local", "--keepDocker"], {
                cwd: fixture.path,
                reject: false,
                signal
            });

            expect(failed).toBe(true);
        } finally {
            await registry.login();
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
