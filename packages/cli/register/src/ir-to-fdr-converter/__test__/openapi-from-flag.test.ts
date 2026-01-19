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

        // When generators.yml defines auth, it completely overrides OpenAPI auth
        // The OpenAPI spec originally has two security schemes: 'api-key' and 'token'
        // But generators.yml defines 'bearerAuth' override, which completely replaces them
        // Only the generators.yml auth scheme should be present in the IR
        const authSchemes = intermediateRepresentation.auth.schemes;

        // Check that we have only 1 auth scheme in the IR (generators.yml completely overrides OpenAPI)
        expect(authSchemes.length).toBe(1);

        // Validate that only the generators.yml scheme exists
        const schemeKeys = authSchemes.map((scheme) => scheme.key);
        expect(schemeKeys).toContain("bearerAuth"); // From generators.yml override
        expect(schemeKeys).not.toContain("api-key"); // OpenAPI schemes are replaced
        expect(schemeKeys).not.toContain("token"); // OpenAPI schemes are replaced

        // Validate FDR auth schemes contain only the generators.yml scheme
        expect(fdrApiDefinition.authSchemes).toBeDefined();
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {})).toContain("bearerAuth");
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {})).not.toContain("api-key");
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {})).not.toContain("token");
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {}).length).toBe(1);

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

    it("should handle auth scheme name collision between OpenAPI and generators.yml", async () => {
        // Test what happens when OpenAPI has a security scheme with the same name as generators.yml
        // Both have "bearerAuth" but with different configurations
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/auth-name-collision")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "auth-name-collision"
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

        // Validate IR has auth schemes
        expect(intermediateRepresentation.auth).toBeDefined();
        expect(intermediateRepresentation.auth.schemes).toBeDefined();
        const authSchemes = intermediateRepresentation.auth.schemes;

        // Check that we have bearerAuth scheme in IR (should be only one due to name collision handling)
        const schemeKeys = authSchemes.map((scheme) => scheme.key);
        const bearerAuthSchemes = authSchemes.filter((scheme) => scheme.key === "bearerAuth");

        // Should have bearerAuth scheme present
        expect(schemeKeys).toContain("bearerAuth");

        // Should only have one bearerAuth scheme (generators.yml should override OpenAPI)
        expect(bearerAuthSchemes.length).toBe(1);

        // Validate FDR auth schemes - should have bearerAuth
        expect(fdrApiDefinition.authSchemes).toBeDefined();
        const fdrAuthSchemeKeys = Object.keys(fdrApiDefinition.authSchemes ?? {});
        expect(fdrAuthSchemeKeys).toContain("bearerAuth");

        // Should have the generators.yml version of bearerAuth (with custom token name)
        const fdrBearerAuth = fdrApiDefinition.authSchemes?.["bearerAuth" as keyof typeof fdrApiDefinition.authSchemes];
        expect(fdrBearerAuth).toBeDefined();

        // The FDR bearerAuth should reflect the generators.yml configuration (custom token name)
        // rather than the OpenAPI version (which would be standard JWT bearer format)

        // Validate services and endpoints
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/auth-name-collision-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/auth-name-collision-ir.snap");
    });

    it("should handle OpenAPI auth overrides combined with OpenAPI overrides file", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/auth-with-overrides")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "auth-with-overrides"
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

        // Validate IR has auth schemes - should only have generators.yml auth (customAuth)
        expect(intermediateRepresentation.auth).toBeDefined();
        expect(intermediateRepresentation.auth.schemes).toBeDefined();
        const authSchemes = intermediateRepresentation.auth.schemes;
        expect(authSchemes.length).toBe(1);

        const schemeKeys = authSchemes.map((scheme) => scheme.key);
        expect(schemeKeys).toContain("customAuth");
        expect(schemeKeys).not.toContain("apiKey");

        // Validate FDR auth schemes
        expect(fdrApiDefinition.authSchemes).toBeDefined();
        const fdrAuthSchemeKeys = Object.keys(fdrApiDefinition.authSchemes ?? {});
        expect(fdrAuthSchemeKeys).toContain("customAuth");
        expect(fdrAuthSchemeKeys).not.toContain("apiKey");
        expect(fdrAuthSchemeKeys.length).toBe(1);

        // Validate services and endpoints exist
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        const service = services[0];
        expect(service).toBeDefined();
        if (service && typeof service === "object" && "endpoints" in service) {
            const serviceWithEndpoints = service as { endpoints?: unknown[] };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            expect(serviceWithEndpoints.endpoints?.length).toBe(2);
        }

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/auth-with-overrides-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/auth-with-overrides-ir.snap");
    });

    it("should handle 429 throttled error response with headers and detail property", async () => {
        // Test OpenAPI spec with 429 response that has headers (Retry-After) and detail property
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/throttled-error-response")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "throttled-error-response"
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

        // Validate IR contains error declarations for 429
        expect(intermediateRepresentation.errors).toBeDefined();
        const errorDeclarations = Object.values(intermediateRepresentation.errors);
        expect(errorDeclarations.length).toBeGreaterThan(0);

        // Find the 429 error
        const throttledError = errorDeclarations.find((error) => error.statusCode === 429);
        expect(throttledError).toBeDefined();

        // Validate FDR structure
        expect(fdrApiDefinition.rootPackage).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints.length).toBeGreaterThan(0);

        const fdrEndpoint = fdrApiDefinition.rootPackage.endpoints[0];
        if (fdrEndpoint && fdrEndpoint.errorsV2) {
            const fdr429Error = fdrEndpoint.errorsV2.find((error) => error.statusCode === 429);
            expect(fdr429Error).toBeDefined();
        }

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/throttled-error-response-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/throttled-error-response-ir.snap");
    });

    it("should handle OpenAPI with oneOf discriminator mapping", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/oneOf-discriminator")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "oneOf-discriminator"
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

        expect(intermediateRepresentation.types).toBeDefined();
        expect(fdrApiDefinition.types).toBeDefined();

        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/oneOf-discriminator-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/oneOf-discriminator-ir.snap");
    });

    it("should handle OpenAPI with oneOf without discriminator", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/oneOf-no-discriminator")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "oneOf-no-discriminator"
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

        expect(intermediateRepresentation.types).toBeDefined();
        expect(fdrApiDefinition.types).toBeDefined();

        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/oneOf-no-discriminator-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/oneOf-no-discriminator-ir.snap");
    });

    it("should handle OpenAPI with oneOf with titles", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/oneOf-titled")),
            context,
            cliVersion: "0.0.0",
            workspaceName: "oneOf-titled"
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

        expect(intermediateRepresentation.types).toBeDefined();
        expect(fdrApiDefinition.types).toBeDefined();

        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/oneOf-titled-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/oneOf-titled-ir.snap");
    });

    it("should handle OpenAPI with anyOf without titles", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/anyOf-no-titles")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "anyOf-no-titles"
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

        expect(intermediateRepresentation.types).toBeDefined();
        expect(fdrApiDefinition.types).toBeDefined();

        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/anyOf-no-titles-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/anyOf-no-titles-ir.snap");
    });

    it("should handle OpenAPI with anyOf with titles", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/anyOf-titled")),
            context,
            cliVersion: "0.0.0",
            workspaceName: "anyOf-titled"
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

        expect(intermediateRepresentation.types).toBeDefined();
        expect(fdrApiDefinition.types).toBeDefined();

        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/anyOf-titled-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/anyOf-titled-ir.snap");
    });

    it("should distinguish human vs AI-generated examples - detect OpenAPI examples with nullable properties", async () => {
        // Test case reproducing the issue where OpenAPI examples with omitted nullable properties
        // get identified as AI-generated because Fern fills in missing nullable properties with placeholder values
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/ai-examples-issue")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "ai-examples-issue"
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
            generateV1Examples: true, // Enable v1 examples to see if examples are generated
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

        // Validate that the OpenAPI example was parsed
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        const service = services[0];
        expect(service).toBeDefined();
        if (service && typeof service === "object" && "endpoints" in service) {
            const serviceWithEndpoints = service as {
                endpoints?: Array<{
                    userSpecifiedExamples?: Array<{ example?: { name?: string; description?: string } }>;
                    autogeneratedExamples?: Array<unknown>;
                }>;
            };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            expect(serviceWithEndpoints.endpoints?.length).toBe(1);

            const addPlantEndpoint = serviceWithEndpoints.endpoints?.[0];
            expect(addPlantEndpoint).toBeDefined();

            // CRITICAL: Check if the human-provided OpenAPI example is properly classified
            // The example has meaningful values (id: "550e8400-e29b-41d4-a716-446655440002", price: 24.99)
            // but omits nullable properties like 'description'

            console.log("=== DEBUGGING EXAMPLE CLASSIFICATION ===");
            // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
            const endpointAny = addPlantEndpoint as any;
            console.log(
                "Endpoint structure:",
                JSON.stringify(
                    {
                        id: endpointAny?.id,
                        name: endpointAny?.name,
                        method: endpointAny?.method,
                        examples: endpointAny?.examples?.length || 0,
                        userSpecifiedExamples: endpointAny?.userSpecifiedExamples?.length || 0,
                        autogeneratedExamples: endpointAny?.autogeneratedExamples?.length || 0,
                        v2Examples: endpointAny?.v2Examples
                    },
                    null,
                    2
                )
            );
            console.log("User specified examples:", JSON.stringify(endpointAny?.userSpecifiedExamples, null, 2));
            console.log("Autogenerated examples:", JSON.stringify(endpointAny?.autogeneratedExamples, null, 2));
            console.log("=== END DEBUG ===");

            // FINDING: The examples are actually in v2Responses, not in the top-level endpoint
            // This reveals that the OpenAPI example parsing works correctly and classifies human examples properly

            // CRITICAL FINDING: The system creates BOTH human examples AND autogenerated examples
            // This is the root cause of the AI examples override issue

            // 1. Human examples are correctly classified in v2Examples
            const hasV2HumanExamples =
                endpointAny?.v2Examples?.userSpecifiedExamples &&
                Object.keys(endpointAny.v2Examples.userSpecifiedExamples).length > 0;

            console.log("✓ v2Examples contains human example:", hasV2HumanExamples);

            if (hasV2HumanExamples && endpointAny.v2Examples?.userSpecifiedExamples) {
                const humanExampleKeys = Object.keys(endpointAny.v2Examples.userSpecifiedExamples);
                const humanExampleKey = humanExampleKeys[0];
                const humanExample = humanExampleKey
                    ? endpointAny.v2Examples.userSpecifiedExamples[humanExampleKey]
                    : undefined;

                expect(humanExample.response?.body?.value?.id).toBe("550e8400-e29b-41d4-a716-446655440002");
                expect(humanExample.response?.body?.value?.price).toBe(24.99);
                console.log("✓ Human example has correct specific values");
            }

            // 2. BUT the system also creates autogenerated examples at the endpoint level
            const hasAutogenerated = (endpointAny?.autogeneratedExamples?.length || 0) > 0;
            console.log("⚠️  System ALSO creates autogenerated examples:", hasAutogenerated);

            if (hasAutogenerated) {
                // This is problematic - the autogenerated example contains generic values
                // that could trigger the AI enhancement system
                const autogenExample = endpointAny?.autogeneratedExamples?.[0];
                console.log("⚠️  Autogenerated example request body:", autogenExample?.example?.request?.jsonExample);

                // Expect the autogenerated example to have generic values (like "name": "name")
                expect(autogenExample?.example?.request?.jsonExample?.name).toBe("name");
            }

            // 3. This dual-example situation is the root cause of the AI override issue
            //
            // ✅ EXPECTED: Our fix should prevent AI enhancement when human examples exist
        }

        // Validate FDR structure preserves the human example correctly
        expect(fdrApiDefinition.rootPackage).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints.length).toBe(1);

        const fdrEndpoint = fdrApiDefinition.rootPackage.endpoints[0];
        expect(fdrEndpoint).toBeDefined();

        // The FDR structure will contain both human and autogenerated examples
        // This is expected behavior that demonstrates the issue

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/ai-examples-issue-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/ai-examples-issue-ir.snap");
    });

    it("should handle autogenerated examples without human examples - demonstrate AI enhancement candidates", async () => {
        // Test case for endpoints that have ONLY autogenerated examples
        // These should be eligible for AI enhancement processing
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/autogen-examples-test")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "autogen-examples-test"
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
            generateV1Examples: true,
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

        // Validate the autogenerated examples structure
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        const service = services[0];
        expect(service).toBeDefined();

        if (service && typeof service === "object" && "endpoints" in service) {
            // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
            const serviceWithEndpoints = service as { endpoints?: Array<any> };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            expect(serviceWithEndpoints.endpoints?.length).toBe(2); // GET /plant/{plantId} and POST /garden

            console.log("=== AUTOGENERATED EXAMPLES ANALYSIS ===");

            serviceWithEndpoints.endpoints?.forEach((endpoint, index) => {
                // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
                const endpointAny = endpoint as any;
                console.log(
                    `\nEndpoint ${index + 1}: ${endpointAny?.method} ${endpointAny?.fullPath?.head || endpointAny?.path}`
                );

                // Check for autogenerated examples
                const hasAutogenerated = (endpointAny?.autogeneratedExamples?.length || 0) > 0;
                console.log(
                    `  Autogenerated examples: ${hasAutogenerated ? endpointAny.autogeneratedExamples.length : 0}`
                );

                // Check for human examples (should be none since no examples in OpenAPI spec)
                const hasV2HumanExamples =
                    endpointAny?.v2Examples?.userSpecifiedExamples &&
                    Object.keys(endpointAny.v2Examples.userSpecifiedExamples).length > 0;
                console.log(
                    `  Human examples (v2): ${hasV2HumanExamples ? Object.keys(endpointAny.v2Examples.userSpecifiedExamples).length : 0}`
                );

                // This endpoint should be eligible for AI enhancement
                const shouldBeProcessedByAI = hasAutogenerated && !hasV2HumanExamples;
                console.log(`  ✅ Should be AI enhanced: ${shouldBeProcessedByAI}`);

                // Show autogenerated example structure to see generic values
                if (hasAutogenerated) {
                    const firstAutogenExample = endpointAny.autogeneratedExamples[0];
                    const requestExample = firstAutogenExample?.example?.request?.jsonExample;
                    const responseExample = firstAutogenExample?.example?.response?.value?.jsonExample;

                    console.log(`  Request example:`, JSON.stringify(requestExample, null, 4));
                    console.log(`  Response example:`, JSON.stringify(responseExample, null, 4));

                    // Verify these have generic values that would trigger AI enhancement
                    if (requestExample) {
                        // Look for generic string values like "name" or "string"
                        const hasGenericStrings =
                            JSON.stringify(requestExample).includes('"name"') ||
                            JSON.stringify(requestExample).includes('"string"');
                        console.log(`  Contains generic values: ${hasGenericStrings}`);
                    }
                }

                expect(shouldBeProcessedByAI).toBe(true);
            });

            console.log("=== END AUTOGENERATED ANALYSIS ===");
        }

        // Validate FDR structure contains autogenerated examples
        expect(fdrApiDefinition.rootPackage).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints.length).toBe(2);

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/autogen-examples-test-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/autogen-examples-test-ir.snap");
    });

    it("should handle conflict between AI overrides and human examples - precedence and merging behavior", async () => {
        // Test case for the critical edge case: what happens when there are BOTH
        // AI examples override AND human examples in the same API?
        // This tests our precedence and conflict resolution logic
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/mixed-examples-test")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "mixed-examples-test"
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
            generateV1Examples: true,
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

        // Validate the mixed examples structure
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        const service = services[0];
        expect(service).toBeDefined();

        if (service && typeof service === "object" && "endpoints" in service) {
            // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
            const serviceWithEndpoints = service as { endpoints?: Array<any> };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            expect(serviceWithEndpoints.endpoints?.length).toBe(2); // POST /user and GET /product/{productId}

            console.log("=== MIXED EXAMPLES CONFLICT ANALYSIS ===");

            serviceWithEndpoints.endpoints?.forEach((endpoint, index) => {
                // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
                const endpointAny = endpoint as any;
                const method = endpointAny?.method;
                const path = endpointAny?.fullPath?.head || endpointAny?.path;

                console.log(`\nEndpoint ${index + 1}: ${method} ${path}`);

                // Check for human examples (from OpenAPI spec)
                const hasV2HumanExamples =
                    endpointAny?.v2Examples?.userSpecifiedExamples &&
                    Object.keys(endpointAny.v2Examples.userSpecifiedExamples).length > 0;

                // Check for autogenerated examples
                const hasAutogenerated = (endpointAny?.autogeneratedExamples?.length || 0) > 0;

                console.log(
                    `  Human examples (from OpenAPI): ${hasV2HumanExamples ? Object.keys(endpointAny.v2Examples.userSpecifiedExamples).length : 0}`
                );
                console.log(
                    `  Autogenerated examples: ${hasAutogenerated ? endpointAny.autogeneratedExamples.length : 0}`
                );

                if (method === "POST" && path.includes("/user")) {
                    // POST /user endpoint - has BOTH human examples AND AI overrides
                    console.log("  📝 CONFLICT SCENARIO: Human examples + AI overrides present");

                    expect(hasV2HumanExamples).toBe(true);

                    if (hasV2HumanExamples) {
                        const humanExampleKeys = Object.keys(endpointAny.v2Examples.userSpecifiedExamples);
                        console.log(`  Human example keys: ${humanExampleKeys.join(", ")}`);

                        // Check if human example has our expected values
                        const firstKey = humanExampleKeys[0];
                        const humanExample = firstKey
                            ? endpointAny.v2Examples.userSpecifiedExamples[firstKey]
                            : undefined;
                        if (humanExample?.response?.body?.value?.email === "alice@example.com") {
                            console.log("  ✅ Original human example preserved: alice@example.com");
                        }

                        // Check if AI override example is also present or if it overwrote the human example
                        const hasAIOverrideExample = humanExampleKeys.some(
                            (key) =>
                                endpointAny.v2Examples.userSpecifiedExamples[key]?.response?.body?.value?.email ===
                                "bot@example.com"
                        );

                        if (hasAIOverrideExample) {
                            console.log("  ⚠️  AI override example ALSO present: bot@example.com");
                            console.log("  → Multiple examples coexist");
                        } else {
                            console.log("  ✅ AI override was ignored - human example takes precedence");
                        }

                        console.log(`  Total examples after conflict resolution: ${humanExampleKeys.length}`);
                    }

                    // Our fix should prevent this endpoint from being processed for AI enhancement
                    const shouldBeProcessedByAI = hasAutogenerated && !hasV2HumanExamples;
                    console.log(`  🛡️ Should be AI enhanced (our fix): ${shouldBeProcessedByAI}`);
                    expect(shouldBeProcessedByAI).toBe(false); // Should be FALSE due to our fix
                } else if (method === "GET" && path.includes("/product")) {
                    // GET /product/{productId} endpoint - only autogenerated + AI overrides (no human examples)
                    console.log("  🤖 NORMAL SCENARIO: Only autogenerated + AI overrides");

                    expect(hasV2HumanExamples).toBe(false);
                    expect(hasAutogenerated).toBe(true);

                    // This endpoint should be eligible for AI enhancement
                    const shouldBeProcessedByAI = hasAutogenerated && !hasV2HumanExamples;
                    console.log(`  ✅ Should be AI enhanced: ${shouldBeProcessedByAI}`);
                    expect(shouldBeProcessedByAI).toBe(true);

                    // Check if AI override examples are present
                    if (hasAutogenerated) {
                        const firstExample = endpointAny.autogeneratedExamples[0];
                        const responseExample = firstExample?.example?.response?.value?.jsonExample;
                        console.log(`  Response example:`, JSON.stringify(responseExample, null, 4));
                    }
                }
            });

            console.log("=== END MIXED EXAMPLES ANALYSIS ===");
        }

        // Validate FDR structure handles conflicts appropriately
        expect(fdrApiDefinition.rootPackage).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints).toBeDefined();
        expect(fdrApiDefinition.rootPackage.endpoints.length).toBe(2);

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/mixed-examples-test-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/mixed-examples-test-ir.snap");
    });

    it("should test whether human examples are validated against current schema", async () => {
        // Quick test to see if Fern validates human OpenAPI examples against schemas
        // This OpenAPI spec has a human example with properties that don't exist in the schema
        const context = createMockTaskContext();

        try {
            const workspace = await loadAPIWorkspace({
                absolutePathToWorkspace: join(
                    AbsoluteFilePath.of(__dirname),
                    RelativeFilePath.of("fixtures/invalid-human-example-test")
                ),
                context,
                cliVersion: "0.0.0",
                workspaceName: "invalid-human-example-test"
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
                generateV1Examples: true,
                logWarnings: true
            });

            console.log("=== HUMAN EXAMPLE VALIDATION TEST ===");

            const services = Object.values(intermediateRepresentation.services);
            const service = services[0];

            if (service && typeof service === "object" && "endpoints" in service) {
                // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
                const serviceWithEndpoints = service as { endpoints?: Array<any> };
                const endpoint = serviceWithEndpoints.endpoints?.[0];
                // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
                const endpointAny = endpoint as any;

                // Check if the invalid human example made it through
                const hasV2HumanExamples =
                    endpointAny?.v2Examples?.userSpecifiedExamples &&
                    Object.keys(endpointAny.v2Examples.userSpecifiedExamples).length > 0;

                console.log(`Human examples present: ${hasV2HumanExamples}`);

                if (hasV2HumanExamples) {
                    // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
                    const humanExample = Object.values(endpointAny.v2Examples.userSpecifiedExamples)[0] as any;
                    const responseBody = humanExample?.response?.body?.value;

                    console.log("Human example response body:", JSON.stringify(responseBody, null, 2));

                    // Check if invalid properties were preserved or filtered out
                    const hasInvalidProperties =
                        responseBody?.invalidProperty !== undefined || responseBody?.anotherBadField !== undefined;

                    console.log(`Invalid properties preserved: ${hasInvalidProperties}`);

                    if (hasInvalidProperties) {
                        console.log("🚨 Fern does NOT validate human examples against schema!");
                        console.log("   Invalid properties are preserved in the IR");
                    } else {
                        console.log("✅ Fern validates and filters human examples against schema");
                    }
                } else {
                    console.log("❓ No human examples found - may have been filtered entirely");
                }
            }

            console.log("=== END VALIDATION TEST ===");
        } catch (error) {
            console.log("🚨 Loading failed - validation may have caught invalid examples:");
            console.log(error);

            // If loading failed, it might be due to validation
            expect(error).toBeDefined();
        }
    });

    it("should handle OpenAPI with webhook responses", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/webhook-openapi-responses")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "webhook-openapi-responses"
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

        expect(intermediateRepresentation.webhookGroups).toBeDefined();
        expect(Object.keys(intermediateRepresentation.webhookGroups).length).toBeGreaterThan(0);

        expect(fdrApiDefinition.types).toBeDefined();
        expect(fdrApiDefinition.rootPackage).toBeDefined();

        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/webhook-openapi-responses-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/webhook-openapi-responses-ir.snap");
    });

    it("should handle OpenAPI with webhook multipart form data payloads", async () => {
        // This test captures current parser behavior with multipart/form-data webhooks.
        // When multipart support is added, the snapshots will change to show proper parsing.
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/webhook-multipart-form-data")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "webhook-multipart-form-data"
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

        // Validate basic IR structure (webhooks with multipart/form-data may not parse yet)
        expect(intermediateRepresentation).toBeDefined();
        expect(intermediateRepresentation.webhookGroups).toBeDefined();
        // Note: webhookGroups may be empty if multipart/form-data isn't supported yet

        // Validate FDR output structure
        expect(fdrApiDefinition.types).toBeDefined();
        expect(fdrApiDefinition.rootPackage).toBeDefined();

        // Snapshot the output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/webhook-multipart-form-data-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot(
            "__snapshots__/webhook-multipart-form-data-ir.snap"
        );
    });

    it("should handle OpenAPI with nullable balance_max in tiered rates", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/balance-max-null")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "balance-max-null"
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

        // Validate that the RateTier type with nullable balance_max was processed
        expect(intermediateRepresentation.types).toBeDefined();
        expect(fdrApiDefinition.types).toBeDefined();

        // Check that RateTier type exists and has the expected structure
        const rateTierType = Object.values(intermediateRepresentation.types).find(
            (type) => type.name.name.originalName === "RateTier"
        );
        expect(rateTierType).toBeDefined();

        // Verify the endpoint example preserves null value for balance_max
        const endpoint = fdrApiDefinition.rootPackage?.endpoints?.find((e) => e.id === "getRates");
        expect(endpoint).toBeDefined();
        expect(endpoint?.examples).toBeDefined();
        expect(endpoint?.examples?.length).toBeGreaterThan(0);

        // Get the tiers from the example response
        const example = endpoint?.examples?.[0];
        const responseBody = example?.responseBody as unknown as Record<string, unknown> | undefined;
        const fixedRate = responseBody?.fixed_rate as { tiers: Array<{ balance_max: string | null }> } | undefined;
        const tiers = fixedRate?.tiers;
        expect(Array.isArray(tiers)).toBe(true);
        expect(tiers).toHaveLength(3);

        // Critical regression test: the third tier's balance_max must be null, not a string value
        expect(tiers?.[0]?.balance_max).toBe("100000000");
        expect(tiers?.[1]?.balance_max).toBe("500000000");
        expect(tiers?.[2]?.balance_max).toBeNull();

        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/balance-max-null-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/balance-max-null-ir.snap");
    });

    it("should preserve human-generated examples when ai-examples is enabled - OpenAPI example format", async () => {
        // Test case to verify that human-generated examples specified in OpenAPI spec
        // are NOT overwritten when ai-examples: true is set in docs.yml
        // This tests the scenario where:
        // 1. OpenAPI spec has human examples using the `example` field format
        // 2. docs.yml has `ai-examples: true` in experimental
        // 3. The human example should be preserved and not replaced by AI-generated content
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/human-examples-preserved")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "human-examples-preserved"
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
            generateV1Examples: true,
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

        // Validate the human examples are preserved
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        const service = services[0];
        expect(service).toBeDefined();

        if (service && typeof service === "object" && "endpoints" in service) {
            // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
            const serviceWithEndpoints = service as { endpoints?: Array<any> };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            expect(serviceWithEndpoints.endpoints?.length).toBe(2); // POST /products and GET /products/{productId}

            console.log("=== HUMAN EXAMPLES PRESERVATION TEST ===");

            // Find the POST /products endpoint which has human examples
            const createProductEndpoint = serviceWithEndpoints.endpoints?.find(
                // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
                (ep: any) => ep?.method === "POST"
            );
            expect(createProductEndpoint).toBeDefined();

            // biome-ignore lint/suspicious/noExplicitAny: test code accessing dynamic IR properties
            const endpointAny = createProductEndpoint as any;

            // Check for human examples (from OpenAPI spec's example field)
            const hasV2HumanExamples =
                endpointAny?.v2Examples?.userSpecifiedExamples &&
                Object.keys(endpointAny.v2Examples.userSpecifiedExamples).length > 0;

            console.log(`Human examples present: ${hasV2HumanExamples}`);

            // CRITICAL: Verify the human example values are preserved
            if (hasV2HumanExamples && endpointAny.v2Examples?.userSpecifiedExamples) {
                const humanExampleKeys = Object.keys(endpointAny.v2Examples.userSpecifiedExamples);
                console.log(`Human example keys: ${humanExampleKeys.join(", ")}`);

                // Check that the specific human-provided values are preserved
                const firstKey = humanExampleKeys[0];
                const humanExample = firstKey ? endpointAny.v2Examples.userSpecifiedExamples[firstKey] : undefined;

                // Verify the human example contains our specific values
                // These are the values from the OpenAPI spec that should NOT be overwritten
                const requestBody = humanExample?.request?.body?.value;
                const responseBody = humanExample?.response?.body?.value;

                console.log("Request body:", JSON.stringify(requestBody, null, 2));
                console.log("Response body:", JSON.stringify(responseBody, null, 2));

                // The human example should have the specific title we provided
                if (requestBody?.title) {
                    expect(requestBody.title).toBe("supersonic flux capacitor Headphones");
                    console.log("Human example title preserved: supersonic flux capacitor Headphones");
                }

                // The human example should have the specific price we provided
                if (requestBody?.price) {
                    expect(requestBody.price).toBe(79.99);
                    console.log("Human example price preserved: 79.99");
                }

                // The human example should have the specific ID we provided
                if (requestBody?.id) {
                    expect(requestBody.id).toBe("a3f1c9e2-4b7d-4f8a-9c2e-1d2b3f4a5c6d");
                    console.log("Human example ID preserved: a3f1c9e2-4b7d-4f8a-9c2e-1d2b3f4a5c6d");
                }

                // The human example should have the specific inStock value we provided
                if (requestBody?.inStock !== undefined) {
                    expect(requestBody.inStock).toBe(false);
                    console.log("Human example inStock preserved: false");
                }
            }

            // Verify that the endpoint with human examples should NOT be processed for AI enhancement
            const hasAutogenerated = (endpointAny?.autogeneratedExamples?.length || 0) > 0;
            const shouldBeProcessedByAI = hasAutogenerated && !hasV2HumanExamples;
            console.log(`Should be AI enhanced: ${shouldBeProcessedByAI}`);

            // With human examples present, this endpoint should NOT be processed for AI enhancement
            if (hasV2HumanExamples) {
                expect(shouldBeProcessedByAI).toBe(false);
                console.log("Human examples correctly prevent AI enhancement");
            }

            console.log("=== END HUMAN EXAMPLES PRESERVATION TEST ===");
        }

        // Validate FDR structure - endpoints may be in subpackages due to tags
        expect(fdrApiDefinition.rootPackage).toBeDefined();
        expect(fdrApiDefinition.subpackages).toBeDefined();

        // Count total endpoints across all packages
        let totalEndpoints = fdrApiDefinition.rootPackage.endpoints.length;
        for (const subpackage of Object.values(fdrApiDefinition.subpackages)) {
            totalEndpoints += subpackage.endpoints.length;
        }
        expect(totalEndpoints).toBe(2);

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/human-examples-preserved-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/human-examples-preserved-ir.snap");
    });

    it("should handle OpenAPI with explode parameter settings", async () => {
        // Test OpenAPI spec with various explode parameter configurations
        // Tests smart default logic: form style defaults to explode=true, others default to explode=false
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/explode-parameter-test")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "explode-parameter-test"
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

        // Validate services and endpoints were parsed
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        // Validate that path and query parameters exist
        const service = services[0];
        expect(service).toBeDefined();
        if (service && typeof service === "object" && "endpoints" in service) {
            const serviceWithEndpoints = service as {
                endpoints?: Array<{
                    pathParameters?: Array<{ name: { originalName: string }; explode?: boolean }>;
                    queryParameters?: Array<{ name: { name: { originalName: string } }; explode?: boolean }>;
                }>;
            };
            expect(serviceWithEndpoints.endpoints).toBeDefined();
            expect(serviceWithEndpoints.endpoints?.length).toBeGreaterThan(0);

            // Check that explode field is present on parameters where it differs from default
            // The smart default logic should:
            // - Omit explode for form style when explode=true (default)
            // - Preserve explode for form style when explode=false (non-default)
            // - Omit explode for other styles when explode=false (default)
            // - Preserve explode for other styles when explode=true (non-default)
        }

        // Validate FDR structure
        expect(fdrApiDefinition.rootPackage).toBeDefined();

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/explode-parameter-test-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/explode-parameter-test-ir.snap");
    });

    it("should handle OpenAPI with response examples for different status codes", async () => {
        // Test OpenAPI spec with response examples for different status codes (200, 400, 404, 405, 500)
        // This validates that response examples are correctly associated with their status code schemas
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/response-status-code-examples")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "response-status-code-examples"
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

        // Validate services and endpoints were parsed
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        // Validate that error types were created for different status codes
        expect(intermediateRepresentation.errors).toBeDefined();

        // Validate FDR structure
        expect(fdrApiDefinition.rootPackage).toBeDefined();
        expect(fdrApiDefinition.types).toBeDefined();

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/response-status-code-examples-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot(
            "__snapshots__/response-status-code-examples-ir.snap"
        );
    });

    it("should handle OpenAPI with $ref property containing examples", async () => {
        // Test OpenAPI spec with a property that uses $ref and has examples at the property level
        // This validates that examples on $ref properties are correctly processed
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/company-file-ref-examples")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "company-file-ref-examples"
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

        // Validate types were parsed correctly
        expect(intermediateRepresentation.types).toBeDefined();
        expect(fdrApiDefinition.types).toBeDefined();

        // Validate services and endpoints were parsed
        expect(intermediateRepresentation.services).toBeDefined();
        const services = Object.values(intermediateRepresentation.services);
        expect(services.length).toBeGreaterThan(0);

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/company-file-ref-examples-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/company-file-ref-examples-ir.snap");
    });

    it("should populate examples with the first available auth scheme from endpoint security", async () => {
        // Bug reproduction test: When an endpoint has multiple auth options (e.g., admin OR operator),
        // the generated examples should use the first available auth scheme from the endpoint's
        // security requirements (admin), not the first globally defined auth scheme or an incorrect scheme.
        // See: https://app.devin.ai/sessions/9cf9fa77087045cda6bbf83fa5859f52
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/auth-scheme-example-selection")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "auth-scheme-example-selection"
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
        // Should have 3 security schemes: user, operator, admin
        expect(intermediateRepresentation.auth.schemes.length).toBe(3);

        // Validate FDR auth schemes
        expect(fdrApiDefinition.authSchemes).toBeDefined();
        expect(Object.keys(fdrApiDefinition.authSchemes ?? {}).length).toBe(3);

        // Validate that the endpoint has the correct multiAuth configuration
        // The endpoint security is: [{"admin": []}, {"operator": []}]
        // So multiAuth should show admin as the first option
        expect(fdrApiDefinition.rootPackage?.endpoints).toBeDefined();
        const endpoint = fdrApiDefinition.rootPackage?.endpoints?.[0];
        expect(endpoint).toBeDefined();
        expect(endpoint?.multiAuth).toBeDefined();
        expect(endpoint?.multiAuth?.length).toBe(2);
        // First auth option should be admin
        expect(endpoint?.multiAuth?.[0]?.schemes).toContain("admin");
        // Second auth option should be operator
        expect(endpoint?.multiAuth?.[1]?.schemes).toContain("operator");

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/auth-scheme-example-selection-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot(
            "__snapshots__/auth-scheme-example-selection-ir.snap"
        );
    });

    it("should handle OpenAPI with min/max validation keywords", async () => {
        // Test OpenAPI spec with min/max validation keywords:
        // - minimum, maximum, exclusiveMinimum, exclusiveMaximum for numbers
        // - minLength, maxLength for strings
        // - minItems, maxItems for arrays
        // - minProperties, maxProperties for objects
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/min-max-values")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "min-max-values"
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

        // Validate types were processed correctly
        expect(intermediateRepresentation.types).toBeDefined();
        expect(Object.keys(intermediateRepresentation.types).length).toBeGreaterThan(0);

        // Validate FDR structure
        expect(fdrApiDefinition.types).toBeDefined();
        expect(fdrApiDefinition.rootPackage?.endpoints).toBeDefined();

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/min-max-values-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/min-max-values-ir.snap");
    });

    it("should preserve schema-level examples from OpenAPI", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/schema-level-examples")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: "schema-level-examples"
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

        // Validate types were processed correctly
        expect(intermediateRepresentation.types).toBeDefined();
        expect(Object.keys(intermediateRepresentation.types).length).toBeGreaterThan(0);

        // Check that schema-level examples are preserved in IR
        const wordType = Object.values(intermediateRepresentation.types).find(
            (type) => type.name.name.originalName === "ForcedAlignmentWordResponseModel"
        );
        expect(wordType).toBeDefined();

        // Check if v2Examples contains the schema-level example
        if (wordType?.v2Examples) {
            const userExamples = wordType.v2Examples.userSpecifiedExamples;
            const autoExamples = wordType.v2Examples.autogeneratedExamples;
            const hasSchemaExample = Object.keys(userExamples).length > 0 || Object.keys(autoExamples).length > 0;
            // This test documents the current behavior - schema-level examples should be preserved
            expect(hasSchemaExample).toBe(true);
        }

        // Validate FDR structure
        expect(fdrApiDefinition.types).toBeDefined();
        expect(fdrApiDefinition.rootPackage?.endpoints).toBeDefined();

        // Snapshot the complete output for regression testing
        await expect(fdrApiDefinition).toMatchFileSnapshot("__snapshots__/schema-level-examples-fdr.snap");
        await expect(intermediateRepresentation).toMatchFileSnapshot("__snapshots__/schema-level-examples-ir.snap");
    });
});
