import { buildGraphqlQuery, type GraphqlArgTypeRegistry } from "../../../src/core/graphql/index";

describe("buildGraphqlQuery", () => {
    const userScaffolding = {
        operationType: "QUERY",
        operationName: "user",
        variableDefinitions: "$id: ID!",
        arguments: "(id: $id)"
    };

    it("builds a query with variables, args, and a flat scalar selection", () => {
        const { query, variables } = buildGraphqlQuery(userScaffolding, { id: true, name: true });
        expect(query).toBe("query user($id: ID!) {\n  user(id: $id) { id name }\n}");
        expect(variables).toEqual({});
    });

    it("recurses into nested object selections", () => {
        const { query } = buildGraphqlQuery(userScaffolding, {
            id: true,
            posts: { title: true, author: { name: true } }
        });
        expect(query).toContain("posts { title author { name } }");
    });

    it("skips false/undefined fields", () => {
        const { query } = buildGraphqlQuery(userScaffolding, { id: true, name: false, email: undefined });
        expect(query).toContain("{ id }");
        expect(query).not.toContain("name");
        expect(query).not.toContain("email");
    });

    it("emits inline fragments and __typename for __on (interface/union)", () => {
        const { query } = buildGraphqlQuery(
            { operationType: "QUERY", operationName: "search", variableDefinitions: "$q: String!", arguments: "(query: $q)" },
            { __on: { User: { id: true, name: true }, Post: { title: true } } }
        );
        expect(query).toContain("__typename");
        expect(query).toContain("... on User { id name }");
        expect(query).toContain("... on Post { title }");
    });

    it("handles no-argument operations (omits parens)", () => {
        const { query } = buildGraphqlQuery(
            { operationType: "QUERY", operationName: "site", variableDefinitions: "", arguments: "" },
            { settings: { storeName: true } }
        );
        expect(query).toBe("query site {\n  site { settings { storeName } }\n}");
    });

    it("never produces an empty selection set", () => {
        const { query } = buildGraphqlQuery(userScaffolding, {});
        expect(query).toContain("{ __typename }");
    });

    it("lowercases the operation type", () => {
        const { query } = buildGraphqlQuery(
            { operationType: "MUTATION", operationName: "createCart", variableDefinitions: "$input: CreateCartInput!", arguments: "(input: $input)" },
            { entityId: true }
        );
        expect(query.startsWith("mutation createCart($input: CreateCartInput!)")).toBe(true);
    });

    describe("__args (nested-field arguments)", () => {
        const registry: GraphqlArgTypeRegistry = {
            User: {
                posts: {
                    type: "PostConnection",
                    args: { first: "Int", after: "String", sortBy: "PostSort", filter: "PostFilter" }
                }
            },
            PostConnection: {
                edges: { type: "PostEdge" }
            },
            PostEdge: {
                node: { type: "Post" }
            },
            Post: {}
        };

        it("emits __args as variables and returns their values", () => {
            const { query, variables } = buildGraphqlQuery(
                userScaffolding,
                {
                    name: true,
                    posts: {
                        __args: { first: 10, after: "cur", sortBy: "NEWEST", filter: { search: "x" } },
                        edges: { node: { title: true } }
                    }
                },
                { rootType: "User", registry }
            );
            expect(query).toContain("posts(first: $gqlArg0, after: $gqlArg1, sortBy: $gqlArg2, filter: $gqlArg3)");
            expect(query).toContain("edges { node { title } }");
            // operation signature merges the scaffolding $id with the allocated nested variables
            expect(query).toContain(
                "query user($id: ID!, $gqlArg0: Int, $gqlArg1: String, $gqlArg2: PostSort, $gqlArg3: PostFilter)"
            );
            expect(variables).toEqual({
                gqlArg0: 10,
                gqlArg1: "cur",
                gqlArg2: "NEWEST",
                gqlArg3: { search: "x" }
            });
        });

        it("does not emit __args as a selected field", () => {
            const { query } = buildGraphqlQuery(
                userScaffolding,
                { posts: { __args: { first: 5 }, edges: { node: { title: true } } } },
                { rootType: "User", registry }
            );
            expect(query).not.toContain("__args");
        });

        it("skips undefined arg values", () => {
            const { query, variables } = buildGraphqlQuery(
                userScaffolding,
                { posts: { __args: { first: 5, after: undefined }, edges: { node: { title: true } } } },
                { rootType: "User", registry }
            );
            expect(query).toContain("posts(first: $gqlArg0)");
            expect(query).not.toContain("after");
            expect(variables).toEqual({ gqlArg0: 5 });
        });

        it("ignores __args when no arg context is supplied", () => {
            const { query, variables } = buildGraphqlQuery(userScaffolding, {
                posts: { __args: { first: 5 }, edges: { node: { title: true } } }
            });
            expect(query).not.toContain("$gqlArg");
            expect(query).toContain("posts { edges { node { title } } }");
            expect(variables).toEqual({});
        });

        it("composes __args with __on and normal sub-fields", () => {
            const registryWithUnion: GraphqlArgTypeRegistry = {
                Query: {
                    feed: { type: "FeedItem", args: { first: "Int" } }
                },
                FeedItem: {},
                User: {},
                Post: {}
            };
            const { query, variables } = buildGraphqlQuery(
                { operationType: "QUERY", operationName: "feed", variableDefinitions: "", arguments: "" },
                {
                    feed: {
                        __args: { first: 3 },
                        __typename: true,
                        __on: { User: { id: true }, Post: { title: true } }
                    }
                },
                { rootType: "Query", registry: registryWithUnion }
            );
            expect(query).toContain("feed(first: $gqlArg0)");
            expect(query).toContain("... on User { id }");
            expect(query).toContain("... on Post { title }");
            expect(query).toContain("query feed($gqlArg0: Int)");
            expect(variables).toEqual({ gqlArg0: 3 });
        });
    });

    describe("__all expansion", () => {
        const registry: GraphqlArgTypeRegistry = {
            User: { id: {}, name: {}, email: {}, posts: { type: "PostConnection" } }
        };
        const viewerScaffolding = { operationType: "QUERY", operationName: "viewer" };

        it("expands __all to the type's scalar fields, excluding object relations", () => {
            const { query } = buildGraphqlQuery(viewerScaffolding, { __all: true }, { rootType: "User", registry });
            expect(query).toContain("{ id name email }");
            expect(query).not.toContain("posts");
        });

        it("dedupes __all against explicitly selected fields and keeps relations", () => {
            const { query } = buildGraphqlQuery(
                viewerScaffolding,
                { __all: true, id: true, posts: { edges: true } },
                { rootType: "User", registry }
            );
            expect(query).toContain("posts {");
            expect((query.match(/\bid\b/g) ?? []).length).toBe(1);
        });

        it("is ignored when there is no registry entry for the type", () => {
            const { query } = buildGraphqlQuery(viewerScaffolding, { __all: true }, { rootType: "Unknown", registry });
            expect(query).toContain("{ __typename }");
        });
    });

    describe("document size guard", () => {
        it("throws when the built document exceeds maxDocumentLength", () => {
            expect(() =>
                buildGraphqlQuery(
                    userScaffolding,
                    { id: true, name: true },
                    { rootType: "User", registry: {}, maxDocumentLength: 10 }
                )
            ).toThrow(/exceeding the 10-character limit/);
        });

        it("does not throw when the document is within maxDocumentLength", () => {
            const { query } = buildGraphqlQuery(
                userScaffolding,
                { id: true },
                { rootType: "User", registry: {}, maxDocumentLength: 10_000 }
            );
            expect(query).toContain("user(id: $id)");
        });

        it("disables the guard when maxDocumentLength is 0", () => {
            const { query } = buildGraphqlQuery(
                userScaffolding,
                { id: true, name: true },
                { rootType: "User", registry: {}, maxDocumentLength: 0 }
            );
            expect(query).toContain("{ id name }");
        });
    });
});
