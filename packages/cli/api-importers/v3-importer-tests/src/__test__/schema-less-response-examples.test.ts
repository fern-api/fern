import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

async function getIRForFixture(fixtureName: string) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenAPI fixture ${fixtureName}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${fixtureName}`);
    }
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: true,
        logWarnings: false
    });
}

describe("schema-less response with examples", () => {
    it("should preserve response body examples when response has no schema", async () => {
        const ir = await getIRForFixture("schema-less-response-with-examples");

        const services = Object.values(ir.services);
        expect(services.length).toBeGreaterThan(0);

        const endpoint = services[0]?.endpoints[0];
        expect(endpoint).toBeDefined();

        const userExamples = endpoint?.v2Examples?.userSpecifiedExamples;
        expect(userExamples).toBeDefined();

        const exampleKeys = Object.keys(userExamples ?? {});
        expect(exampleKeys.length).toBe(2);

        // Verify examples are in the correct order (matching OpenAPI spec order)
        expect(exampleKeys[0]).toContain("Basic plant");
        expect(exampleKeys[1]).toContain("Rare tropical plant");

        // Verify displayNames are preserved from OpenAPI summary
        const firstKey = exampleKeys[0];
        const secondKey = exampleKeys[1];
        expect(firstKey).toBeDefined();
        expect(secondKey).toBeDefined();

        const firstExample = firstKey != null ? userExamples?.[firstKey] : undefined;
        const secondExample = secondKey != null ? userExamples?.[secondKey] : undefined;
        expect(firstExample?.displayName).toBe("Basic plant");
        expect(secondExample?.displayName).toBe("Rare tropical plant");

        // Verify response bodies are present (not empty)
        expect(firstExample?.response?.body).toBeDefined();
        expect(firstExample?.response?.body?.type).toBe("json");
        if (firstExample?.response?.body?.type === "json") {
            const value = firstExample.response.body.value as Record<string, unknown>;
            expect(value).toHaveProperty("id", "plant_001");
            expect(value).toHaveProperty("name", "Monstera Deliciosa");
            expect(value).toHaveProperty("status", "healthy");
        }

        expect(secondExample?.response?.body).toBeDefined();
        expect(secondExample?.response?.body?.type).toBe("json");
        if (secondExample?.response?.body?.type === "json") {
            const value = secondExample.response.body.value as Record<string, unknown>;
            expect(value).toHaveProperty("id", "plant_002");
            expect(value).toHaveProperty("name", "Pink Princess Philodendron");
            expect(value).toHaveProperty("status", "healthy");
        }
    }, 90_000);

    it("should handle response with no JSON content types gracefully", async () => {
        const ir = await getIRForFixture("schema-less-response-no-json-content");

        const services = Object.values(ir.services);
        expect(services.length).toBeGreaterThan(0);

        const endpoint = services[0]?.endpoints[0];
        expect(endpoint).toBeDefined();

        // When there are no JSON content types, the synthetic fallback should still work
        // but originalJsonMediaTypeObject will be undefined, so no examples are carried over
        const userExamples = endpoint?.v2Examples?.userSpecifiedExamples ?? {};
        const exampleKeys = Object.keys(userExamples);

        // Request-only examples should still be present from the request body
        for (const key of exampleKeys) {
            const example = userExamples[key];
            expect(example?.request).toBeDefined();
        }
    }, 90_000);

    it("should not carry over non-JSON examples into JSON response fallback", async () => {
        const ir = await getIRForFixture("non-json-examples-with-json-fallback");

        const services = Object.values(ir.services);
        expect(services.length).toBeGreaterThan(0);

        const endpoint = services[0]?.endpoints[0];
        expect(endpoint).toBeDefined();

        // The non-JSON content type has examples but JSON doesn't.
        // The fix only looks at jsonContentTypes for examples to preserve,
        // so the non-JSON examples should NOT leak into the JSON fallback response.
        const userExamples = endpoint?.v2Examples?.userSpecifiedExamples ?? {};
        const exampleKeys = Object.keys(userExamples);

        for (const key of exampleKeys) {
            const example = userExamples[key];
            // Response body should be the synthetic empty object, not the XML examples
            if (example?.response?.body?.type === "json") {
                const value = example.response.body.value as Record<string, unknown>;
                // Should NOT contain the XML example data
                expect(value).not.toHaveProperty("xmlData");
            }
        }
    }, 90_000);
});
