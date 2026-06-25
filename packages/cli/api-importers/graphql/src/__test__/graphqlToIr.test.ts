import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-api/ir-sdk";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { GraphQLToIRConverter } from "../GraphQLToIRConverter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASIC_SCHEMA = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures"),
    RelativeFilePath.of("basic"),
    RelativeFilePath.of("schema.graphql")
);

function nameToString(name: FernIr.NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}

describe("GraphQLToIRConverter", () => {
    it("converts the basic fixture into a valid IR", async () => {
        const converter = new GraphQLToIRConverter({
            context: createMockTaskContext(),
            filePath: BASIC_SCHEMA
        });

        const ir = await converter.convert();

        // Types are present.
        for (const expectedType of ["User", "Post", "UserRole", "SearchResult", "CreateUserInput"]) {
            expect(ir.types[expectedType], `expected type ${expectedType}`).toBeDefined();
        }

        // Services exist and have endpoints.
        const services = Object.values(ir.services);
        expect(services.length).toBeGreaterThan(0);
        const allEndpoints = services.flatMap((service) => service.endpoints);
        expect(allEndpoints.length).toBeGreaterThan(0);

        // At least one endpoint uses the graphql transport with a non-empty query.
        const graphqlEndpoints = allEndpoints.filter((endpoint) => endpoint.transport?.type === "graphql");
        expect(graphqlEndpoints.length).toBeGreaterThan(0);

        // Find the `user` query endpoint.
        const userEndpoint = allEndpoints.find((endpoint) => nameToString(endpoint.name) === "user");
        expect(userEndpoint).toBeDefined();
        const transport = userEndpoint?.transport;
        expect(transport?.type).toBe("graphql");
        if (transport?.type === "graphql") {
            expect(transport.query.length).toBeGreaterThan(0);
            expect(transport.operationName).toBe("user");
            expect(transport.operationType).toBe(FernIr.GraphqlOperationType.Query);
        }

        // The `user` query response body resolves to the User type. The field is nullable,
        // so the response is optional(named(User)).
        const responseBody = userEndpoint?.response?.body;
        expect(responseBody?.type).toBe("json");
        if (responseBody?.type === "json" && responseBody.value.type === "response") {
            const responseBodyType = responseBody.value.responseBodyType;
            expect(responseBodyType.type).toBe("container");
            if (responseBodyType.type === "container" && responseBodyType.container.type === "optional") {
                const inner = responseBodyType.container.optional;
                expect(inner.type).toBe("named");
                if (inner.type === "named") {
                    expect(inner.typeId).toBe("User");
                }
            }
        }

        // The root package wires up subpackages for the services with endpoints.
        expect(ir.rootPackage.subpackages.length).toBeGreaterThan(0);
        for (const subpackageId of ir.rootPackage.subpackages) {
            const subpackage = ir.subpackages[subpackageId];
            expect(subpackage).toBeDefined();
            expect(subpackage?.service).toBeDefined();
        }
    }, 30_000);
});
