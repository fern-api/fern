import { buildASTSchema, GraphQLObjectType, GraphQLUnionType, print, validateSchema } from "graphql";
import { describe, expect, it } from "vitest";

import { mergeGraphQlDocuments } from "../mergeGraphQlDocuments.js";

function buildSchemaFrom(sources: { filePath: string; sdl: string }[]) {
    const { document, conflicts } = mergeGraphQlDocuments(sources);
    return { schema: buildASTSchema(document, { assumeValidSDL: true }), conflicts, document };
}

describe("mergeGraphQlDocuments", () => {
    it("merges root type extensions from every subgraph into one Query and Mutation", () => {
        const { schema, conflicts } = buildSchemaFrom([
            {
                filePath: "core.graphql",
                sdl: `
                    type Query { userProfile(id: ID!): UserProfile }
                    type Mutation { updateUserProfile(id: ID!): UserProfile }
                    type UserProfile @key(fields: "id") { id: ID!, profileImages: ProfileImages }
                `
            },
            {
                filePath: "images.graphql",
                sdl: `
                    extend type Query { profileImages(profileId: ID!): ProfileImages }
                    extend type Mutation { updateProfileImage(profileId: ID!): ProfileImages }
                    type ProfileImages @key(fields: "profileId") { profileId: ID! }
                `
            }
        ]);

        expect(Object.keys(schema.getQueryType()?.getFields() ?? {})).toEqual(["userProfile", "profileImages"]);
        expect(Object.keys(schema.getMutationType()?.getFields() ?? {})).toEqual([
            "updateUserProfile",
            "updateProfileImage"
        ]);
        // The cross-file reference resolves, which is what a single subgraph cannot do on its own.
        expect(schema.getType("ProfileImages")).toBeDefined();
        expect(conflicts).toEqual([]);
    });

    it("strips federation directives but keeps @deprecated", () => {
        const { document } = buildSchemaFrom([
            {
                filePath: "core.graphql",
                sdl: `
                    extend schema @link(url: "https://specs.apollo.dev/federation/v2.5", import: ["@key"])
                    type UserProfile @key(fields: "id") {
                        id: ID! @external
                        nickname: String @deprecated(reason: "Use displayName.")
                    }
                `
            }
        ]);

        const printed = print(document);
        expect(printed).not.toContain("@key");
        expect(printed).not.toContain("@external");
        expect(printed).not.toContain("@link");
        expect(printed).toContain('@deprecated(reason: "Use displayName.")');
    });

    it("removes @inaccessible members and types, cascading to everything that references them", () => {
        const { schema } = buildSchemaFrom([
            {
                filePath: "core.graphql",
                sdl: `
                    type Query { userProfile(id: ID!): UserProfile }
                    type UserProfile {
                        id: ID!
                        internalScore: Int @inaccessible
                        storage: ProfileStorage
                        audit(filter: AuditFilter): String
                    }
                    type ProfileStorage @inaccessible { bucket: String! }
                    input AuditFilter @inaccessible { since: String }
                    type Vault @inaccessible { secret: String! }
                    union ProfileSource = UserProfile | Vault
                `
            }
        ]);

        const userProfile = schema.getType("UserProfile");
        if (!(userProfile instanceof GraphQLObjectType)) {
            throw new Error("expected UserProfile to be an object type");
        }
        // `internalScore` is inaccessible; `storage` and `audit` reference inaccessible types.
        expect(Object.keys(userProfile.getFields())).toEqual(["id"]);
        expect(schema.getType("ProfileStorage")).toBeUndefined();
        expect(schema.getType("AuditFilter")).toBeUndefined();
        expect(schema.getType("Vault")).toBeUndefined();

        const source = schema.getType("ProfileSource");
        if (!(source instanceof GraphQLUnionType)) {
            throw new Error("expected ProfileSource to be a union type");
        }
        expect(source.getTypes().map((type) => type.name)).toEqual(["UserProfile"]);
    });

    it("removes a type whose every member is @inaccessible", () => {
        const { schema } = buildSchemaFrom([
            {
                filePath: "core.graphql",
                sdl: `
                    type Query { userProfile(id: ID!): UserProfile }
                    type UserProfile { id: ID!, internal: Internal }
                    type Internal { a: String @inaccessible, b: String @inaccessible }
                `
            }
        ]);

        expect(schema.getType("Internal")).toBeUndefined();
        const userProfile = schema.getType("UserProfile");
        if (!(userProfile instanceof GraphQLObjectType)) {
            throw new Error("expected UserProfile to be an object type");
        }
        expect(Object.keys(userProfile.getFields())).toEqual(["id"]);
    });

    it("does not report a conflict when a subgraph redeclares an entity key field", () => {
        const { conflicts } = buildSchemaFrom([
            { filePath: "core.graphql", sdl: `type UserProfile @key(fields: "id") { id: ID!, name: String }` },
            { filePath: "images.graphql", sdl: `extend type UserProfile @key(fields: "id") { id: ID! @external }` }
        ]);

        expect(conflicts).toEqual([]);
    });

    it("keeps the first definition and reports a conflict when the same field differs across files", () => {
        const { schema, conflicts } = buildSchemaFrom([
            { filePath: "a.graphql", sdl: `type UserProfile { name: String }` },
            { filePath: "b.graphql", sdl: `extend type UserProfile { name: Int }` }
        ]);

        expect(conflicts).toEqual([
            { typeName: "UserProfile", memberName: "name", kept: "a.graphql", dropped: "b.graphql" }
        ]);
        const userProfile = schema.getType("UserProfile");
        if (!(userProfile instanceof GraphQLObjectType)) {
            throw new Error("expected UserProfile to be an object type");
        }
        expect(String(userProfile.getFields().name?.type)).toBe("String");
    });

    it("names the file that actually won when a type is redeclared with a different kind", () => {
        const { conflicts } = buildSchemaFrom([
            { filePath: "a.graphql", sdl: `scalar Thing` },
            { filePath: "b.graphql", sdl: `type Thing { x: String }` }
        ]);

        expect(conflicts).toEqual([
            { typeName: "Thing", memberName: "<declaration>", kept: "a.graphql", dropped: "b.graphql" }
        ]);
    });

    it("drops `implements` when the @inaccessible cascade leaves the interface unsatisfied", () => {
        const { document } = mergeGraphQlDocuments([
            {
                filePath: "core.graphql",
                sdl: `
                    type Query { node: Node }
                    interface Node { id: ID!, extra: String }
                    type Thing implements Node { id: ID!, extra: String @inaccessible }
                `
            }
        ]);

        // Without this the document builds but `validateSchema` rejects it.
        expect(validateSchema(buildASTSchema(document))).toEqual([]);
        expect(print(document)).not.toContain("implements Node");
    });

    it("keeps `implements` when the cascade leaves the interface satisfied", () => {
        const { schema } = buildSchemaFrom([
            {
                filePath: "core.graphql",
                sdl: `
                    type Query { node: Node }
                    interface Node { id: ID! }
                    type Thing implements Node { id: ID!, internal: String @inaccessible }
                `
            }
        ]);

        const thing = schema.getType("Thing");
        if (!(thing instanceof GraphQLObjectType)) {
            throw new Error("expected Thing to be an object type");
        }
        expect(thing.getInterfaces().map((node) => node.name)).toEqual(["Node"]);
    });

    it("keeps the first directive definition and reports a conflict when a later file differs", () => {
        const { document, conflicts } = mergeGraphQlDocuments([
            {
                filePath: "a.graphql",
                sdl: `directive @foo(x: String) on FIELD_DEFINITION
                      type Query { a: String @foo(x: "1") }`
            },
            { filePath: "b.graphql", sdl: `directive @foo(y: Int) on FIELD_DEFINITION` }
        ]);

        expect(conflicts).toEqual([
            { typeName: "@foo", memberName: "<declaration>", kept: "a.graphql", dropped: "b.graphql" }
        ]);
        // Last-wins would leave `@foo(x:)` referencing an argument the definition no longer declares,
        // forcing the whole document down the `assumeValidSDL` path.
        expect(() => buildASTSchema(document)).not.toThrow();
    });

    it("does not report a conflict when two files declare the same directive identically", () => {
        const { conflicts } = mergeGraphQlDocuments([
            { filePath: "a.graphql", sdl: `directive @foo(x: String) on FIELD_DEFINITION` },
            { filePath: "b.graphql", sdl: `directive @foo(x: String) on FIELD_DEFINITION` }
        ]);

        expect(conflicts).toEqual([]);
    });

    it("reports a member declared twice with differing shapes within one file", () => {
        const { conflicts } = buildSchemaFrom([
            {
                filePath: "a.graphql",
                sdl: `type Query { a: String }
                      extend type Query { a: Int }`
            }
        ]);

        expect(conflicts).toEqual([{ typeName: "Query", memberName: "a", kept: "a.graphql", dropped: "a.graphql" }]);
    });

    it("keeps the first root operation type and reports a conflict when files disagree", () => {
        const { schema, conflicts } = buildSchemaFrom([
            { filePath: "a.graphql", sdl: `schema { query: QueryA } type QueryA { a: String }` },
            { filePath: "b.graphql", sdl: `schema { query: QueryB } type QueryB { b: String }` }
        ]);

        // Last-wins would orphan every operation the first file contributed.
        expect(schema.getQueryType()?.name).toBe("QueryA");
        expect(conflicts).toEqual([
            { typeName: "schema", memberName: "query", kept: "a.graphql", dropped: "b.graphql" }
        ]);
    });

    it("keeps the real definition's description and directives when an extension is parsed first", () => {
        const { document } = mergeGraphQlDocuments([
            {
                filePath: "b.graphql",
                sdl: `directive @auth on OBJECT
                      extend type Foo { y: Int }`
            },
            {
                filePath: "a.graphql",
                sdl: `"""The real doc"""
                      type Foo @auth { x: String }`
            }
        ]);

        const printed = print(document);
        expect(printed).toContain("The real doc");
        expect(printed).toContain("type Foo @auth");
        // The definition's own fields come first regardless of the order the files were listed in.
        expect(printed.indexOf("x: String")).toBeLessThan(printed.indexOf("y: Int"));
    });

    it("names the offending file when one spec in the group cannot be parsed", () => {
        expect(() =>
            mergeGraphQlDocuments([
                { filePath: "good.graphql", sdl: `type Query { a: String }` },
                { filePath: "bad.graphql", sdl: `type {{{ broken` }
            ])
        ).toThrow(/bad\.graphql/);
    });

    it("removes an enum whose every value is @inaccessible, cascading to its references", () => {
        const { schema } = buildSchemaFrom([
            {
                filePath: "a.graphql",
                sdl: `type Query { status: Status, ok: String }
                      enum Status { ACTIVE @inaccessible, ARCHIVED @inaccessible }`
            }
        ]);

        expect(schema.getType("Status")).toBeUndefined();
        expect(Object.keys(schema.getQueryType()?.getFields() ?? {})).toEqual(["ok"]);
    });

    it("removes an @inaccessible scalar and every field that returns it", () => {
        const { schema } = buildSchemaFrom([
            {
                filePath: "a.graphql",
                sdl: `type Query { createdAt: DateTime, ok: String }
                      scalar DateTime @inaccessible`
            }
        ]);

        expect(schema.getType("DateTime")).toBeUndefined();
        expect(Object.keys(schema.getQueryType()?.getFields() ?? {})).toEqual(["ok"]);
    });

    it("removes an @inaccessible interface and drops it from its implementors", () => {
        const { schema } = buildSchemaFrom([
            {
                filePath: "a.graphql",
                sdl: `interface Node @inaccessible { id: ID! }
                      type Foo implements Node { id: ID!, name: String }
                      type Query { foo: Foo }`
            }
        ]);

        expect(schema.getType("Node")).toBeUndefined();
        const foo = schema.getType("Foo");
        expect(foo).toBeInstanceOf(GraphQLObjectType);
        if (foo instanceof GraphQLObjectType) {
            expect(foo.getInterfaces()).toEqual([]);
            expect(Object.keys(foo.getFields())).toEqual(["id", "name"]);
        }
    });

    it("drops a root operation type the @inaccessible cascade emptied", () => {
        const { schema } = buildSchemaFrom([
            {
                filePath: "a.graphql",
                sdl: `schema { query: Query, mutation: Mutation }
                      type Query { a: String }
                      type Mutation { rotateSecret: Secret }
                      type Secret @inaccessible { value: String }`
            }
        ]);

        expect(schema.getMutationType()).toBeUndefined();
        expect(schema.getQueryType()?.name).toBe("Query");
    });

    it("strips federation directives from every spec version so the SDL still validates strictly", () => {
        // A subgraph imports these via @link rather than defining them, so any that survive
        // stripping force the whole schema onto the assumeValidSDL fallback, which silences
        // validation for everything else in the file.
        const { document } = mergeGraphQlDocuments([
            {
                filePath: "v29.graphql",
                sdl: `extend schema @link(url: "https://specs.apollo.dev/federation/v2.9", import: ["@cost", "@listSize", "@context", "@fromContext"])
                      type Query { items(first: Int): [Item] @listSize(assumedSize: 10) @cost(weight: 5) }
                      type Item @context(name: "ctx") @key(fields: "id") {
                        id: ID! @cost(weight: 1)
                        related(ctx: String @fromContext(field: "$ctx { id }")): [Item] @listSize(slicingArguments: ["first"])
                      }`
            }
        ]);

        expect(print(document)).not.toMatch(/@(cost|listSize|context|fromContext|link|key)\b/);
        // Strict, not assumeValidSDL: the point is that no unknown directive survives.
        expect(validateSchema(buildASTSchema(document))).toEqual([]);
    });

    it("keeps @deprecated while stripping the federation directives beside it", () => {
        const { document } = mergeGraphQlDocuments([
            {
                filePath: "a.graphql",
                sdl: `type Query { a: String @deprecated(reason: "use b") @cost(weight: 2) b: String }`
            }
        ]);

        const printed = print(document);
        expect(printed).toMatch(/@deprecated\(reason: "use b"\)/);
        expect(printed).not.toMatch(/@cost/);
    });

    it("fails loudly when the @inaccessible cascade empties the query root", () => {
        // Dropping an emptied Mutation leaves a usable schema; dropping the query root leaves
        // nothing, which would silently publish an API with no operations.
        expect(() =>
            mergeGraphQlDocuments([
                {
                    filePath: "a.graphql",
                    sdl: `type Query { secret: Secret }
                          type Secret @inaccessible { value: String }`
                }
            ])
        ).toThrow(/query root "Query".*@inaccessible/s);
    });

    it("fails loudly when the cascade empties a query root declared under another name", () => {
        expect(() =>
            mergeGraphQlDocuments([
                {
                    filePath: "a.graphql",
                    sdl: `schema { query: RootQuery }
                          type RootQuery { secret: Secret }
                          type Secret @inaccessible { value: String }`
                }
            ])
        ).toThrow(/query root "RootQuery"/);
    });

    it("does not fire the query-root guard when the query root keeps a field", () => {
        const { schema } = buildSchemaFrom([
            {
                filePath: "a.graphql",
                sdl: `type Query { secret: Secret ok: String }
                      type Secret @inaccessible { value: String }`
            }
        ]);

        expect(Object.keys(schema.getQueryType()?.getFields() ?? {})).toEqual(["ok"]);
    });

    it("terminates when the @inaccessible cascade runs into a reference cycle", () => {
        const { schema } = buildSchemaFrom([
            {
                filePath: "a.graphql",
                sdl: `type Query { a: A }
                      type A { b: B }
                      type B { a: A, gone: Gone }
                      type Gone @inaccessible { x: String }`
            }
        ]);

        expect(schema.getType("Gone")).toBeUndefined();
        expect(schema.getType("A")).toBeDefined();
        expect(schema.getType("B")).toBeDefined();
    });

    it("unions the members a union declares across files", () => {
        const { schema, conflicts } = buildSchemaFrom([
            {
                filePath: "a.graphql",
                sdl: `union Result = Ok | Failed
                      type Ok { ok: String }
                      type Failed { failed: String }
                      type Query { result: Result }`
            },
            {
                filePath: "b.graphql",
                sdl: `union Result = Failed | Pending
                      type Pending { pending: String }`
            }
        ]);

        const result = schema.getType("Result");
        expect(result).toBeInstanceOf(GraphQLUnionType);
        if (result instanceof GraphQLUnionType) {
            expect(result.getTypes().map((type) => type.name)).toEqual(["Ok", "Failed", "Pending"]);
        }
        expect(conflicts).toEqual([]);
    });

    it("merges a federation v1 `@extends` definition the same way as an `extend type`", () => {
        const { schema, conflicts } = buildSchemaFrom([
            {
                filePath: "a.graphql",
                sdl: `type Query { user: User }
                      type User @key(fields: "id") { id: ID! }`
            },
            {
                filePath: "b.graphql",
                sdl: `type User @extends @key(fields: "id") { id: ID! @external, extra: String }`
            }
        ]);

        const user = schema.getType("User");
        expect(user).toBeInstanceOf(GraphQLObjectType);
        if (user instanceof GraphQLObjectType) {
            expect(Object.keys(user.getFields())).toEqual(["id", "extra"]);
        }
        expect(conflicts).toEqual([]);
    });

    it("drops executable definitions that a spec file happens to contain", () => {
        const { document } = mergeGraphQlDocuments([
            { filePath: "a.graphql", sdl: `type Query { a: String } query Foo { a }` }
        ]);

        expect(print(document)).not.toContain("query Foo");
    });

    it("is a no-op when the same spec is listed twice", () => {
        const { schema, conflicts } = buildSchemaFrom([
            { filePath: "a.graphql", sdl: `type Query { a: String }` },
            { filePath: "a.graphql", sdl: `type Query { a: String }` }
        ]);

        expect(Object.keys(schema.getQueryType()?.getFields() ?? {})).toEqual(["a"]);
        expect(conflicts).toEqual([]);
    });
});
