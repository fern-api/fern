import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { buildSchema } from "graphql";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { generateSelectionQuery } from "../query-generation/generateSelectionQuery.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASIC_SCHEMA = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures"),
    RelativeFilePath.of("basic"),
    RelativeFilePath.of("schema.graphql")
);

describe("generateSelectionQuery", () => {
    it("builds a query with variables and nested selection for `user`", async () => {
        const schema = buildSchema(await readFile(BASIC_SCHEMA, "utf-8"));
        const queryType = schema.getQueryType();
        const field = queryType?.getFields().user;
        expect(field).toBeDefined();

        const query = generateSelectionQuery(field!, schema, "query");
        // eslint-disable-next-line no-console
        console.log("\n" + query);

        expect(query).toContain("query user($id: ID!) {");
        expect(query).toContain("user(id: $id) {");
        expect(query).toContain("id");
        expect(query).toContain("name");
        // nested object field recurses
        expect(query).toContain("posts {");
    });

    it("emits __typename and inline fragments for unions (`search`)", async () => {
        const schema = buildSchema(await readFile(BASIC_SCHEMA, "utf-8"));
        const field = schema.getQueryType()?.getFields().search;
        const query = generateSelectionQuery(field!, schema, "query");
        // eslint-disable-next-line no-console
        console.log("\n" + query);

        expect(query).toContain("__typename");
        expect(query).toContain("... on User {");
        expect(query).toContain("... on Post {");
    });

    it("respects depth limiting (no infinite recursion on User<->Post cycle)", async () => {
        const schema = buildSchema(await readFile(BASIC_SCHEMA, "utf-8"));
        const field = schema.getQueryType()?.getFields().user;
        const query = generateSelectionQuery(field!, schema, "query", { maxDepth: 2 });
        // depth 1 = user, depth 2 = posts/scalars; author (depth 3) should be cut
        expect(query).toContain("posts {");
        expect(query).not.toContain("author {");
    });
});
