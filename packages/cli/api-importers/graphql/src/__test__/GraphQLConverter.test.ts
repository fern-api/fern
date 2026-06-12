import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
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
            const fixturePath = join(
                FIXTURES_DIR,
                RelativeFilePath.of(fixture.name),
                RelativeFilePath.of("schema.graphql")
            );
            const context = createMockTaskContext();

            const converter = new GraphQLConverter({
                context,
                filePath: fixturePath
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
});
