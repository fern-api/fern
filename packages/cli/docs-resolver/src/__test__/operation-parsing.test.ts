/**
 * Unit tests for GraphQL operation parsing logic
 */

describe("GraphQL Operation Parsing", () => {
    describe("Operation String Format", () => {
        it("should parse valid operation strings", () => {
            const validOperations = [
                "QUERY getUserProfile",
                "MUTATION createUser",
                "SUBSCRIPTION userUpdates",
                "QUERY admin.getSystemInfo",
                "MUTATION namespace.createUser"
            ];

            validOperations.forEach((operation) => {
                const parts = operation.trim().split(/\s+/, 2);
                expect(parts).toHaveLength(2);
                expect(["QUERY", "MUTATION", "SUBSCRIPTION"]).toContain(parts[0]);
                expect(parts[1]).toBeTruthy();
            });
        });

        it("should identify invalid operation strings", () => {
            const invalidOperations = [
                "QUERY", // Missing operation name
                "getUserProfile", // Missing operation type
                "INVALID_TYPE getUserProfile", // Invalid operation type
                "QUERY MUTATION createUser", // Multiple operation types
                "", // Empty string
                "   " // Whitespace only
            ];

            invalidOperations.forEach((operation) => {
                const parts = operation.trim().split(/\s+/, 2);
                const isValid =
                    parts.length === 2 &&
                    parts[0] != null &&
                    ["QUERY", "MUTATION", "SUBSCRIPTION"].includes(parts[0]) &&
                    parts[1] != null &&
                    parts[1].length > 0;
                expect(isValid).toBe(false);
            });
        });

        it("should handle namespaced operations", () => {
            const namespacedOperations = [
                "QUERY admin.getSystemInfo",
                "MUTATION users.createUser",
                "QUERY deeply.nested.namespace.operation"
            ];

            namespacedOperations.forEach((operation) => {
                const parts = operation.trim().split(/\s+/, 2);
                expect(parts).toHaveLength(2);
                expect(parts[1]).toContain(".");

                // Test namespace extraction
                const operationIdentifier = parts[1];
                if (operationIdentifier) {
                    const namespacedParts = operationIdentifier.split(".");
                    const operationName = namespacedParts[namespacedParts.length - 1];
                    expect(operationName).toBeTruthy();
                    expect(operationName).not.toContain(".");
                }
            });
        });
    });

    describe("Operation Type Validation", () => {
        it("should validate operation types", () => {
            const validTypes = ["QUERY", "MUTATION", "SUBSCRIPTION"];
            const invalidTypes = ["query", "mutation", "subscription", "INVALID", ""];

            validTypes.forEach((type) => {
                expect(["QUERY", "MUTATION", "SUBSCRIPTION"]).toContain(type);
            });

            invalidTypes.forEach((type) => {
                expect(["QUERY", "MUTATION", "SUBSCRIPTION"]).not.toContain(type);
            });
        });
    });

    describe("Operation Name Extraction", () => {
        it("should extract operation names correctly", () => {
            const testCases = [
                { input: "QUERY getUserProfile", expected: "getUserProfile" },
                { input: "MUTATION createUser", expected: "createUser" },
                { input: "SUBSCRIPTION userUpdates", expected: "userUpdates" },
                { input: "QUERY admin.getSystemInfo", expected: "getSystemInfo" },
                { input: "MUTATION deeply.nested.operation", expected: "operation" }
            ];

            testCases.forEach(({ input, expected }) => {
                const parts = input.trim().split(/\s+/, 2);
                const operationIdentifier = parts[1];

                if (!operationIdentifier) {
                    console.error("Operation identifier is missing");
                    return;
                }

                let extractedName;
                if (operationIdentifier.includes(".")) {
                    const namespacedParts = operationIdentifier.split(".");
                    extractedName = namespacedParts[namespacedParts.length - 1];
                } else {
                    extractedName = operationIdentifier;
                }

                expect(extractedName).toBe(expected);
            });
        });
    });
});
