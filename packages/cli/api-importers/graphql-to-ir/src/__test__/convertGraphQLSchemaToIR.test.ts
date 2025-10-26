import { describe, it, expect } from "vitest";
import { parseGraphQLSchema } from "../parseGraphQLSchema";
import { convertGraphQLSchemaToIR } from "../convertGraphQLSchemaToIR";
import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { TaskContext } from "@fern-api/task-context";

describe("convertGraphQLSchemaToIR", () => {
    const casingsGenerator = constructCasingsGenerator({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false,
    });

    const mockContext: TaskContext = {
        failAndThrow: (message: string) => {
            throw new Error(message);
        },
    } as TaskContext;

    it("should parse a simple query", () => {
        const schemaContent = `
            type Query {
                hello: String
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(ir.queries).toHaveLength(1);
        expect(ir.queries[0]?.name.originalName).toBe("hello");
        expect(ir.mutations).toHaveLength(0);
        expect(ir.subscriptions).toHaveLength(0);
    });

    it("should parse queries, mutations, and subscriptions", () => {
        const schemaContent = `
            type Query {
                getUser(id: ID!): User
            }

            type Mutation {
                createUser(name: String!): User
            }

            type Subscription {
                userCreated: User
            }

            type User {
                id: ID!
                name: String!
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(ir.queries).toHaveLength(1);
        expect(ir.queries[0]?.name.originalName).toBe("getUser");
        expect(ir.queries[0]?.arguments).toHaveLength(1);
        expect(ir.queries[0]?.arguments[0]?.name.name.originalName).toBe("id");

        expect(ir.mutations).toHaveLength(1);
        expect(ir.mutations[0]?.name.originalName).toBe("createUser");
        expect(ir.mutations[0]?.arguments).toHaveLength(1);

        expect(ir.subscriptions).toHaveLength(1);
        expect(ir.subscriptions[0]?.name.originalName).toBe("userCreated");
    });

    it("should convert object types", () => {
        const schemaContent = `
            type Query {
                getUser: User
            }

            type User {
                id: ID!
                name: String!
                email: String
                age: Int
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(Object.keys(ir.types)).toContain("User");
        const userType = ir.types["User"];
        expect(userType?.type).toBe("object");
        if (userType?.type === "object") {
            expect(userType.fields).toHaveLength(4);
            expect(userType.fields[0]?.name.name.originalName).toBe("id");
            expect(userType.fields[1]?.name.name.originalName).toBe("name");
        }
    });

    it("should convert enum types", () => {
        const schemaContent = `
            type Query {
                getUser: User
            }

            type User {
                id: ID!
                role: Role!
            }

            enum Role {
                ADMIN
                USER
                GUEST
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(Object.keys(ir.types)).toContain("Role");
        const roleType = ir.types["Role"];
        expect(roleType?.type).toBe("enum");
        if (roleType?.type === "enum") {
            expect(roleType.values).toHaveLength(3);
            expect(roleType.values[0]?.name.name.originalName).toBe("ADMIN");
            expect(roleType.values[1]?.name.name.originalName).toBe("USER");
            expect(roleType.values[2]?.name.name.originalName).toBe("GUEST");
        }
    });

    it("should convert interface types", () => {
        const schemaContent = `
            type Query {
                getNode: Node
            }

            interface Node {
                id: ID!
            }

            type User implements Node {
                id: ID!
                name: String!
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(Object.keys(ir.types)).toContain("Node");
        const nodeType = ir.types["Node"];
        expect(nodeType?.type).toBe("interface");
        if (nodeType?.type === "interface") {
            expect(nodeType.fields).toHaveLength(1);
            expect(nodeType.fields[0]?.name.name.originalName).toBe("id");
        }

        expect(Object.keys(ir.types)).toContain("User");
        const userType = ir.types["User"];
        expect(userType?.type).toBe("object");
        if (userType?.type === "object") {
            expect(userType.interfaces).toContain("Node");
        }
    });

    it("should convert union types", () => {
        const schemaContent = `
            type Query {
                search: SearchResult
            }

            union SearchResult = User | Post

            type User {
                id: ID!
                name: String!
            }

            type Post {
                id: ID!
                title: String!
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(Object.keys(ir.types)).toContain("SearchResult");
        const searchResultType = ir.types["SearchResult"];
        expect(searchResultType?.type).toBe("union");
        if (searchResultType?.type === "union") {
            expect(searchResultType.members).toHaveLength(2);
            expect(searchResultType.members).toContain("User");
            expect(searchResultType.members).toContain("Post");
        }
    });

    it("should convert input object types", () => {
        const schemaContent = `
            type Query {
                hello: String
            }

            type Mutation {
                createUser(input: CreateUserInput!): User
            }

            input CreateUserInput {
                name: String!
                email: String!
                age: Int
            }

            type User {
                id: ID!
                name: String!
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(Object.keys(ir.types)).toContain("CreateUserInput");
        const inputType = ir.types["CreateUserInput"];
        expect(inputType?.type).toBe("inputObject");
        if (inputType?.type === "inputObject") {
            expect(inputType.fields).toHaveLength(3);
            expect(inputType.fields[0]?.name.name.originalName).toBe("name");
            expect(inputType.fields[1]?.name.name.originalName).toBe("email");
            expect(inputType.fields[2]?.name.name.originalName).toBe("age");
        }
    });

    it("should handle list types", () => {
        const schemaContent = `
            type Query {
                getUsers: [User!]!
            }

            type User {
                id: ID!
                name: String!
                friends: [User!]
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(ir.queries).toHaveLength(1);
        expect(ir.queries[0]?.returnType.type).toBe("container");
        if (ir.queries[0]?.returnType.type === "container") {
            expect(ir.queries[0]?.returnType.container.type).toBe("list");
        }
    });

    it("should handle deprecated fields", () => {
        const schemaContent = `
            type Query {
                getUser: User
            }

            type User {
                id: ID!
                name: String!
                oldField: String @deprecated(reason: "Use newField instead")
                newField: String
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        const userType = ir.types["User"];
        expect(userType?.type).toBe("object");
        if (userType?.type === "object") {
            const oldField = userType.fields.find((f) => f.name.name.originalName === "oldField");
            expect(oldField?.deprecationReason).toBe("Use newField instead");
        }
    });

    it("should handle field descriptions", () => {
        const schemaContent = `
            type Query {
                """
                Get a user by ID
                """
                getUser(id: ID!): User
            }

            """
            A user in the system
            """
            type User {
                id: ID!
                """
                The user's full name
                """
                name: String!
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(ir.queries[0]?.docs).toBe("Get a user by ID");

        const userType = ir.types["User"];
        expect(userType?.type).toBe("object");
        if (userType?.type === "object") {
            expect(userType.docs).toBe("A user in the system");
            const nameField = userType.fields.find((f) => f.name.name.originalName === "name");
            expect(nameField?.docs).toBe("The user's full name");
        }
    });

    it("should handle complex nested types", () => {
        const schemaContent = `
            type Query {
                getPosts: [Post!]!
            }

            type Post {
                id: ID!
                title: String!
                author: User!
                comments: [Comment!]!
                tags: [String!]
            }

            type User {
                id: ID!
                name: String!
                posts: [Post!]
            }

            type Comment {
                id: ID!
                text: String!
                author: User!
            }
        `;

        const schema = parseGraphQLSchema(schemaContent, mockContext);
        const ir = convertGraphQLSchemaToIR(schema, casingsGenerator);

        expect(Object.keys(ir.types)).toContain("Post");
        expect(Object.keys(ir.types)).toContain("User");
        expect(Object.keys(ir.types)).toContain("Comment");

        const postType = ir.types["Post"];
        expect(postType?.type).toBe("object");
        if (postType?.type === "object") {
            expect(postType.fields).toHaveLength(5);
        }
    });
});
