import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { SourceLocation } from "@fern-api/source";
import { describe, expect, it } from "vitest";
import type { Target } from "../sdk/config/Target.js";
import { GeneratorPipeline } from "../sdk/generator/GeneratorPipeline.js";
import { createMockTask } from "./utils/createMockTask.js";
import { createTestContext } from "./utils/createTestContext.js";

function makeSourceLocation(): SourceLocation {
    return new SourceLocation({
        absoluteFilePath: AbsoluteFilePath.of("/tmp/fern.yml"),
        relativeFilePath: RelativeFilePath.of("fern.yml"),
        line: 1,
        column: 1
    });
}

function makeTarget(overrides: Partial<Target>): Target {
    return {
        name: "test-target",
        api: "api",
        image: "fernapi/fern-typescript-sdk",
        registry: undefined,
        lang: "typescript",
        version: "1.0.0",
        sourceLocation: makeSourceLocation(),
        output: { path: "./out" },
        ...overrides
    };
}

describe("GeneratorPipeline", () => {
    describe("custom registry constraint", () => {
        it("rejects custom registry with remote generation", async () => {
            const context = await createTestContext({ cwd: AbsoluteFilePath.of("/tmp") });
            const pipeline = new GeneratorPipeline({ context, cliVersion: "0.0.0" });
            const task = createMockTask();

            const result = await pipeline.run({
                task,
                target: makeTarget({ registry: "ghcr.io/myorg" }),
                apiDefinition: { specs: [] },
                organization: "test",
                runtime: "remote"
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Custom image configurations are only supported with local generation");
            expect(result.error).toContain("test-target");
        });

        it("allows undefined registry with remote generation", async () => {
            const context = await createTestContext({ cwd: AbsoluteFilePath.of("/tmp") });
            const pipeline = new GeneratorPipeline({ context, cliVersion: "0.0.0" });
            const task = createMockTask();

            const result = await pipeline.run({
                task,
                target: makeTarget({ registry: undefined }),
                apiDefinition: { specs: [] },
                organization: "test",
                runtime: "remote"
            });

            // It will fail for other reasons (no real API definition), but NOT
            // because of the registry constraint
            if (!result.success) {
                expect(result.error).not.toContain("Custom image configurations are only supported");
            }
        });
    });

    describe("Docker image reference construction", () => {
        /**
         * Replicates the image reference logic from LegacyLocalGenerationRunner.runLocalGeneration()
         * (LegacyLocalGenerationRunner.ts:219-220) so we can test the string construction in isolation.
         */
        function buildContainerImage(target: Pick<Target, "registry" | "image" | "version">): string {
            const imageRef = target.registry ? `${target.registry}/${target.image}` : target.image;
            return `${imageRef}:${target.version}`;
        }

        it("prepends registry when provided", () => {
            expect(
                buildContainerImage({
                    registry: "ghcr.io/myorg",
                    image: "fern-typescript-sdk",
                    version: "1.0.0"
                })
            ).toBe("ghcr.io/myorg/fern-typescript-sdk:1.0.0");
        });

        it("omits registry prefix when undefined", () => {
            expect(
                buildContainerImage({
                    registry: undefined,
                    image: "fernapi/fern-typescript-sdk",
                    version: "2.3.4"
                })
            ).toBe("fernapi/fern-typescript-sdk:2.3.4");
        });

        it("handles localhost registry for local testing", () => {
            expect(
                buildContainerImage({
                    registry: "localhost:5000",
                    image: "my-generator",
                    version: "latest"
                })
            ).toBe("localhost:5000/my-generator:latest");
        });

        it("handles ECR-style registry URLs", () => {
            expect(
                buildContainerImage({
                    registry: "123456789.dkr.ecr.us-east-1.amazonaws.com",
                    image: "fern-python-sdk",
                    version: "0.5.0"
                })
            ).toBe("123456789.dkr.ecr.us-east-1.amazonaws.com/fern-python-sdk:0.5.0");
        });
    });
});
