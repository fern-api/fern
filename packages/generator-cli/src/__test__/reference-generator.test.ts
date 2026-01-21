import { PassThrough } from "stream";
import type { FernGeneratorCli } from "../configuration/sdk";
import { ReferenceGenerator } from "../reference/ReferenceGenerator";

describe("ReferenceGenerator", () => {
    describe("HTML encoding", () => {
        it("should HTML encode generic types in code blocks", async () => {
            const config: FernGeneratorCli.ReferenceConfig = {
                language: "TYPESCRIPT",
                sections: [
                    {
                        title: "Test Section",
                        endpoints: [
                            {
                                title: {
                                    snippetParts: [
                                        { text: "client.test.", location: undefined },
                                        { text: "genericMethod", location: { path: "/test.ts" } }
                                    ],
                                    returnValue: {
                                        text: "Record<string, number>",
                                        location: undefined
                                    }
                                },
                                snippet: "const result = client.test.genericMethod();",
                                parameters: []
                            }
                        ]
                    }
                ]
            };

            const generator = new ReferenceGenerator({ referenceConfig: config });
            const output = new PassThrough();
            const chunks: Buffer[] = [];

            output.on("data", (chunk) => chunks.push(chunk));

            await generator.generate({ output: output as any });
            const result = Buffer.concat(chunks).toString();

            // Snapshot the output for visual inspection
            await expect(result).toMatchFileSnapshot("./__snapshots__/html-encoding-code-blocks.md");

            // Return value should be HTML encoded inside <code> tags
            expect(result).toContain("Record&lt;string, number&gt;");
            // Should NOT contain unencoded version in the code block
            expect(result).not.toContain(
                '<code>client.test.<a href="/test.ts">genericMethod</a>() -> Record<string, number></code>'
            );
        });

        it("should NOT HTML encode generic types in parameter backticks", async () => {
            const config: FernGeneratorCli.ReferenceConfig = {
                language: "TYPESCRIPT",
                sections: [
                    {
                        title: "Test Section",
                        endpoints: [
                            {
                                title: {
                                    snippetParts: [{ text: "client.test.method", location: undefined }],
                                    returnValue: undefined
                                },
                                snippet: "client.test.method(params);",
                                parameters: [
                                    {
                                        name: "request",
                                        type: "Record<string, string>",
                                        location: undefined,
                                        description: undefined,
                                        required: true
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const generator = new ReferenceGenerator({ referenceConfig: config });
            const output = new PassThrough();
            const chunks: Buffer[] = [];

            output.on("data", (chunk) => chunks.push(chunk));

            await generator.generate({ output: output as any });
            const result = Buffer.concat(chunks).toString();

            // Snapshot the output for visual inspection
            await expect(result).toMatchFileSnapshot("./__snapshots__/no-encoding-parameter-backticks.md");

            // Parameter type should NOT be HTML encoded since it's in markdown backticks
            expect(result).toContain("**request:** `Record<string, string>`");
            // Should NOT contain encoded version
            expect(result).not.toContain("Record&lt;string, string&gt;");
        });

        it("should HTML encode generic types in linked parameter types", async () => {
            const config: FernGeneratorCli.ReferenceConfig = {
                language: "TYPESCRIPT",
                sections: [
                    {
                        title: "Test Section",
                        endpoints: [
                            {
                                title: {
                                    snippetParts: [{ text: "client.test.method", location: undefined }],
                                    returnValue: undefined
                                },
                                snippet: "client.test.method(params);",
                                parameters: [
                                    {
                                        name: "request",
                                        type: "Map<K, V>",
                                        location: { path: "/types.ts" },
                                        description: "A map parameter",
                                        required: true
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const generator = new ReferenceGenerator({ referenceConfig: config });
            const output = new PassThrough();
            const chunks: Buffer[] = [];

            output.on("data", (chunk) => chunks.push(chunk));

            await generator.generate({ output: output as any });
            const result = Buffer.concat(chunks).toString();

            // Snapshot the output for visual inspection
            await expect(result).toMatchFileSnapshot("./__snapshots__/linked-parameter-no-encoding.md");

            // When parameter has a link, it should use markdown link syntax
            expect(result).toContain("**request:** [Map<K, V>](/types.ts)");
            // Description should be present
            expect(result).toContain("A map parameter");
        });

        it("should HTML encode generics in linked return values within code blocks", async () => {
            const config: FernGeneratorCli.ReferenceConfig = {
                language: "TYPESCRIPT",
                sections: [
                    {
                        title: "Test Section",
                        endpoints: [
                            {
                                title: {
                                    snippetParts: [{ text: "client.test.method", location: undefined }],
                                    returnValue: {
                                        text: "Promise<User>",
                                        location: { path: "/types.ts" }
                                    }
                                },
                                snippet: "const user = await client.test.method();",
                                parameters: []
                            }
                        ]
                    }
                ]
            };

            const generator = new ReferenceGenerator({ referenceConfig: config });
            const output = new PassThrough();
            const chunks: Buffer[] = [];

            output.on("data", (chunk) => chunks.push(chunk));

            await generator.generate({ output: output as any });
            const result = Buffer.concat(chunks).toString();

            // Snapshot the output for visual inspection
            await expect(result).toMatchFileSnapshot("./__snapshots__/linked-return-value-encoding.md");

            // Return value with link should be HTML encoded in <code> block
            expect(result).toContain('<a href="/types.ts">Promise&lt;User&gt;</a>');
        });

        it("should generate comprehensive reference with multiple scenarios", async () => {
            const config: FernGeneratorCli.ReferenceConfig = {
                language: "TYPESCRIPT",
                sections: [
                    {
                        title: "Users",
                        description: "User management endpoints",
                        endpoints: [
                            {
                                title: {
                                    snippetParts: [
                                        { text: "client.users.", location: undefined },
                                        { text: "list", location: { path: "/users/client.ts" } }
                                    ],
                                    returnValue: {
                                        text: "Page<User, ListUsersResponse>",
                                        location: { path: "/types/pagination.ts" }
                                    }
                                },
                                snippet: "const users = await client.users.list({ limit: 10 });",
                                description: "List all users with pagination support",
                                parameters: [
                                    {
                                        name: "limit",
                                        type: "number",
                                        location: undefined,
                                        description: "Maximum number of users to return",
                                        required: false
                                    },
                                    {
                                        name: "filters",
                                        type: "Record<string, string>",
                                        location: undefined,
                                        description: "Filter criteria for users",
                                        required: false
                                    }
                                ]
                            },
                            {
                                title: {
                                    snippetParts: [
                                        { text: "client.users.", location: undefined },
                                        { text: "get", location: { path: "/users/client.ts" } }
                                    ],
                                    returnValue: {
                                        text: "User",
                                        location: { path: "/types/user.ts" }
                                    }
                                },
                                snippet: 'const user = await client.users.get("user-123");',
                                description: "Retrieve a specific user by ID",
                                parameters: [
                                    {
                                        name: "userId",
                                        type: "string",
                                        location: undefined,
                                        description: "The unique identifier for the user",
                                        required: true
                                    }
                                ]
                            },
                            {
                                title: {
                                    snippetParts: [
                                        { text: "client.users.", location: undefined },
                                        { text: "create", location: { path: "/users/client.ts" } }
                                    ],
                                    returnValue: {
                                        text: "User",
                                        location: { path: "/types/user.ts" }
                                    }
                                },
                                snippet:
                                    'const user = await client.users.create({\n  name: "John Doe",\n  email: "john@example.com"\n});',
                                parameters: [
                                    {
                                        name: "request",
                                        type: "CreateUserRequest",
                                        location: { path: "/types/requests.ts" },
                                        description: "User data for creation",
                                        required: true
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: "Organizations",
                        description: "Organization management endpoints",
                        endpoints: [
                            {
                                title: {
                                    snippetParts: [
                                        { text: "client.organizations.", location: undefined },
                                        { text: "listMembers", location: { path: "/orgs/client.ts" } }
                                    ],
                                    returnValue: {
                                        text: "Map<string, Member>",
                                        location: { path: "/types/member.ts" }
                                    }
                                },
                                snippet: 'const members = await client.organizations.listMembers("org-456");',
                                description: "Get all members of an organization as a map keyed by user ID",
                                parameters: [
                                    {
                                        name: "organizationId",
                                        type: "string",
                                        location: undefined,
                                        description: "The organization identifier",
                                        required: true
                                    },
                                    {
                                        name: "options",
                                        type: "ListMembersOptions",
                                        location: { path: "/types/options.ts" },
                                        description:
                                            "Optional parameters for filtering and pagination.\nSupports multiple filter criteria.",
                                        required: false
                                    }
                                ]
                            },
                            {
                                title: {
                                    snippetParts: [
                                        { text: "client.organizations.", location: undefined },
                                        { text: "getSettings", location: { path: "/orgs/client.ts" } }
                                    ],
                                    returnValue: {
                                        text: "Promise<Map<string, unknown>>",
                                        location: undefined
                                    }
                                },
                                snippet:
                                    'const settings = await client.organizations.getSettings("org-456", { includeDefaults: true });',
                                description: "Retrieve organization settings with optional defaults",
                                parameters: [
                                    {
                                        name: "organizationId",
                                        type: "string",
                                        location: undefined,
                                        required: true
                                    },
                                    {
                                        name: "options",
                                        type: "Record<string, boolean>",
                                        location: undefined,
                                        description: "Configuration options",
                                        required: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const generator = new ReferenceGenerator({ referenceConfig: config });
            const output = new PassThrough();
            const chunks: Buffer[] = [];

            output.on("data", (chunk) => chunks.push(chunk));

            await generator.generate({ output: output as any });
            const result = Buffer.concat(chunks).toString();

            // Snapshot the comprehensive output
            await expect(result).toMatchFileSnapshot("./__snapshots__/comprehensive-reference.md");

            // Verify HTML encoding in code blocks
            expect(result).toContain("Page&lt;User, ListUsersResponse&gt;");
            expect(result).toContain("Map&lt;string, Member&gt;");
            expect(result).toContain("Promise&lt;Map&lt;string, unknown&gt;&gt;");

            // Verify NO encoding in parameter types
            expect(result).toContain("**filters:** `Record<string, string>`");
            expect(result).toContain("**options:** `Record<string, boolean>`");
            // Linked parameter should use markdown link syntax
            expect(result).toContain("**request:** [CreateUserRequest](/types/requests.ts)");
            expect(result).toContain("**options:** [ListMembersOptions](/types/options.ts)");

            // Verify sections are present
            expect(result).toContain("## Users");
            expect(result).toContain("## Organizations");
            expect(result).toContain("User management endpoints");
            expect(result).toContain("Organization management endpoints");

            // Verify multiline descriptions work
            expect(result).toContain("Optional parameters for filtering and pagination.");
            expect(result).toContain("Supports multiple filter criteria.");
        });
    });
});
