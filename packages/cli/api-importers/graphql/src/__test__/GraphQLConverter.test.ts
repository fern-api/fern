import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext, type TaskContext } from "@fern-api/task-context";
import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { GraphQLConverter } from "../GraphQLConverter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const filterFixture = process.env.TEST_FIXTURE;

describe("GraphQLConverter", async () => {
    for (const fixture of await readdir(FIXTURES_DIR, { withFileTypes: true })) {
        if (!fixture.isDirectory() || (filterFixture && fixture.name !== filterFixture)) {
            continue;
        }

        it(fixture.name, async () => {
            const fixtureDir = join(FIXTURES_DIR, RelativeFilePath.of(fixture.name));
            // A fixture may hold several SDL files, which is how a schema split across federated
            // subgraphs is expressed.
            const filePaths = (await readdir(fixtureDir))
                .filter((file) => file.endsWith(".graphql"))
                .sort()
                .map((file) => join(fixtureDir, RelativeFilePath.of(file)));
            const context = createMockTaskContext();

            const converter = new GraphQLConverter({
                context,
                filePath: filePaths
            });

            const result = await converter.convert();

            await expect(JSON.stringify(result, undefined, 2)).toMatchFileSnapshot(
                `./__snapshots__/${fixture.name}.json`
            );
        }, 30_000);
    }
});

describe("GraphQLConverter custom scalars", () => {
    const BASIC_SCHEMA = join(FIXTURES_DIR, RelativeFilePath.of("basic"), RelativeFilePath.of("schema.graphql"));

    it("emits every custom scalar as a named type in the types map", async () => {
        const converter = new GraphQLConverter({
            context: createMockTaskContext(),
            filePath: BASIC_SCHEMA
        });

        const { types } = await converter.convert();

        // Each custom scalar in the schema must appear as a named type so the frontend can
        // anchor to it. Built-in scalars (String, Int, ...) are intentionally not emitted.
        const customScalars = ["DateTime", "Date", "Email", "URL", "UUID", "JSON", "Upload", "BigInt", "Decimal"];
        for (const scalarName of customScalars) {
            const definition = types[FdrAPI.TypeId(scalarName)];
            expect(definition, `expected custom scalar "${scalarName}" to be emitted`).toBeDefined();
            expect(definition?.name).toBe(scalarName);
            expect(definition?.shape.type).toBe("alias");
        }

        for (const builtInScalar of ["String", "Int", "Float", "Boolean", "ID"]) {
            expect(types[FdrAPI.TypeId(builtInScalar)]).toBeUndefined();
        }
    });

    it("references custom scalars by their stable id", async () => {
        const converter = new GraphQLConverter({
            context: createMockTaskContext(),
            filePath: BASIC_SCHEMA
        });

        const { types } = await converter.convert();

        const user = types[FdrAPI.TypeId("User")];
        expect(user?.shape.type).toBe("object");
        if (user?.shape.type !== "object") {
            throw new Error("expected User to be an object type");
        }
        const createdAt = user.shape.properties.find((property) => property.key === "createdAt");
        expect(createdAt?.valueType).toEqual({ type: "id", value: FdrAPI.TypeId("DateTime"), default: undefined });
    });

    it("resolves colliding namespace operations to distinct ids without dropping any", async () => {
        const schema = join(
            FIXTURES_DIR,
            RelativeFilePath.of("namespace-collisions"),
            RelativeFilePath.of("schema.graphql")
        );
        const converter = new GraphQLConverter({
            context: createMockTaskContext(),
            filePath: schema
        });

        const { graphqlOperations } = await converter.convert();
        const ids = Object.keys(graphqlOperations);

        // 3 parent operations (inventory, stock, catalog) + 6 namespaced children
        // (inventory/stock each contribute inventory + search; catalog contributes
        // search + featured). A silent id collision would shrink this count.
        expect(ids).toHaveLength(9);
        expect(new Set(ids).size).toBe(ids.length);

        // The root parent operation keeps the flat id even though a child field shares its name.
        expect(graphqlOperations[FdrAPI.GraphQlOperationId("query_inventory")]).toBeDefined();
        // The colliding child and the cross-namespace duplicates fall back to namespaced ids.
        for (const id of [
            "query_inventory.inventory",
            "query_stock.inventory",
            "query_inventory.search",
            "query_stock.search",
            "query_catalog.search"
        ]) {
            expect(graphqlOperations[FdrAPI.GraphQlOperationId(id)], `expected operation "${id}"`).toBeDefined();
        }
    });

    it("namespaces custom scalar ids", async () => {
        const converter = new GraphQLConverter({
            context: createMockTaskContext(),
            filePath: BASIC_SCHEMA,
            namespace: "myapi"
        });

        const { types } = await converter.convert();

        expect(types[FdrAPI.TypeId("myapi_DateTime")]).toBeDefined();
        expect(types[FdrAPI.TypeId("DateTime")]).toBeUndefined();
    });

    it("keeps the first examples and warns when two specs document the same operation", async () => {
        const mockContext = createMockTaskContext();
        const warnings: string[] = [];
        const context: TaskContext = {
            ...mockContext,
            logger: {
                ...mockContext.logger,
                warn: (...args: unknown[]) => {
                    warnings.push(args.join(" "));
                }
            }
        };
        const converter = new GraphQLConverter({
            context,
            filePath: BASIC_SCHEMA,
            examples: [
                {
                    operation: "users",
                    operationType: "query",
                    examples: [{ query: "query { users { id } }", name: "from spec A" }]
                },
                {
                    operation: "users",
                    operationType: "query",
                    examples: [{ query: "query { users { id } }", name: "from spec B" }]
                }
            ]
        });

        const { graphqlOperations } = await converter.convert();

        expect(warnings.some((warning) => warning.includes("query:users"))).toBe(true);
        expect(graphqlOperations[FdrAPI.GraphQlOperationId("query_users")]?.examples?.[0]?.name).toBe("from spec A");
    });
});
