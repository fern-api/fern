import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getOpenAPISettings, type OpenAPISpec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DocsDefinitionResolver, type RegisterApiFn } from "../DocsDefinitionResolver.js";

describe("DocsDefinitionResolver direct API specs", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    it("resolves an API reference without generators.yml", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-direct-docs-api-"));
        temporaryDirectories.push(directory);
        const fernDirectory = path.join(directory, "fern");
        await mkdir(path.join(directory, "specs"));
        await mkdir(fernDirectory);
        await writeFile(
            path.join(directory, "specs", "openapi.yml"),
            [
                "openapi: 3.0.0",
                "info:",
                "  title: Payments",
                "  version: 1.0.0",
                "paths:",
                "  /payments:",
                "    get:",
                "      operationId: listPayments",
                "      responses:",
                "        '200':",
                "          description: Success",
                ""
            ].join("\n")
        );
        await writeFile(
            path.join(fernDirectory, "docs.yml"),
            [
                "instances: []",
                "navigation:",
                "  - api: API reference",
                "    api-name: payments",
                "    specs:",
                "      - type: openapi",
                "        path: ../specs/openapi.yml",
                ""
            ].join("\n")
        );
        const context = createMockTaskContext();
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: AbsoluteFilePath.of(fernDirectory),
            context
        });
        if (docsWorkspace == null) {
            throw new Error("Expected docs workspace");
        }
        const registerApi = vi.fn<RegisterApiFn>(async () => "payments-api-definition");
        const resolver = new DocsDefinitionResolver({
            domain: "docs.example.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi
        });

        await resolver.resolve();

        expect(registerApi).toHaveBeenCalledOnce();
        expect(registerApi.mock.calls[0]?.[0]).toMatchObject({ apiName: "payments" });
    });

    it("applies docs import settings to direct API specs", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-direct-docs-settings-"));
        temporaryDirectories.push(directory);
        const fernDirectory = path.join(directory, "fern");
        await mkdir(path.join(directory, "specs"));
        await mkdir(fernDirectory);
        await writeFile(
            path.join(directory, "specs", "openapi.yml"),
            [
                "openapi: 3.0.0",
                "info:",
                "  title: Events",
                "  version: 1.0.0",
                "paths:",
                "  /events:",
                "    get:",
                "      operationId: listEvents",
                "      responses:",
                "        '200':",
                "          description: Success",
                "          content:",
                "            application/json:",
                "              schema:",
                "                $ref: '#/components/schemas/Event'",
                "components:",
                "  schemas:",
                "    Event:",
                "      type: object",
                "      required: [createdAt]",
                "      properties:",
                "        createdAt:",
                "          type: string",
                "          format: date-time",
                ""
            ].join("\n")
        );
        await writeFile(
            path.join(fernDirectory, "docs.yml"),
            [
                "instances: []",
                "navigation:",
                "  - api: API reference",
                "    specs:",
                "      - type: openapi",
                "        path: ../specs/openapi.yml",
                "        settings:",
                "          type-dates-as-strings: true",
                "          use-bytes-for-binary-response: false",
                "          respect-parameter-content: true",
                "          respect-operation-id-word-boundaries: true",
                "          infer-forward-compatible: true",
                "          preserve-one-of-in-all-of: true",
                "          any-of-sibling-properties-as-object: true",
                "          error-responses:",
                "            schema:",
                "              type: object",
                "            apply-to: untyped",
                ""
            ].join("\n")
        );
        const context = createMockTaskContext();
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: AbsoluteFilePath.of(fernDirectory),
            context
        });
        if (docsWorkspace == null) {
            throw new Error("Expected docs workspace");
        }
        const registerApi = vi.fn<RegisterApiFn>(async () => "events-api-definition");
        const resolver = new DocsDefinitionResolver({
            domain: "docs.example.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi
        });

        await resolver.resolve();

        const ir = registerApi.mock.calls[0]?.[0].ir;
        const eventType = ir?.types.Event;
        expect(eventType?.shape.type).toBe("object");
        if (eventType?.shape.type !== "object") {
            throw new Error("Expected Event to be an object type");
        }
        const createdAt = eventType.shape.properties.find((property) =>
            typeof property.name === "string" ? property.name === "createdAt" : property.name.wireValue === "createdAt"
        );
        expect(createdAt?.valueType).toMatchObject({
            type: "primitive",
            primitive: {
                v1: "STRING",
                v2: { type: "string", validation: { format: "date-time" } }
            }
        });
    });

    it("resolves a GraphQL-only API reference without generators.yml", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-direct-docs-graphql-"));
        temporaryDirectories.push(directory);
        const fernDirectory = path.join(directory, "fern");
        await mkdir(path.join(directory, "specs"));
        await mkdir(fernDirectory);
        await writeFile(
            path.join(directory, "specs", "schema.graphql"),
            [
                "type Query {",
                "  payment(id: ID!): Payment",
                "}",
                "",
                "type Payment {",
                "  id: ID!",
                "  amount: Int!",
                "}",
                ""
            ].join("\n")
        );
        await writeFile(
            path.join(fernDirectory, "docs.yml"),
            [
                "instances: []",
                "navigation:",
                "  - api: GraphQL API reference",
                "    api-name: payments",
                "    specs:",
                "      - type: graphql",
                "        path: ../specs/schema.graphql",
                ""
            ].join("\n")
        );
        const context = createMockTaskContext();
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: AbsoluteFilePath.of(fernDirectory),
            context
        });
        if (docsWorkspace == null) {
            throw new Error("Expected docs workspace");
        }
        const registerApi = vi.fn<RegisterApiFn>(async () => "payments-api-definition");
        const resolver = new DocsDefinitionResolver({
            domain: "docs.example.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi
        });

        await resolver.resolve();

        expect(registerApi).toHaveBeenCalledOnce();
        const registration = registerApi.mock.calls[0]?.[0];
        expect(registration).toMatchObject({ apiName: "payments" });
        expect(Object.keys(registration?.graphqlOperations ?? {})).toHaveLength(1);
        expect(Object.keys(registration?.graphqlTypes ?? {}).length).toBeGreaterThan(0);
    });

    it("fails direct GraphQL resolution when the schema is malformed", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-direct-docs-invalid-graphql-"));
        temporaryDirectories.push(directory);
        const fernDirectory = path.join(directory, "fern");
        await mkdir(path.join(directory, "specs"));
        await mkdir(fernDirectory);
        await writeFile(path.join(directory, "specs", "schema.graphql"), "type Query {\n");
        await writeFile(
            path.join(fernDirectory, "docs.yml"),
            [
                "instances: []",
                "navigation:",
                "  - api: GraphQL API reference",
                "    specs:",
                "      - type: graphql",
                "        path: ../specs/schema.graphql",
                ""
            ].join("\n")
        );
        const context = createMockTaskContext();
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: AbsoluteFilePath.of(fernDirectory),
            context
        });
        if (docsWorkspace == null) {
            throw new Error("Expected docs workspace");
        }
        const resolver = new DocsDefinitionResolver({
            domain: "docs.example.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi: vi.fn<RegisterApiFn>(async () => "payments-api-definition")
        });

        await expect(resolver.resolve()).rejects.toThrow("Failed to process GraphQL spec(s)");
    });

    it("falls back to the configured API workspace when specs is empty", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-direct-docs-empty-specs-"));
        temporaryDirectories.push(directory);
        const fernDirectory = path.join(directory, "fern");
        const specPath = AbsoluteFilePath.of(path.join(directory, "openapi.yml"));
        await mkdir(fernDirectory);
        await writeFile(specPath, "openapi: 3.0.0\ninfo:\n  title: Payments\n  version: 1.0.0\npaths: {}\n");
        await writeFile(
            path.join(fernDirectory, "docs.yml"),
            "instances: []\nnavigation:\n  - api: API reference\n    api-name: payments\n    specs: []\n"
        );
        const context = createMockTaskContext();
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: AbsoluteFilePath.of(fernDirectory),
            context
        });
        if (docsWorkspace == null) {
            throw new Error("Expected docs workspace");
        }
        const spec: OpenAPISpec = {
            type: "openapi",
            absoluteFilepath: specPath,
            absoluteFilepathToOverrides: undefined,
            absoluteFilepathToOverlays: undefined,
            settings: getOpenAPISettings(),
            source: { type: "openapi", file: specPath }
        };
        const legacyWorkspace = new OSSWorkspace({
            allSpecs: [spec],
            specs: [spec],
            workspaceName: "payments",
            absoluteFilePath: AbsoluteFilePath.of(fernDirectory),
            generatorsConfiguration: undefined,
            cliVersion: "test"
        });
        const registerApi = vi.fn<RegisterApiFn>(async () => "payments-api-definition");
        const resolver = new DocsDefinitionResolver({
            domain: "docs.example.com",
            docsWorkspace,
            ossWorkspaces: [legacyWorkspace],
            apiWorkspaces: [legacyWorkspace],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi
        });

        await resolver.resolve();

        expect(registerApi).toHaveBeenCalledOnce();
    });

    it("rejects an array of overlays because the source loader supports one overlay", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-direct-docs-multiple-overlays-"));
        temporaryDirectories.push(directory);
        const fernDirectory = path.join(directory, "fern");
        await mkdir(fernDirectory);
        await writeFile(
            path.join(fernDirectory, "docs.yml"),
            [
                "instances: []",
                "navigation:",
                "  - api: API reference",
                "    specs:",
                "      - type: openapi",
                "        path: ./openapi.yml",
                "        overlays:",
                "          - ./first-overlay.yml",
                "          - ./second-overlay.yml",
                ""
            ].join("\n")
        );

        await expect(
            loadDocsWorkspace({
                fernDirectory: AbsoluteFilePath.of(fernDirectory),
                context: createMockTaskContext()
            })
        ).rejects.toThrow("does not match any allowed schema");
    });

    it("resolves an AsyncAPI reference without generators.yml", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-direct-docs-asyncapi-"));
        temporaryDirectories.push(directory);
        const fernDirectory = path.join(directory, "fern");
        await mkdir(path.join(directory, "specs"));
        await mkdir(fernDirectory);
        await writeFile(
            path.join(directory, "specs", "asyncapi.yml"),
            [
                "asyncapi: 2.6.0",
                "info:",
                "  title: Events API",
                "  version: 1.0.0",
                "servers:",
                "  production:",
                "    url: wss://api.example.com/events",
                "    protocol: wss",
                "channels:",
                "  users/signed-up:",
                "    subscribe:",
                "      operationId: receiveUserSignedUp",
                "      message:",
                "        name: UserSignedUp",
                "        payload:",
                "          type: object",
                "          properties:",
                "            id:",
                "              type: string",
                ""
            ].join("\n")
        );
        await writeFile(
            path.join(fernDirectory, "docs.yml"),
            [
                "instances: []",
                "navigation:",
                "  - api: Events API reference",
                "    api-name: events",
                "    specs:",
                "      - type: asyncapi",
                "        path: ../specs/asyncapi.yml",
                ""
            ].join("\n")
        );
        const context = createMockTaskContext();
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: AbsoluteFilePath.of(fernDirectory),
            context
        });
        if (docsWorkspace == null) {
            throw new Error("Expected docs workspace");
        }
        const registerApi = vi.fn<RegisterApiFn>(async () => "events-api-definition");
        const resolver = new DocsDefinitionResolver({
            domain: "docs.example.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi
        });

        await resolver.resolve();

        expect(registerApi).toHaveBeenCalledOnce();
        const registration = registerApi.mock.calls[0]?.[0];
        expect(registration).toMatchObject({ apiName: "events" });
        const websocketChannels = Object.values(registration?.ir.websocketChannels ?? {});
        expect(websocketChannels).toHaveLength(1);
        expect(websocketChannels[0]?.path.head).toBe("/users/signed-up");
    });
});
