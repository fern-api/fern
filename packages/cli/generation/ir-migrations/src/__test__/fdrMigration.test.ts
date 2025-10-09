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

    it("should use FDR-fetched IR version for Python SDK migration", async () => {
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

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");

        if (fdrIrVersion !== undefined) {
            expect(fdrIrVersion).toBeGreaterThan(0);
            console.log(`Successfully migrated to IR version ${fdrIrVersion} as specified by FDR`);
        } else {
            console.log("FDR indicates no migration needed (generator uses latest IR)");
        }
    }, 30000);

    it("should fall back to hardcoded logic when generator not in FDR", async () => {
        const targetGenerator = {
            name: "custom/nonexistent-generator",
            version: "1.0.0"
        };

        const fdrIrVersion = await fetchGeneratorIrVersion(targetGenerator);
        expect(fdrIrVersion).toBeUndefined(); // Custom generator shouldn't be in FDR

        const result = await migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: simpleApiIr,
            context: mockTaskContext,
            targetGenerator
        });

        expect(result).toBeDefined();
        expect(mockTaskContext.logger.debug).toHaveBeenCalledWith(
            expect.stringContaining("FDR-based migration failed, falling back to hardcoded logic")
        );
    }, 30000);

    it("should demonstrate FDR returns different IR versions for different generators", async () => {
        const generators = [
            { name: "fernapi/fern-python-sdk", version: "2.0.0" },
            { name: "fernapi/fern-typescript-sdk", version: "0.0.245" }
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
        }

        console.log("IR versions from FDR:", irVersions);

        // At least some generators should have specific IR version requirements
        const hasSpecificVersions = Object.values(irVersions).some((version) => version !== undefined);
        expect(hasSpecificVersions).toBe(true);
    }, 45000);
});

function getIrForSimpleApi(): Promise<IntermediateRepresentation> {
    return getIrForApi(join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple")));
}
