import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("global header provenance", () => {
    it("distinguishes source extension headers from heuristically promoted headers", async () => {
        const fixturePath = join(
            FIXTURES_DIR,
            RelativeFilePath.of("x-fern-global-headers"),
            RelativeFilePath.of("fern")
        );
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: fixturePath,
            context,
            cliVersion: "0.0.0",
            workspaceName: "x-fern-global-headers"
        });
        if (!workspace.didSucceed) {
            throw new Error(`Failed to load x-fern-global-headers fixture\n${JSON.stringify(workspace.failures)}`);
        }

        const definition = await workspace.workspace.getDefinition({
            context,
            absoluteFilePath: AbsoluteFilePath.of("/DUMMY_PATH")
        });

        expect(new Set(definition.sourceDerivedGlobalHeaderNames)).toEqual(
            new Set(["my-api-key", "another_header", "version"])
        );
        expect(definition.sourceDerivedGlobalHeaderNames).toHaveLength(3);
        expect(Object.prototype.propertyIsEnumerable.call(definition, "sourceDerivedGlobalHeaderNames")).toBe(false);
        expect(definition.rootApiFile.contents.headers).toHaveProperty("x-api-key");
        expect(definition.sourceDerivedGlobalHeaderNames).not.toContain("x-api-key");

        const definitionWithConfiguredHeaders = await workspace.workspace.getDefinition(
            { context, absoluteFilePath: AbsoluteFilePath.of("/DUMMY_PATH") },
            { headers: { "X-Configured": "string" } }
        );
        expect(new Set(definitionWithConfiguredHeaders.sourceDerivedGlobalHeaderNames)).toEqual(
            new Set(["my-api-key", "another_header", "version"])
        );
        expect(definitionWithConfiguredHeaders.rootApiFile.contents.headers).toEqual({ "X-Configured": "string" });
    }, 90_000);

    it("tracks a global header introduced by a retained override", async () => {
        const temporaryDirectory = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-header-provenance-")));
        const fernDirectory = join(temporaryDirectory, RelativeFilePath.of("fern"));
        await mkdir(fernDirectory);
        try {
            await Promise.all([
                writeFile(
                    join(temporaryDirectory, RelativeFilePath.of("openapi.yml")),
                    `openapi: 3.1.0
info:
  title: Header override provenance
  version: 1.0.0
paths:
  /users:
    get:
      parameters:
        - in: header
          name: x-api-key
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Success
`
                ),
                writeFile(
                    join(temporaryDirectory, RelativeFilePath.of("overrides.yml")),
                    `x-fern-global-headers:
  - header: x-api-key
    name: apiKey
    optional: true
`
                ),
                writeFile(
                    join(fernDirectory, RelativeFilePath.of("fern.config.json")),
                    JSON.stringify({ organization: "fern", version: "*" })
                ),
                writeFile(
                    join(fernDirectory, RelativeFilePath.of("generators.yml")),
                    `api:
  specs:
    - openapi: ../openapi.yml
      overrides: ../overrides.yml
`
                )
            ]);

            const context = createMockTaskContext();
            const workspace = await loadAPIWorkspace({
                absolutePathToWorkspace: fernDirectory,
                context,
                cliVersion: "0.0.0",
                workspaceName: "global-header-override"
            });
            if (!workspace.didSucceed) {
                throw new Error(`Failed to load global header override fixture\n${JSON.stringify(workspace.failures)}`);
            }

            const definition = await workspace.workspace.getDefinition({ context });

            expect(definition.sourceDerivedGlobalHeaderNames).toEqual(["x-api-key"]);
        } finally {
            await rm(temporaryDirectory, { force: true, recursive: true });
        }
    }, 90_000);
});
