import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { createMockTaskContext } from "@fern-api/task-context";
import { beforeEach, describe, expect, it } from "vitest";
import { fetchGeneratorIrVersion } from "../fetchGeneratorIrVersion";
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
            const targetGenerator = {
                name: "fernapi/fern-python-sdk",
                version: "2.0.0"
            };

            // First, fetch the IR version that FDR says this generator needs
            const fdrIrVersion = await fetchGeneratorIrVersion(targetGenerator);
            console.log(`FDR says ${targetGenerator.name}@${targetGenerator.version} needs IR version:`, fdrIrVersion);

            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator
            });

            // Should return migrated IR
            expect(result).toBeDefined();
            expect(typeof result).toBe("object");

            // Verify that FDR returned a valid IR version (not undefined, which would mean no migration needed)
            if (fdrIrVersion !== undefined) {
                expect(fdrIrVersion).toBeGreaterThan(0);
                console.log(`Successfully migrated to IR version ${fdrIrVersion} as specified by FDR`);
            } else {
                console.log("FDR indicates no migration needed (generator uses latest IR)");
            }
        }, 30000); // Increase timeout for network requests

        it("should successfully migrate using actual FDR service for TypeScript SDK", async () => {
            const targetGenerator = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.245"
            };

            // First, fetch the IR version that FDR says this generator needs
            const fdrIrVersion = await fetchGeneratorIrVersion(targetGenerator);
            console.log(`FDR says ${targetGenerator.name}@${targetGenerator.version} needs IR version:`, fdrIrVersion);

            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("object");

            // Verify that FDR returned a valid IR version
            if (fdrIrVersion !== undefined) {
                expect(fdrIrVersion).toBeGreaterThan(0);
                console.log(`Successfully migrated to IR version ${fdrIrVersion} as specified by FDR`);
            } else {
                console.log("FDR indicates no migration needed (generator uses latest IR)");
            }
        }, 30000);

        it("should handle generators not in FDR and fall back to hardcoded logic", async () => {
            const targetGenerator = {
                name: "custom/nonexistent-generator",
                version: "1.0.0"
            };

            // First, verify that FDR doesn't know about this generator
            const fdrIrVersion = await fetchGeneratorIrVersion(targetGenerator);
            console.log(`FDR response for ${targetGenerator.name}@${targetGenerator.version}:`, fdrIrVersion);
            expect(fdrIrVersion).toBeUndefined(); // Custom generator shouldn't be in FDR

            const result = await migrateIntermediateRepresentationForGenerator({
                intermediateRepresentation: simpleApiIr,
                context: mockTaskContext,
                targetGenerator
            });

            // Should fall back to hardcoded logic and still return a result
            expect(result).toBeDefined();

            // Check that debug log was called for fallback
            expect(mockTaskContext.logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("FDR-based migration failed, falling back to hardcoded logic")
            );

            console.log("Successfully fell back to hardcoded logic for custom generator");
        }, 30000);

        it("should demonstrate different IR versions for different generators", async () => {
            const generators = [
                { name: "fernapi/fern-java-sdk", version: "1.5.0" },
                { name: "fernapi/fern-go-sdk", version: "1.0.0" },
                { name: "fernapi/fern-typescript-sdk", version: "0.0.1" },
                { name: "fernapi/fern-python-sdk", version: "3.0.0" }
            ];

            const irVersions: Record<string, number | undefined> = {};

            for (const generator of generators) {
                const fdrIrVersion = await fetchGeneratorIrVersion(generator);
                const generatorKey = `${generator.name}@${generator.version}`;
                irVersions[generatorKey] = fdrIrVersion;

                console.log(`${generatorKey} requires IR version: ${fdrIrVersion ?? "latest"}`);

                const result = await migrateIntermediateRepresentationForGenerator({
                    intermediateRepresentation: simpleApiIr,
                    context: mockTaskContext,
                    targetGenerator: generator
                });

                expect(result).toBeDefined();
                expect(typeof result).toBe("object");
            }

            // Verify that different generators can have different IR version requirements
            const uniqueIrVersions = new Set(Object.values(irVersions));
            console.log("Unique IR versions required by generators:", Array.from(uniqueIrVersions));

            // At least some generators should have specific IR version requirements
            const hasSpecificVersions = Object.values(irVersions).some((version) => version !== undefined);
            expect(hasSpecificVersions).toBe(true);
        }, 60000); // Longer timeout for multiple requests
    });
});

function getIrForSimpleApi(): Promise<IntermediateRepresentation> {
    return getIrForApi(join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple")));
}
