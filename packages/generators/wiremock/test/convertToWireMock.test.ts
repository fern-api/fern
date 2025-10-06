import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { convertToWireMock } from "../src/convertToWireMock";

describe("convertToWireMock", () => {
    it("should convert hackernews IR to WireMock format", () => {
        // Read the input IR JSON
        const irPath = join(__dirname, "fixtures", "hackernews", "ir.json");
        const irJson = JSON.parse(readFileSync(irPath, "utf-8"));

        // Convert IR to WireMock format
        const result = convertToWireMock(irJson);

        // // Write the result for inspection (temporary for debugging)
        // const outputPath = join(__dirname, "fixtures", "hackernews", "wiremock-generated.json");
        // writeFileSync(outputPath, JSON.stringify(result, null, 2));

        // Basic structure checks
        expect(result).toHaveProperty("mappings");
        expect(result).toHaveProperty("meta");
        expect(Array.isArray(result.mappings)).toBe(true);
        expect(result.meta?.total).toBe(result.mappings.length);

        // Check that we have some mappings
        expect(result.mappings.length).toBeGreaterThan(0);

        // Build a map of IR endpoints for validation
        const endpointsByName = new Map<string, any>();
        for (const service of Object.values(irJson.services)) {
            for (const endpoint of (service as any).endpoints) {
                const endpointName = endpoint.name.originalName;
                endpointsByName.set(endpointName, endpoint);
            }
        }

        // Verify each mapping has required fields and matches IR structure
        for (const mapping of result.mappings as any[]) {
            expect(mapping).toHaveProperty("id");
            expect(mapping).toHaveProperty("name");
            expect(mapping).toHaveProperty("request");
            expect(mapping).toHaveProperty("response");
            expect(mapping).toHaveProperty("uuid");
            expect(mapping).toHaveProperty("persistent");
            expect(mapping).toHaveProperty("metadata");

            // Check request structure
            expect(mapping.request).toHaveProperty("method");
            expect(mapping.request).toHaveProperty("urlPathTemplate");

            // Check response structure
            expect(mapping.response).toHaveProperty("status");
            expect(mapping.response).toHaveProperty("body");
            expect(mapping.response).toHaveProperty("headers");

            // Validate urlPathTemplate, method, and pathParameters match IR
            // Find the corresponding endpoint in IR
            let matchedEndpoint: any = null;
            for (const endpoint of endpointsByName.values()) {
                const expectedUrlTemplate = buildUrlPathTemplateFromIR(endpoint);
                if (mapping.request.urlPathTemplate === expectedUrlTemplate) {
                    matchedEndpoint = endpoint;
                    break;
                }
            }

            // If we found a matching endpoint, verify method and path parameters
            if (matchedEndpoint) {
                // Verify method matches
                expect(mapping.request.method).toBe(matchedEndpoint.method);

                // Verify path parameters structure
                if (matchedEndpoint.pathParameters && matchedEndpoint.pathParameters.length > 0) {
                    // Should have pathParameters in request
                    expect(mapping.request.pathParameters).toBeDefined();

                    // Check that all IR path parameters are present
                    for (const irParam of matchedEndpoint.pathParameters) {
                        const paramName = irParam.name.originalName;
                        expect(mapping.request.pathParameters).toHaveProperty(paramName);
                        expect(mapping.request.pathParameters[paramName]).toHaveProperty("equalTo");
                    }
                } else {
                    // Endpoints without path parameters shouldn't have pathParameters field (or it should be undefined)
                    if (mapping.request.pathParameters !== undefined) {
                        expect(Object.keys(mapping.request.pathParameters).length).toBe(0);
                    }
                }
            }
        }
    });
});

// Helper function to build URL path template from IR endpoint (matches convertToWireMock.ts logic)
function buildUrlPathTemplateFromIR(endpoint: any): string {
    let path = endpoint.path.head;
    for (const part of endpoint.path.parts || []) {
        path += `{${part.pathParameter}}${part.tail}`;
    }
    return path;
}
