import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { createMockTaskContext } from "@fern-api/task-context";
import { beforeEach, describe, expect, it } from "vitest";
import { migrateIntermediateRepresentationForGenerator } from "../migrateIntermediateRepresentationForGenerator";
import { getIrForApi } from "./utils/getIrForApi";

describe("FDR-enhanced IR migration", () => {
    let simpleApiIr: IntermediateRepresentation;
    let mockTaskContext: ReturnType<typeof createMockTaskContext>;

    beforeEach(async () => {
        simpleApiIr = await getIrForSimpleApi();
        mockTaskContext = createMockTaskContext();
    });

    describe("FDR integration tests", () => {
        it("should successfully migrate using actual FDR service for Python SDK", async () => {
            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator: {
                    name: "fernapi/fern-python-sdk",
                    version: "2.0.0"
                }
            });

            // Should return migrated IR
            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
        }, 30000); // Increase timeout for network requests

        it("should successfully migrate using actual FDR service for TypeScript SDK", async () => {
            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator: {
                    name: "fernapi/fern-typescript-sdk",
                    version: "0.0.245"
                }
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
        }, 30000);

        it("should handle generators not in FDR and fall back to hardcoded logic", async () => {
            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator: {
                    name: "custom/nonexistent-generator",
                    version: "1.0.0"
                }
            });

            // Should fall back to hardcoded logic and still return a result
            expect(result).toBeDefined();

            // Check that debug log was called for fallback
            expect(mockTaskContext.logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("FDR-based migration failed, falling back to hardcoded logic")
            );
        }, 30000);

        it("should successfully migrate for Java SDK", async () => {
            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator: {
                    name: "fernapi/fern-java-sdk",
                    version: "1.5.0"
                }
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
        }, 30000);

        it("should successfully migrate for Go SDK", async () => {
            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator: {
                    name: "fernapi/fern-go-sdk",
                    version: "1.0.0"
                }
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
        }, 30000);

        it("should handle very old TypeScript SDK version", async () => {
            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator: {
                    name: "fernapi/fern-typescript-sdk",
                    version: "0.0.1"
                }
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
        }, 30000);

        it("should handle newer Python SDK version", async () => {
            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator: {
                    name: "fernapi/fern-python-sdk",
                    version: "3.0.0"
                }
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
        }, 30000);
    });
});

function getIrForSimpleApi(): Promise<IntermediateRepresentation> {
    return getIrForApi(join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple")));
}
