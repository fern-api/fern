import { buildASTSchema, GraphQLObjectType, GraphQLUnionType, print } from "graphql";
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
});
