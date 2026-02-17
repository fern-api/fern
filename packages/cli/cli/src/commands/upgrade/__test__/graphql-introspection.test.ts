import { Logger } from "@fern-api/logger";
import { mkdtemp, readFile, rm } from "fs/promises";
import { buildSchema, introspectionFromSchema } from "graphql";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock logger that implements the full Logger interface
const mockLogger: Logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    log: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn()
};

import { fetchGraphQLSchemaWithAutoDetection } from "../updateApiSpec.js";

describe("GraphQL Auto-Detection Enhancement", () => {
    let tempDir: string;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Create temporary directory for test files
        tempDir = await mkdtemp(join(tmpdir(), "fern-graphql-test-"));
    });

    afterEach(async () => {
        // Clean up temporary directory
        await rm(tempDir, { recursive: true, force: true });
    });

    // Helper to create test schema
    const createTestSchema = () =>
        buildSchema(`
        type Query {
            hello: String
            user(id: ID!): User
        }

        type User {
            id: ID!
            name: String!
            email: String
        }
    `);

    describe("fetchGraphQLSchemaWithAutoDetection", () => {
        it("should succeed with POST introspection on first attempt", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: introspectionResult })
            });

            await fetchGraphQLSchemaWithAutoDetection("http://example.com/graphql", testFile, mockLogger);

            const savedSchema = await readFile(testFile, "utf8");
            expect(savedSchema).toContain("type Query");
            expect(savedSchema).toContain("type User");
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Successfully fetched GraphQL schema using POST introspection"
            );
        });

        it("should fallback to GET request when POST fails", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // First call (POST) fails
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });

            // Second call (GET) succeeds
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => introspectionResult
            });

            await fetchGraphQLSchemaWithAutoDetection("http://example.com/schema.json", testFile, mockLogger);

            const savedSchema = await readFile(testFile, "utf8");
            expect(savedSchema).toContain("type Query");
            expect(savedSchema).toContain("type User");
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully fetched GraphQL schema using direct JSON fetch");
        });

        it("should provide comprehensive error when both approaches fail", async () => {
            const testFile = join(tempDir, "schema.graphql");

            // First call (POST) fails
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });

            // Second call (GET) fails
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: "Internal Server Error"
            });

            await expect(
                fetchGraphQLSchemaWithAutoDetection("http://example.com/graphql", testFile, mockLogger)
            ).rejects.toThrow(/Failed to fetch GraphQL schema from/);
        });

        it("should handle authentication with environment variable", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // Set environment variable
            process.env.GRAPHQL_TOKEN = "test-token";

            try {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ data: introspectionResult })
                });

                await fetchGraphQLSchemaWithAutoDetection("http://example.com/graphql", testFile, mockLogger);

                expect(mockFetch).toHaveBeenCalledWith(
                    "http://example.com/graphql",
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            Authorization: "Bearer test-token"
                        })
                    })
                );
            } finally {
                // Clean up - this will always run even if assertions fail
                delete process.env.GRAPHQL_TOKEN;
            }
        });

        it("should handle GitHub-specific authentication", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // Set environment variable
            process.env.GRAPHQL_TOKEN = "github-token";

            try {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ data: introspectionResult })
                });

                await fetchGraphQLSchemaWithAutoDetection("https://api.github.com/graphql", testFile, mockLogger);

                expect(mockFetch).toHaveBeenCalledWith(
                    "https://api.github.com/graphql",
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            Authorization: "token github-token"
                        })
                    })
                );
            } finally {
                // Clean up - this will always run even if assertions fail
                delete process.env.GRAPHQL_TOKEN;
            }
        });

        it("should handle POST authentication errors and retry with GET", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // First call (POST) fails with auth error
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: "Unauthorized"
            });

            // Second call (GET) succeeds
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => introspectionResult
            });

            await fetchGraphQLSchemaWithAutoDetection("http://example.com/graphql", testFile, mockLogger);

            const savedSchema = await readFile(testFile, "utf8");
            expect(savedSchema).toContain("type Query");
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully fetched GraphQL schema using direct JSON fetch");
        });

        it("should handle POST GraphQL errors and retry with GET", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // First call (POST) fails with GraphQL errors
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    errors: [{ message: "Introspection is disabled" }]
                })
            });

            // Second call (GET) succeeds
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => introspectionResult
            });

            await fetchGraphQLSchemaWithAutoDetection("http://example.com/graphql", testFile, mockLogger);

            const savedSchema = await readFile(testFile, "utf8");
            expect(savedSchema).toContain("type Query");
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully fetched GraphQL schema using direct JSON fetch");
        });

        it("should handle POST returning invalid data and retry with GET", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // First call (POST) returns invalid introspection result
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ invalidData: "not introspection" })
            });

            // Second call (GET) succeeds
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => introspectionResult
            });

            await fetchGraphQLSchemaWithAutoDetection("http://example.com/graphql", testFile, mockLogger);

            const savedSchema = await readFile(testFile, "utf8");
            expect(savedSchema).toContain("type Query");
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully fetched GraphQL schema using direct JSON fetch");
        });

        it("should handle POST network error and retry with GET", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // First call (POST) throws network error
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            // Second call (GET) succeeds
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => introspectionResult
            });

            await fetchGraphQLSchemaWithAutoDetection("http://example.com/graphql", testFile, mockLogger);

            const savedSchema = await readFile(testFile, "utf8");
            expect(savedSchema).toContain("type Query");
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully fetched GraphQL schema using direct JSON fetch");
        });

        it("should handle GET request with wrapped introspection response", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // First call (POST) fails
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });

            // Second call (GET) succeeds with wrapped format
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: introspectionResult })
            });

            await fetchGraphQLSchemaWithAutoDetection("http://example.com/schema.json", testFile, mockLogger);

            const savedSchema = await readFile(testFile, "utf8");
            expect(savedSchema).toContain("type Query");
            expect(savedSchema).toContain("type User");
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully fetched GraphQL schema using direct JSON fetch");
        });

        it("should fail when GET returns invalid introspection data", async () => {
            const testFile = join(tempDir, "schema.graphql");

            // First call (POST) fails
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });

            // Second call (GET) returns invalid data
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ invalidData: "not introspection" })
            });

            await expect(
                fetchGraphQLSchemaWithAutoDetection("http://example.com/schema.json", testFile, mockLogger)
            ).rejects.toThrow(/Failed to fetch GraphQL schema from/);
        });

        it("should verify POST request format and content", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: introspectionResult })
            });

            await fetchGraphQLSchemaWithAutoDetection("http://example.com/graphql", testFile, mockLogger);

            expect(mockFetch).toHaveBeenCalledWith(
                "http://example.com/graphql",
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    }),
                    body: expect.stringContaining("query IntrospectionQuery")
                })
            );
        });

        it("should verify GET request format has no Content-Type header", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // First call (POST) fails
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });

            // Second call (GET) succeeds
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => introspectionResult
            });

            await fetchGraphQLSchemaWithAutoDetection("http://example.com/schema.json", testFile, mockLogger);

            expect(mockFetch).toHaveBeenCalledWith(
                "http://example.com/schema.json",
                expect.objectContaining({
                    method: "GET",
                    headers: expect.objectContaining({
                        Accept: "application/json"
                    })
                })
            );

            // Verify Content-Type is NOT in the GET request headers
            const getCallArgs = mockFetch.mock.calls.find((call) => call[1]?.method === "GET");
            expect(getCallArgs?.[1]?.headers).not.toHaveProperty("Content-Type");
        });
    });

    describe("Integration Tests", () => {
        it("should handle real-world URL that returns introspection directly", async () => {
            // This simulates the user's actual use case
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);
            const testFile = join(tempDir, "schema.graphql");

            // Simulate POST failing (GraphQL endpoint doesn't exist)
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 405,
                statusText: "Method Not Allowed"
            });

            // Simulate GET succeeding with direct introspection result
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => introspectionResult
            });

            await fetchGraphQLSchemaWithAutoDetection(
                "https://us-central1-bc-prototypes-njb.cloudfunctions.net/get-graphql-schema-account",
                testFile,
                mockLogger
            );

            const savedSchema = await readFile(testFile, "utf8");
            expect(savedSchema).toContain("type Query");
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "POST introspection failed: GraphQL introspection failed: 405 Method Not Allowed"
            );
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully fetched GraphQL schema using direct JSON fetch");
        });
    });
});
