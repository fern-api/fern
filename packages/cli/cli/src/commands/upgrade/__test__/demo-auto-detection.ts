#!/usr/bin/env tsx

/**
 * Demo script showing GraphQL auto-detection functionality
 * This demonstrates how the enhanced fetchGraphQLSchemaWithAutoDetection works
 */

import { mkdtemp, readFile } from "fs/promises";
import { buildSchema, introspectionFromSchema } from "graphql";
import { tmpdir } from "os";
import { join } from "path";
import { fetchGraphQLSchemaWithAutoDetection } from "../updateApiSpec.js";

// Create a simple mock logger
const mockLogger = {
    debug: (msg: string) => console.log(`[DEBUG] ${msg}`),
    info: (msg: string) => console.log(`[INFO] ${msg}`),
    warn: (msg: string) => console.warn(`[WARN] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`),
    trace: () => {},
    log: () => {},
    disable: () => {},
    enable: () => {}
};

async function demoAutoDetection() {
    console.log("🔍 Demo: GraphQL Auto-Detection Enhancement\n");

    // Create a simple GraphQL schema for demonstration
    const demoSchema = buildSchema(`
        type Query {
            hello: String
            user(id: ID!): User
            posts: [Post!]!
        }

        type User {
            id: ID!
            name: String!
            email: String
            posts: [Post!]!
        }

        type Post {
            id: ID!
            title: String!
            content: String!
            author: User!
        }
    `);

    const introspectionResult = introspectionFromSchema(demoSchema);

    console.log("📋 Simulating different GraphQL endpoint scenarios:\n");

    // Mock the global fetch function to simulate different responses
    global.fetch = async (url: string, options?: any) => {
        console.log(`   -> ${options?.method || "GET"} ${url}`);

        const urlStr = url.toString();

        if (urlStr.includes("scenario1")) {
            // Scenario 1: Standard GraphQL endpoint that accepts POST introspection
            if (options?.method === "POST") {
                console.log("   <- 200 OK (GraphQL introspection response)");
                return {
                    ok: true,
                    json: async () => ({ data: introspectionResult })
                };
            } else {
                console.log("   <- 405 Method Not Allowed");
                return {
                    ok: false,
                    status: 405,
                    statusText: "Method Not Allowed"
                };
            }
        } else if (urlStr.includes("scenario2")) {
            // Scenario 2: URL that returns introspection JSON directly via GET (user's case)
            if (options?.method === "POST") {
                console.log("   <- 404 Not Found (no GraphQL endpoint)");
                return {
                    ok: false,
                    status: 404,
                    statusText: "Not Found"
                };
            } else {
                console.log("   <- 200 OK (direct introspection JSON)");
                return {
                    ok: true,
                    json: async () => introspectionResult // Direct result, not wrapped
                };
            }
        } else if (urlStr.includes("scenario3")) {
            // Scenario 3: URL that returns wrapped introspection JSON via GET
            if (options?.method === "POST") {
                console.log("   <- 400 Bad Request (no GraphQL endpoint)");
                return {
                    ok: false,
                    status: 400,
                    statusText: "Bad Request"
                };
            } else {
                console.log("   <- 200 OK (wrapped introspection JSON)");
                return {
                    ok: true,
                    json: async () => ({ data: introspectionResult }) // Wrapped in data
                };
            }
        } else {
            console.log("   <- 500 Internal Server Error");
            return {
                ok: false,
                status: 500,
                statusText: "Internal Server Error"
            };
        }
    };

    // Create temp directory for outputs
    const tempDir = await mkdtemp(join(tmpdir(), "fern-graphql-demo-"));

    try {
        // Test Scenario 1: Standard GraphQL endpoint
        console.log("🔧 Scenario 1: Standard GraphQL endpoint (supports POST introspection)");
        const schema1Path = join(tempDir, "schema1.graphql");
        await fetchGraphQLSchemaWithAutoDetection("https://api.example.com/graphql/scenario1", schema1Path, mockLogger);
        const schema1 = await readFile(schema1Path, "utf8");
        console.log(`   ✅ Success! Generated ${schema1.split("\n").length} lines of SDL\n`);

        // Test Scenario 2: Direct JSON (user's use case)
        console.log("🔧 Scenario 2: URL returns introspection JSON directly (user's use case)");
        const schema2Path = join(tempDir, "schema2.graphql");
        await fetchGraphQLSchemaWithAutoDetection(
            "https://us-central1-bc-prototypes-njb.cloudfunctions.net/get-graphql-schema-account/scenario2",
            schema2Path,
            mockLogger
        );
        const schema2 = await readFile(schema2Path, "utf8");
        console.log(`   ✅ Success! Generated ${schema2.split("\n").length} lines of SDL\n`);

        // Test Scenario 3: Wrapped JSON response
        console.log("🔧 Scenario 3: URL returns wrapped introspection JSON");
        const schema3Path = join(tempDir, "schema3.graphql");
        await fetchGraphQLSchemaWithAutoDetection(
            "https://api.example.com/schema.json/scenario3",
            schema3Path,
            mockLogger
        );
        const schema3 = await readFile(schema3Path, "utf8");
        console.log(`   ✅ Success! Generated ${schema3.split("\n").length} lines of SDL\n`);

        console.log("🎉 All scenarios completed successfully!");
        console.log("\n📝 Key Benefits:");
        console.log("   • Automatically detects the correct approach for each URL");
        console.log("   • Maintains backward compatibility with existing GraphQL endpoints");
        console.log("   • Supports URLs that return introspection data directly");
        console.log("   • Provides clear error messages when both approaches fail");
        console.log("   • No configuration changes required");
    } catch (error) {
        console.error("❌ Demo failed:", error);
    }
}

// Run the demo if this script is executed directly
if (require.main === module) {
    demoAutoDetection().catch(console.error);
}

export { demoAutoDetection };
