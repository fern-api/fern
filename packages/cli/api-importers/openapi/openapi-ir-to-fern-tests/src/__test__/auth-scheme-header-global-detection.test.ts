import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const OPENAPI = `openapi: 3.1.0
info:
  title: Auth scheme header
  version: 1.0.0
paths:
  /users:
    get:
      operationId: listUsers
      security:
        - ApiKey: []
        - Bearer: []
      parameters:
        - in: header
          name: xi-api-key
          schema:
            type: string
      responses:
        "200":
          description: Success
  /voices:
    get:
      operationId: listVoices
      x-fern-examples:
        - headers:
            xi-api-key: example-key
      security:
        - ApiKey: []
        - Bearer: []
      parameters:
        - in: header
          name: xi-api-key
          schema:
            type: string
      responses:
        "200":
          description: Success
  /models:
    get:
      operationId: listModels
      security:
        - ApiKey: []
        - Bearer: []
      parameters:
        - in: header
          name: xi-api-key
          schema:
            type: string
      responses:
        "200":
          description: Success
  /history:
    get:
      operationId: listHistory
      security:
        - ApiKey: []
        - Bearer: []
      parameters:
        - in: header
          name: Xi-Api-Key
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Success
`;

const GENERATORS_YML = `auth-schemes:
  ApiKey:
    header: xi-api-key
    type: optional<string>
    name: api_key
  Bearer:
    scheme: bearer
    token:
      name: token
api:
  auth:
    endpoint-security: {}
  specs:
    - openapi: ../openapi.yml
`;

describe("auth scheme headers and global header detection", () => {
    it("does not promote headers covered by a generators.yml auth scheme to global headers", async () => {
        const temporaryDirectory = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-auth-header-")));
        const fernDirectory = join(temporaryDirectory, RelativeFilePath.of("fern"));
        await mkdir(fernDirectory);
        try {
            await Promise.all([
                writeFile(join(temporaryDirectory, RelativeFilePath.of("openapi.yml")), OPENAPI),
                writeFile(
                    join(fernDirectory, RelativeFilePath.of("fern.config.json")),
                    JSON.stringify({ organization: "fern", version: "*" })
                ),
                writeFile(join(fernDirectory, RelativeFilePath.of("generators.yml")), GENERATORS_YML)
            ]);

            const context = createMockTaskContext();
            const workspace = await loadAPIWorkspace({
                absolutePathToWorkspace: fernDirectory,
                context,
                cliVersion: "0.0.0",
                workspaceName: "auth-scheme-header"
            });
            if (!workspace.didSucceed) {
                throw new Error(`Failed to load auth scheme header fixture\n${JSON.stringify(workspace.failures)}`);
            }

            const definition = await workspace.workspace.getDefinition({ context });

            expect(definition.rootApiFile.contents.headers ?? {}).toEqual({});
            expect(definition.rootApiFile.contents["auth-schemes"]).toHaveProperty("ApiKey");
            const endpointHeaders = Object.values(definition.namedDefinitionFiles).flatMap((file) =>
                Object.values(file.contents.service?.endpoints ?? {}).flatMap((endpoint) =>
                    typeof endpoint.request === "object" && endpoint.request?.headers != null
                        ? Object.keys(endpoint.request.headers)
                        : []
                )
            );
            expect(endpointHeaders).toEqual([]);
            const exampleHeaders = Object.values(definition.namedDefinitionFiles).flatMap((file) =>
                Object.values(file.contents.service?.endpoints ?? {}).flatMap((endpoint) =>
                    (endpoint.examples ?? []).flatMap((example) => Object.keys(example.headers ?? {}))
                )
            );
            expect(exampleHeaders).toEqual([]);
        } finally {
            await rm(temporaryDirectory, { force: true, recursive: true });
        }
    }, 90_000);
});
