import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
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
