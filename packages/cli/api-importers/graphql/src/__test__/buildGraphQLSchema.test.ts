import { getIntrospectionQuery, graphqlSync, GraphQLObjectType } from "graphql";
import { describe, expect, it } from "vitest";

import { buildGraphQLSchemaFromString } from "../ir-conversion/buildGraphQLSchema.js";

const SDL = `
type Query {
  viewer: User
}

type User {
  id: ID!
  name: String!
}
`;

/** Produces an introspection-query JSON result (the `{ data: { __schema } }` envelope) for the SDL. */
function introspect(sdl: string): string {
    const schema = buildGraphQLSchemaFromString({ content: sdl });
    const result = graphqlSync({ schema, source: getIntrospectionQuery() });
    return JSON.stringify(result);
}

describe("buildGraphQLSchemaFromString", () => {
    it("parses SDL input", () => {
        const schema = buildGraphQLSchemaFromString({ content: SDL, filePath: "schema.graphql" });
        const user = schema.getType("User");
        expect(user).toBeInstanceOf(GraphQLObjectType);
        expect(schema.getQueryType()?.getFields().viewer).toBeDefined();
    });

    it("parses introspection JSON input ({ data: { __schema } } envelope)", () => {
        const schema = buildGraphQLSchemaFromString({ content: introspect(SDL), filePath: "schema.json" });
        const user = schema.getType("User");
        expect(user).toBeInstanceOf(GraphQLObjectType);
        expect(schema.getQueryType()?.getFields().viewer).toBeDefined();
    });

    it("parses introspection JSON by content even without a .json extension", () => {
        const schema = buildGraphQLSchemaFromString({ content: introspect(SDL) });
        expect(schema.getType("User")).toBeInstanceOf(GraphQLObjectType);
    });

    it("parses the bare { __schema } introspection shape (no data envelope)", () => {
        const enveloped = JSON.parse(introspect(SDL)) as { data: unknown };
        const schema = buildGraphQLSchemaFromString({ content: JSON.stringify(enveloped.data), filePath: "x.json" });
        expect(schema.getType("User")).toBeInstanceOf(GraphQLObjectType);
    });
});
