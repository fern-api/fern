/**
 * OpenAPI v3 Parser Pipeline Tests (--from-openapi flag functionality)
 *
 * This test validates the OpenAPI processing pipeline without requiring CLI compilation.
 * It directly tests the core functions that the --from-openapi flag uses internally.
 *
 */

import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { convertIrToFdrApi } from "@fern-api/register";
import { createMockTaskContext } from "@fern-api/task-context";
import assert from "assert";

import { loadAPIWorkspace } from "../loadAPIWorkspace";

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
            generateV1Examples: false
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
            expect((service as any).endpoints).toBeDefined();
            expect(Object.keys((service as any).endpoints ?? {})).toHaveLength(3); // /health, /users/{userId}, /users POST
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
            generateV1Examples: false
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
            generateV1Examples: false
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
        expect(["union", "undiscriminatedUnion"]).toContain(eventRequestType?.shape.type);

        // Validate FDR structure for union types
        expect(fdrApiDefinition.types).toBeDefined();
        const fdrEventRequestType = Object.values(fdrApiDefinition.types).find(
            (type: any) => type.name === "EventRequest"
        );
        expect(fdrEventRequestType).toBeDefined();
        // FDR structure should also have union-like shape
        expect(["union", "undiscriminatedUnion"]).toContain((fdrEventRequestType as any)?.shape?.type);

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
});
