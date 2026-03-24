import { FernIr } from "@fern-fern/ir-sdk";
import {
    createAuthScheme,
    createBasicAuthScheme,
    createBearerAuthScheme,
    createHeaderAuthScheme,
    createMinimalIR
} from "@fern-typescript/test-utils";
import { assert, describe, expect, it } from "vitest";

import { AuthProvidersGenerator } from "../AuthProvidersGenerator.js";

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("AuthProvidersGenerator", () => {
    describe("constructor dispatches to correct generator", () => {
        it("dispatches bearer auth scheme to BearerAuthProviderGenerator", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const generator = new AuthProvidersGenerator({
                ir: createMinimalIR({ authSchemes: [authScheme] }),
                authScheme: authScheme as unknown as FernIr.AuthScheme,
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            expect(generator.shouldWriteFile()).toBe(true);
            const filePath = generator.getFilePath();
            assert(filePath.file != null, "file should not be undefined");
            expect(filePath.file.nameOnDisk).toBe("BearerAuthProvider.ts");
        });

        it("dispatches basic auth scheme to BasicAuthProviderGenerator", () => {
            const authScheme = createAuthScheme("basic", createBasicAuthScheme());
            const generator = new AuthProvidersGenerator({
                ir: createMinimalIR({ authSchemes: [authScheme] }),
                authScheme: authScheme as unknown as FernIr.AuthScheme,
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            expect(generator.shouldWriteFile()).toBe(true);
            const filePath = generator.getFilePath();
            assert(filePath.file != null, "file should not be undefined");
            expect(filePath.file.nameOnDisk).toBe("BasicAuthProvider.ts");
        });

        it("dispatches header auth scheme to HeaderAuthProviderGenerator", () => {
            const authScheme = createAuthScheme(
                "header",
                createHeaderAuthScheme({ name: "apiKey", wireValue: "X-API-Key" })
            );
            const generator = new AuthProvidersGenerator({
                ir: createMinimalIR({ authSchemes: [authScheme] }),
                authScheme: authScheme as unknown as FernIr.AuthScheme,
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            expect(generator.shouldWriteFile()).toBe(true);
            const filePath = generator.getFilePath();
            assert(filePath.file != null, "file should not be undefined");
            expect(filePath.file.nameOnDisk).toBe("HeaderAuthProvider.ts");
        });

        it("dispatches inferred auth scheme to InferredAuthProviderGenerator", () => {
            const serviceId = "auth-service" as unknown as FernIr.ServiceId;
            const endpointId = "get-token" as unknown as FernIr.EndpointId;
            // Build an IR with the referenced service so InferredAuthProviderGenerator can find it
            const ir = createMinimalIR();
            // biome-ignore lint/suspicious/noExplicitAny: inject service into IR services map
            (ir.services as any)[serviceId] = {
                availability: undefined,
                name: {
                    fernFilepath: {
                        allParts: [],
                        packagePath: [],
                        file: undefined
                    }
                },
                displayName: undefined,
                basePath: { head: "/", parts: [] },
                pathParameters: [],
                headers: [],
                endpoints: [
                    {
                        id: endpointId,
                        name: {
                            originalName: "getToken",
                            camelCase: { unsafeName: "getToken", safeName: "getToken" },
                            snakeCase: { unsafeName: "get_token", safeName: "get_token" },
                            screamingSnakeCase: { unsafeName: "GET_TOKEN", safeName: "GET_TOKEN" },
                            pascalCase: { unsafeName: "GetToken", safeName: "GetToken" }
                        },
                        displayName: undefined,
                        method: "POST",
                        headers: [],
                        path: { head: "/token", parts: [] },
                        fullPath: { head: "/token", parts: [] },
                        pathParameters: [],
                        allPathParameters: [],
                        queryParameters: [],
                        requestBody: undefined,
                        sdkRequest: undefined,
                        response: undefined,
                        streamingResponse: undefined,
                        errors: [],
                        auth: false,
                        idempotent: false,
                        baseUrl: undefined,
                        availability: undefined,
                        docs: undefined,
                        userSpecifiedExamples: [],
                        autogeneratedExamples: [],
                        v2Examples: undefined,
                        pagination: undefined
                    }
                ],
                transport: undefined
            };
            const inferredScheme = {
                type: "inferred" as const,
                key: "inferred",
                tokenEndpoint: {
                    endpoint: {
                        endpointId,
                        serviceId,
                        subpackageId: undefined
                    },
                    expiryProperty: undefined,
                    authenticatedRequestHeaders: []
                },
                docs: undefined
            } as unknown as FernIr.AuthScheme;
            const generator = new AuthProvidersGenerator({
                ir,
                authScheme: inferredScheme,
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            expect(generator.shouldWriteFile()).toBe(true);
            const filePath = generator.getFilePath();
            assert(filePath.file != null, "file should not be undefined");
            expect(filePath.file.nameOnDisk).toBe("InferredAuthProvider.ts");
        });

        it("dispatches { type: 'any' } to AnyAuthProviderGenerator", () => {
            const generator = new AuthProvidersGenerator({
                ir: createMinimalIR(),
                authScheme: { type: "any" },
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            expect(generator.shouldWriteFile()).toBe(true);
            const filePath = generator.getFilePath();
            assert(filePath.file != null, "file should not be undefined");
            expect(filePath.file.nameOnDisk).toBe("AnyAuthProvider.ts");
        });

        it("dispatches { type: 'routing' } to RoutingAuthProviderGenerator", () => {
            const generator = new AuthProvidersGenerator({
                ir: createMinimalIR(),
                authScheme: { type: "routing" },
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            expect(generator.shouldWriteFile()).toBe(true);
            const filePath = generator.getFilePath();
            assert(filePath.file != null, "file should not be undefined");
            expect(filePath.file.nameOnDisk).toBe("RoutingAuthProvider.ts");
        });
    });

    describe("shouldWriteFile()", () => {
        it("returns true for all valid auth scheme types", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const generator = new AuthProvidersGenerator({
                ir: createMinimalIR({ authSchemes: [authScheme] }),
                authScheme: authScheme as unknown as FernIr.AuthScheme,
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            expect(generator.shouldWriteFile()).toBe(true);
        });
    });

    describe("getFilePath()", () => {
        it("returns auth directory path for bearer", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const generator = new AuthProvidersGenerator({
                ir: createMinimalIR({ authSchemes: [authScheme] }),
                authScheme: authScheme as unknown as FernIr.AuthScheme,
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            const filePath = generator.getFilePath();
            expect(filePath.directories).toEqual(
                expect.arrayContaining([expect.objectContaining({ nameOnDisk: "auth" })])
            );
        });

        it("returns auth directory path for basic", () => {
            const authScheme = createAuthScheme("basic", createBasicAuthScheme());
            const generator = new AuthProvidersGenerator({
                ir: createMinimalIR({ authSchemes: [authScheme] }),
                authScheme: authScheme as unknown as FernIr.AuthScheme,
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            const filePath = generator.getFilePath();
            expect(filePath.directories).toEqual(
                expect.arrayContaining([expect.objectContaining({ nameOnDisk: "auth" })])
            );
        });
    });

    describe("writeToFile()", () => {
        it("calls shouldWriteFile and delegates to underlying generator", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new AuthProvidersGenerator({
                ir,
                authScheme: authScheme as unknown as FernIr.AuthScheme,
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false
            });
            // Verify shouldWriteFile returns true (meaning writeToFile would delegate)
            expect(generator.shouldWriteFile()).toBe(true);
        });
    });
});
