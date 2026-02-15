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

// Import functions to test - we need to export these from updateApiSpec.ts
import {
    extractIntrospectionData,
    fetchGraphQLSchemaWithAutoDetection,
    isIntrospectionResult,
    tryDirectJSONFetch,
    tryGraphQLIntrospection
} from "../updateApiSpec.js";

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

    describe("Helper Functions", () => {
        describe("isIntrospectionResult", () => {
            it("should identify direct introspection result format", () => {
                const data = { __schema: { queryType: { name: "Query" } } };
                expect(isIntrospectionResult(data)).toBe(true);
            });

            it("should identify GraphQL response format", () => {
                const data = { data: { __schema: { queryType: { name: "Query" } } } };
                expect(isIntrospectionResult(data)).toBe(true);
            });

            it("should reject invalid formats", () => {
                expect(isIntrospectionResult(null)).toBe(false);
                expect(isIntrospectionResult(undefined)).toBe(false);
                expect(isIntrospectionResult("string")).toBe(false);
                expect(isIntrospectionResult({})).toBe(false);
                expect(isIntrospectionResult({ data: {} })).toBe(false);
            });
        });

        describe("extractIntrospectionData", () => {
            it("should extract from direct format", () => {
                const data = { __schema: { queryType: { name: "Query" } } };
                expect(extractIntrospectionData(data)).toBe(data);
            });

            it("should extract from wrapped format", () => {
                const introspectionData = { __schema: { queryType: { name: "Query" } } };
                const data = { data: introspectionData };
                expect(extractIntrospectionData(data)).toBe(introspectionData);
            });
        });
    });

    describe("tryGraphQLIntrospection", () => {
        it("should successfully handle POST introspection", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: introspectionResult })
            });

            const result = await tryGraphQLIntrospection("http://example.com/graphql", mockLogger);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.result).toContain("type Query");
                expect(result.result).toContain("type User");
            }
            expect(mockFetch).toHaveBeenCalledWith(
                "http://example.com/graphql",
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json"
                    }),
                    body: expect.stringContaining("query IntrospectionQuery")
                })
            );
        });

        it("should handle authentication errors", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: "Unauthorized"
            });

            const result = await tryGraphQLIntrospection("http://example.com/graphql", mockLogger);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("requires authentication");
            }
        });

        it("should handle GraphQL errors", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    errors: [{ message: "Invalid query" }]
                })
            });

            const result = await tryGraphQLIntrospection("http://example.com/graphql", mockLogger);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("GraphQL introspection errors");
            }
        });

        it("should handle network errors", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            const result = await tryGraphQLIntrospection("http://example.com/graphql", mockLogger);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Failed to perform GraphQL introspection");
            }
        });
    });

    describe("tryDirectJSONFetch", () => {
        it("should successfully handle direct JSON introspection result", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);

            // Mock direct introspection result (not wrapped in data)
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => introspectionResult
            });

            const result = await tryDirectJSONFetch("http://example.com/schema.json", mockLogger);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.result).toContain("type Query");
                expect(result.result).toContain("type User");
            }
            expect(mockFetch).toHaveBeenCalledWith(
                "http://example.com/schema.json",
                expect.objectContaining({
                    method: "GET",
                    headers: expect.not.objectContaining({
                        "Content-Type": expect.anything()
                    })
                })
            );
        });

        it("should handle wrapped GraphQL response format", async () => {
            const testSchema = createTestSchema();
            const introspectionResult = introspectionFromSchema(testSchema);

            // Mock wrapped introspection result (in data property)
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: introspectionResult })
            });

            const result = await tryDirectJSONFetch("http://example.com/schema.json", mockLogger);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.result).toContain("type Query");
                expect(result.result).toContain("type User");
            }
        });

        it("should reject invalid JSON format", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ invalidData: "not introspection" })
            });

            const result = await tryDirectJSONFetch("http://example.com/schema.json", mockLogger);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("does not contain GraphQL introspection data");
            }
        });

        it("should handle HTTP errors", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });

            const result = await tryDirectJSONFetch("http://example.com/schema.json", mockLogger);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Direct JSON fetch failed: 404 Not Found");
            }
        });
    });

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
