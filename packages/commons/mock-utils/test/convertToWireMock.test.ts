import { FernIr } from "@fern-fern/ir-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { readFileSync } from "fs";
import { join } from "path";
import { WireMock } from "../index";

describe("new WireMock().convertToWireMock", () => {
    it("should convert hackernews IR to WireMock format", () => {
        // Read the input IR JSON
        const irPath = join(__dirname, "fixtures", "hackernews", "ir.json");
        const irJson = JSON.parse(readFileSync(irPath, "utf-8")) as IntermediateRepresentation;

        // Convert IR to WireMock format
        const result = new WireMock().convertToWireMock(irJson);

        // Basic structure checks
        expect(result).toHaveProperty("mappings");
        expect(result).toHaveProperty("meta");
        expect(Array.isArray(result.mappings)).toBe(true);
        expect(result.meta?.total).toBe(result.mappings.length);

        // Check that we have some mappings
        expect(result.mappings.length).toBeGreaterThan(0);

        // Build a map of IR endpoints for validation
        const endpointsByName = new Map<string, FernIr.HttpEndpoint>();
        for (const service of Object.values(irJson.services)) {
            for (const endpoint of service.endpoints) {
                const endpointName = endpoint.name.originalName;
                endpointsByName.set(endpointName, endpoint);
            }
        }

        // Verify each mapping has required fields and matches IR structure
        for (const mapping of result.mappings) {
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
            let matchedEndpoint: FernIr.HttpEndpoint | null = null;
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
                        expect(mapping.request.pathParameters?.[paramName]).toHaveProperty("equalTo");
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
    it("should convert imdb IR to WireMock format", () => {
        // First mapping is create-movie endpoint
        // Second mapping is get-movie endpoint

        // Read the input IR JSON
        const irPath = join(__dirname, "fixtures", "imdb", "ir.json");
        const irJson = JSON.parse(readFileSync(irPath, "utf-8"));

        // Convert IR to WireMock format
        const result = new WireMock().convertToWireMock(irJson);
        // Check createMovie endpoint (first mapping)
        expect(result.mappings[0].request.urlPathTemplate).toBe("/movies/create-movie");
        expect(result.mappings[0].response.status).toBe(201);
        expect(result.mappings[0].response.body).toBe('"string"');

        // Check getMovie endpoint (second mapping)
        expect(result.mappings[1].request.urlPathTemplate).toBe("/movies/{movieId}");
        expect(result.mappings[1].response.status).toBe(200);
        expect(JSON.parse(result.mappings[1].response.body)).toEqual({ id: "id", title: "title", rating: 1.1 });

        expect(result.meta?.total).toBe(2); // There should be 2 unique endpoints
    });
    it("should convert imdb IR without leading slash on fullpath to WireMock format", () => {
        // First mapping is create-movie endpoint
        // Second mapping is get-movie endpoint

        // Read the input IR JSON
        const irPath = join(__dirname, "fixtures", "imdb", "ir_without_leading_slash.json");
        const irJson = JSON.parse(readFileSync(irPath, "utf-8"));

        // Convert IR to WireMock format
        const result = new WireMock().convertToWireMock(irJson);

        // Check createMovie endpoint (first mapping)
        expect(result.mappings[0].request.urlPathTemplate).toBe("/movies/create-movie");
        expect(result.mappings[0].response.status).toBe(201);
        expect(result.mappings[0].response.body).toBe('"string"');

        // Check getMovie endpoint (second mapping)
        expect(result.mappings[1].request.urlPathTemplate).toBe("/movies/{movieId}");
        expect(result.mappings[1].response.status).toBe(200);
        expect(JSON.parse(result.mappings[1].response.body)).toEqual({ id: "id", title: "title", rating: 1.1 });

        // Check body response is array
        expect(result.mappings[2].request.urlPathTemplate).toBe("/clients/{client_id}/credentials");
        expect(result.mappings[2].response.status).toBe(200);
        expect(JSON.parse(result.mappings[2].response.body)).toEqual([
            {
                id: "id",
                name: "name",
                kid: "kid",
                alg: "RS256",
                credential_type: "public_key",
                subject_dn: "subject_dn",
                thumbprint_sha256: "thumbprint_sha256",
                created_at: "2024-01-15T09:30:00Z",
                updated_at: "2024-01-15T09:30:00Z",
                expires_at: "2024-01-15T09:30:00Z"
            }
        ]);
    });
});

// Helper function to build URL path template from IR endpoint (matches convertTonew WireMock().ts logic)
function buildUrlPathTemplateFromIR(endpoint: FernIr.HttpEndpoint): string {
    // Use fullPath to include the service basePath
    let path = endpoint.fullPath.head;
    for (const part of endpoint.fullPath.parts || []) {
        path += `{${part.pathParameter}}${part.tail}`;
    }
    // Ensure path always starts with /
    if (!path.startsWith("/")) {
        path = "/" + path;
    }
    return path;
}
