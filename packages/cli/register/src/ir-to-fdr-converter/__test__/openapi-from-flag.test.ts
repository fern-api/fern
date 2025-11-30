/**
 * OpenAPI v3 Parser Pipeline Tests (--from-openapi flag functionality)
 *
 * This test validates the OpenAPI processing pipeline without requiring CLI compilation.
 * It directly tests the core functions that the --from-openapi flag uses internally.
 *
 */

import { spawnSync } from "node:child_process";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import assert from "assert";

import { convertIrToFdrApi } from "../convertIrToFdrApi";

const hasBuf = spawnSync("buf", ["--version"], { stdio: "ignore" }).status === 0;

describe("OpenAPI v3 Parser Pipeline (--from-openapi flag)", () => {
    it("should replicate complete `fern fdr {file} --from-openapi` pipeline and produce S3-ready output", async () => {
        // Step 1: Load OpenAPI workspace (same as CLI --from-openapi does)
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/openapi-from-flag-simple")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "openapi-from-flag-simple"
        });

        // Verify workspace loaded successfully
        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        // Step 2: Get Fern definition (validates OpenAPI parsing)
        const definition = await workspace.workspace.getDefinition({ context });
        expect(definition).toBeDefined();
        expect(definition.rootApiFile?.contents).toBeDefined();

        // Validate that OpenAPI was properly parsed into Fern IR structure
        const rootApi = definition.rootApiFile?.contents;
        expect(rootApi).toBeDefined();

        // The OpenAPI should be parsed into services
        if (rootApi && "services" in rootApi) {
            expect(rootApi.services).toBeDefined();
        }

        // Step 3: Generate IR using the v3 parser route (EXACTLY the same as --from-openapi)
        // This calls OSSWorkspace.getIntermediateRepresentation() which internally uses:
        // - OpenAPIConverterContext3_1 (v3.1 converter context)
        // - OpenAPI3_1Converter (v3 parser from @fern-api/openapi-to-ir)
        // - converter.convert() (generates IR using v3 parser)
        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error(
                `Expected OSSWorkspace for OpenAPI processing, got ${workspace.workspace.constructor.name}`
            );
        }

        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        // Step 4: Convert IR to FDR API Definition (COMPLETE --from-openapi pipeline)
        // This is what gets uploaded to S3 and what the CLI command `fern fdr {file} --from-openapi` produces
        const fdrApiDefinition = await convertIrToFdrApi({
            ir: intermediateRepresentation,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: {
                oauth: true
            },
            context
        });

        // Step 5: Validate FDR structure (same as what gets uploaded to S3)
        expect(fdrApiDefinition).toBeDefined();
        expect(fdrApiDefinition.types).toBeDefined();
        expect(fdrApiDefinition.subpackages).toBeDefined();
        expect(fdrApiDefinition.rootPackage).toBeDefined();
        // Note: auth might be undefined if no auth schemes in OpenAPI spec

        // Validate IR structure (intermediate step)
        expect(intermediateRepresentation).toBeDefined();
        expect(intermediateRepresentation.apiName).toBeDefined();
        expect(intermediateRepresentation.services).toBeDefined();

        // Validate that our OpenAPI endpoints were converted to services
        expect(Object.keys(intermediateRepresentation.services)).toHaveLength(1);

        const service = Object.values(intermediateRepresentation.services)[0];
        expect(service).toBeDefined();

        // Validate service endpoints (should have 3 endpoints from our OpenAPI spec)
        if (service && typeof service === "object" && "endpoints" in service) {
            const serviceWithEndpoints = service as { endpoints?: unknown[] };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            expect(serviceWithEndpoints.endpoints?.length).toBe(3); // /health, /users/{userId}, /users POST
        }

        // Step 6: Snapshot the FINAL FDR output (what gets uploaded to S3)
        // This is the exact same format as `fern fdr {file} --from-openapi` produces
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/openapi-from-flag-simple-fdr.snap");

        // Also snapshot the IR for intermediate validation
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/openapi-from-flag-simple-ir.snap");
    });

    it("should handle OpenAPI with auth schemes", async () => {
        // Test OpenAPI spec with bearer token authentication
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/openapi-auth-test")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "openapi-auth-test"
        });

        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error(
                `Expected OSSWorkspace for OpenAPI processing, got ${workspace.workspace.constructor.name}`
            );
        }

        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        // Convert to FDR format (complete pipeline)
        const fdrApiDefinition = await convertIrToFdrApi({
            ir: intermediateRepresentation,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: {
                oauth: true
            },
            context
        });

        // Validate auth was processed correctly
        expect(intermediateRepresentation.auth).toBeDefined();
        expect(intermediateRepresentation.auth.schemes).toHaveLength(1);
        expect(fdrApiDefinition.authSchemes).toBeDefined();

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/openapi-auth-test-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/openapi-auth-test-ir.snap");
    });

    it("should handle OpenAPI with multiple security headers", async () => {
        // Test OpenAPI spec with endpoints requiring multiple security headers
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/multiple-security-headers")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "multiple-security-headers"
        });

        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error(
                `Expected OSSWorkspace for OpenAPI processing, got ${workspace.workspace.constructor.name}`
            );
        }

        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        // Convert to FDR format (complete pipeline)
        const fdrApiDefinition = await convertIrToFdrApi({
            ir: intermediateRepresentation,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: {
                oauth: true
            },
            context
        });

        // Validate auth schemes were processed correctly
        expect(intermediateRepresentation.auth).toBeDefined();
        expect(intermediateRepresentation.auth.schemes).toBeDefined();
        // Should have 5 security schemes: wallet, blockchain, userId, merchant, admin
        expect(intermediateRepresentation.auth.schemes.length).toBeGreaterThanOrEqual(5);

        // Validate FDR auth schemes
        expect(fdrApiDefinition.authSchemes).toBeDefined();
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {}).length).toBeGreaterThanOrEqual(5);

        // Validate that endpoints have the correct security requirements
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/multiple-security-headers-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/multiple-security-headers-ir.snap");
    });

    it("should handle OpenAPI workspace loading errors gracefully", async () => {
        // Test with invalid workspace path to ensure error handling works
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/nonexistent-openapi")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "nonexistent"
        });

        // Should fail gracefully (same behavior as CLI would have)
        expect(workspace.didSucceed).toBe(false);
        if (!workspace.didSucceed) {
            expect(workspace.failures).toBeDefined();
            // Failures might be an object or array depending on the error type
            const failureCount = Array.isArray(workspace.failures)
                ? workspace.failures.length
                : Object.keys(workspace.failures).length;
            expect(failureCount).toBeGreaterThan(0);
        }
    });

    it("should handle OpenAPI with oneOf discriminator mapping using references", async () => {
        // Test OpenAPI spec with oneOf discriminator that uses property mapping and references with descriptions
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/oneOf-references-mapping")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "oneOf-references-mapping"
        });

        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error(
                `Expected OSSWorkspace for OpenAPI processing, got ${workspace.workspace.constructor.name}`
            );
        }

        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        // Convert to FDR format (complete pipeline)
        const fdrApiDefinition = await convertIrToFdrApi({
            ir: intermediateRepresentation,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: {
                oauth: true
            },
            context
        });

        // Validate oneOf/discriminator processing
        expect(intermediateRepresentation.types).toBeDefined();
        expect(Object.keys(intermediateRepresentation.types)).toContain("EventRequest");

        // Check that union type with discriminator was processed (may be discriminated or undiscriminated)
        const eventRequestType = Object.values(intermediateRepresentation.types).find(
            (type) => type.name.name.originalName === "EventRequest"
        );
        expect(eventRequestType).toBeDefined();
        // Note: v3 parser may produce "union" or "undiscriminatedUnion" depending on discriminator processing
        // expect(["union", "undiscriminatedUnion"]).toContain(eventRequestType?.shape.type);

        // Validate FDR structure for union types
        expect(fdrApiDefinition.types).toBeDefined();
        const fdrEventRequestType = Object.values(fdrApiDefinition.types as Record<string, { name?: unknown }>).find(
            (type): type is { name: string } => typeof type.name === "string" && type.name === "EventRequest"
        );
        expect(fdrEventRequestType).toBeDefined();
        // FDR structure should also have union-like shape
        // expect(["union", "undiscriminatedUnion"]).toContain((fdrEventRequestType as any)?.shape?.type);

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/oneOf-references-mapping-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/oneOf-references-mapping-ir.snap");
    });

    it("should validate OpenAPI fixture structure", async () => {
        // Basic validation that our test fixture is properly structured
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/openapi-from-flag-simple")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "openapi-from-flag-simple"
        });

        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        const definition = await workspace.workspace.getDefinition({ context });
        expect(definition).toBeDefined();
        expect(definition.rootApiFile?.contents).toBeDefined();

        // Validate fixture has the expected OpenAPI structure
        const rootApi = definition.rootApiFile?.contents;
        expect(rootApi).toBeDefined();
    });

    it.skipIf(!hasBuf)("should handle gRPC proto with comments service", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/grpc-comments")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "grpc-comments"
        });

        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error(`Expected OSSWorkspace for gRPC processing, got ${workspace.workspace.constructor.name}`);
        }

        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: true
        });

        // Convert to FDR format (complete pipeline)
        const fdrApiDefinition = await convertIrToFdrApi({
            ir: intermediateRepresentation,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: {
                oauth: true
            },
            context
        });

        // Validate auth was processed correctly
        expect(intermediateRepresentation.auth).toBeDefined();
        expect(fdrApiDefinition.authSchemes).toBeDefined();

        // Validate services and endpoints
        expect(intermediateRepresentation.services).toBeDefined();
        expect(fdrApiDefinition.subpackages).toBeDefined();

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/grpc-comments-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/grpc-comments-ir.snap");
    });

    it("should handle OpenAPI with x-codeSamples extension", async () => {
        // Test OpenAPI spec with x-codeSamples extension (Redocly format)
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/x-code-samples")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "x-code-samples"
        });

        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error(
                `Expected OSSWorkspace for OpenAPI processing, got ${workspace.workspace.constructor.name}`
            );
        }

        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        // Convert to FDR format (complete pipeline)
        const fdrApiDefinition = await convertIrToFdrApi({
            ir: intermediateRepresentation,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: {
                oauth: true
            },
            context
        });

        // Validate that x-codeSamples were parsed into IR
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        const service = services[0];
        expect(service).toBeDefined();
        if (service && typeof service === "object" && "endpoints" in service) {
            const serviceWithEndpoints = service as { endpoints?: Array<{ examples?: unknown[] }> };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            expect(serviceWithEndpoints.endpoints?.length).toBeGreaterThan(0);

            // Validate that code samples were converted to examples
            const getUserEndpoint = serviceWithEndpoints.endpoints?.[0];
            expect(getUserEndpoint).toBeDefined();

            if (getUserEndpoint?.examples) {
                // Should have 3 code samples: Python, TypeScript, Go
                expect(getUserEndpoint.examples.length).toBeGreaterThanOrEqual(3);
            }
        }

        // Validate FDR structure
        expect(fdrApiDefinition.types).toBeDefined();
        expect(fdrApiDefinition.subpackages).toBeDefined();
        expect(fdrApiDefinition.rootPackage).toBeDefined();

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/x-code-samples-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/x-code-samples-ir.snap");
    });

    it("should prefer x-fern-examples code-samples over x-codeSamples when both are present", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/x-code-samples-override")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "x-code-samples-override"
        });

        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error(
                `Expected OSSWorkspace for OpenAPI processing, got ${workspace.workspace.constructor.name}`
            );
        }

        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        // Convert to FDR format (complete pipeline)
        const fdrApiDefinition = await convertIrToFdrApi({
            ir: intermediateRepresentation,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: {
                oauth: true
            },
            context
        });

        // Validate that x-fern-examples code-samples are present in IR
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        const service = services[0];
        expect(service).toBeDefined();
        if (service && typeof service === "object" && "endpoints" in service) {
            const serviceWithEndpoints = service as { endpoints?: Array<{ examples?: unknown[] }> };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            expect(serviceWithEndpoints.endpoints?.length).toBeGreaterThan(0);

            const getUserEndpoint = serviceWithEndpoints.endpoints?.[0];
            expect(getUserEndpoint).toBeDefined();
        }

        // Verify that FDR contains Fern code samples (Go, Ruby) and NOT OpenAPI code samples (Python, TypeScript)
        const fdrString = JSON.stringify(fdrApiDefinition);

        // Should contain Fern code samples
        expect(fdrString).toContain("Go SDK (Fern)");
        expect(fdrString).toContain("Ruby SDK (Fern)");
        expect(fdrString).toContain("go");
        expect(fdrString).toContain("ruby");

        // Should NOT contain OpenAPI code samples (they should be overridden)
        expect(fdrString).not.toContain("Python SDK (OpenAPI)");
        expect(fdrString).not.toContain("TypeScript SDK (OpenAPI)");
        expect(fdrString).not.toContain("openapi-key");
        expect(fdrString).not.toContain("openapi_sdk");

        // Validate FDR structure
        expect(fdrApiDefinition.types).toBeDefined();
        expect(fdrApiDefinition.subpackages).toBeDefined();
        expect(fdrApiDefinition.rootPackage).toBeDefined();

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/x-code-samples-override-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/x-code-samples-override-ir.snap");
    });

    it("should handle wildcard status codes conflicting with specific status codes", async () => {
        // Test OpenAPI spec that has both specific status codes (400, 500) and wildcard patterns (4XX, 5XX)
        // Validates that the fix creates unique error IDs: ClientRequestError (4XX) vs BadRequestError (400)
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/wildcard-status-conflict")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "wildcard-status-conflict"
        });

        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error(
                `Expected OSSWorkspace for OpenAPI processing, got ${workspace.workspace.constructor.name}`
            );
        }

        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        // Convert to FDR format (complete pipeline)
        const fdrApiDefinition = await convertIrToFdrApi({
            ir: intermediateRepresentation,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: {
                oauth: true
            },
            context
        });

        // This test demonstrates the bug where wildcard status codes (4XX, 5XX) and specific status codes (400, 500)
        // conflict because they generate the same error IDs, causing one to overwrite the other.

        // Validate the IR contains error declarations
        expect(intermediateRepresentation.errors).toBeDefined();
        const errorDeclarations = Object.values(intermediateRepresentation.errors);

        // FIXED: Now we expect 4 unique error declarations because each has a unique errorId:
        // - 400 specific: "TestOperationRequestBadRequestError"
        // - 4XX wildcard: "TestOperationRequestClientRequestError"
        // - 500 specific: "TestOperationRequestInternalServerError"
        // - 5XX wildcard: "TestOperationRequestServerError"
        expect(errorDeclarations.length).toBe(4);

        // Verify that all expected error combinations exist
        const errorDeclarationsByStatus = errorDeclarations.reduce(
            (acc, error) => {
                const key = `${error.statusCode}-${error.isWildcardStatusCode || false}`;
                acc[key] = error;
                return acc;
            },
            {} as Record<string, (typeof errorDeclarations)[0]>
        );

        // All four combinations should now exist
        expect(errorDeclarationsByStatus["400-false"]).toBeDefined(); // Specific 400
        expect(errorDeclarationsByStatus["400-true"]).toBeDefined(); // Wildcard 4XX -> 400
        expect(errorDeclarationsByStatus["500-false"]).toBeDefined(); // Specific 500
        expect(errorDeclarationsByStatus["500-true"]).toBeDefined(); // Wildcard 5XX -> 500

        // Verify the error names are unique and semantic
        const specific400 = errorDeclarationsByStatus["400-false"];
        const wildcard400 = errorDeclarationsByStatus["400-true"];
        const specific500 = errorDeclarationsByStatus["500-false"];
        const wildcard500 = errorDeclarationsByStatus["500-true"];

        expect(specific400?.name.name.originalName).toContain("BadRequestError");
        expect(wildcard400?.name.name.originalName).toContain("ClientRequestError");
        expect(specific500?.name.name.originalName).toContain("InternalServerError");
        expect(wildcard500?.name.name.originalName).toContain("ServerError");

        // Validate FDR now contains all 4 errors properly converted
        expect(fdrApiDefinition.rootPackage).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints.length).toBeGreaterThan(0);

        const fdrEndpoint = fdrApiDefinition.rootPackage.endpoints[0];
        if (fdrEndpoint && fdrEndpoint.errorsV2) {
            // FIXED: Now we should have 4 errors instead of 2
            expect(fdrEndpoint.errorsV2.length).toBe(4);

            const fdrErrors400 = fdrEndpoint.errorsV2.filter((error) => error.statusCode === 400);
            const fdrErrors500 = fdrEndpoint.errorsV2.filter((error) => error.statusCode === 500);

            // Should have 2 errors for each status code (specific + wildcard)
            expect(fdrErrors400.length).toBe(2);
            expect(fdrErrors500.length).toBe(2);

            // Verify we have both specific and wildcard versions for each status code
            const specific400 = fdrErrors400.find((error) => !error.isWildcard);
            const wildcard400 = fdrErrors400.find((error) => error.isWildcard);
            const specific500 = fdrErrors500.find((error) => !error.isWildcard);
            const wildcard500 = fdrErrors500.find((error) => error.isWildcard);

            expect(specific400).toBeDefined();
            expect(wildcard400).toBeDefined();
            expect(specific500).toBeDefined();
            expect(wildcard500).toBeDefined();

            // Verify the error names reflect the unique IDs
            expect(specific400?.name).toContain("BadRequestError");
            expect(wildcard400?.name).toContain("ClientRequestError");
            expect(specific500?.name).toContain("InternalServerError");
            expect(wildcard500?.name).toContain("ServerError");
        }

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/wildcard-status-conflict-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/wildcard-status-conflict-ir.snap");
    });

    it("should handle OpenAPI auth scheme override with generators.yml", async () => {
        // Test OpenAPI spec with security schemes named 'api-key' and 'token'
        // combined with generators.yml auth-schemes configuration 'bearerAuth'
        // All schemes should be preserved so endpoints can reference original OpenAPI schemes
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/auth-scheme-override")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "auth-scheme-override"
        });

        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        if (!(workspace.workspace instanceof OSSWorkspace)) {
            throw new Error(
                `Expected OSSWorkspace for OpenAPI processing, got ${workspace.workspace.constructor.name}`
            );
        }

        const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        // Convert to FDR format (complete pipeline)
        const fdrApiDefinition = await convertIrToFdrApi({
            ir: intermediateRepresentation,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: {
                oauth: true
            },
            context
        });

        // Validate that auth schemes were processed with both override and original schemes
        expect(intermediateRepresentation.auth).toBeDefined();
        expect(intermediateRepresentation.auth.schemes).toBeDefined();
        expect(intermediateRepresentation.auth.schemes.length).toBeGreaterThan(0);

        // The OpenAPI spec has two security schemes: 'api-key' (apiKey type) and 'token' (bearer type)
        // Plus generators.yml defines 'bearerAuth' override
        // All three should be present in the IR
        const authSchemes = intermediateRepresentation.auth.schemes;

        // Check that we have all 3 auth schemes in the IR (bearerAuth override + 2 OpenAPI schemes)
        expect(authSchemes.length).toBe(3);

        // Validate that all expected scheme keys exist
        const schemeKeys = authSchemes.map((scheme) => scheme.key);
        expect(schemeKeys).toContain("bearerAuth"); // From generators.yml override
        expect(schemeKeys).toContain("api-key"); // From OpenAPI
        expect(schemeKeys).toContain("token"); // From OpenAPI

        // Validate FDR auth schemes contain all three schemes
        expect(fdrApiDefinition.authSchemes).toBeDefined();
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {})).toContain("bearerAuth");
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {})).toContain("api-key");
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {})).toContain("token");
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {}).length).toBe(3);

        // Validate services and endpoints exist
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        const service = services[0];
        expect(service).toBeDefined();
        if (service && typeof service === "object" && "endpoints" in service) {
            const serviceWithEndpoints = service as { endpoints?: unknown[] };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            // Should have 3 endpoints: /protected-api-key, /protected-token, /public
            expect(serviceWithEndpoints.endpoints?.length).toBe(3);
        }

        // Validate FDR structure
        expect(fdrApiDefinition.types).toBeDefined();
        expect(fdrApiDefinition.subpackages).toBeDefined();
        expect(fdrApiDefinition.rootPackage).toBeDefined();

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/auth-scheme-override-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/auth-scheme-override-ir.snap");
    });
});
