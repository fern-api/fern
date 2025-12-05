import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { Reference } from "../../referencing";
import { PassthroughFormat } from "../formats/PassthroughFormat";
import { ZodFormat } from "../formats/ZodFormat";
import { ZurgFormat } from "../formats/ZurgFormat";
import { SerializationPipeline } from "../SerializationPipeline";

/**
 * Create a mock reference for testing
 */
function createMockReference(exportedName: string): Reference {
    return {
        getExpression: () => {
            return ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("serialization"),
                ts.factory.createIdentifier(exportedName)
            );
        },
        getTypeNode: () => {
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier("serialization"),
                    ts.factory.createIdentifier(exportedName)
                ),
                undefined
            );
        },
        getEntityName: () => {
            return ts.factory.createQualifiedName(
                ts.factory.createIdentifier("serialization"),
                ts.factory.createIdentifier(exportedName)
            );
        }
    };
}

describe("SerializationPipeline", () => {
    const baseConfig = {
        getReferenceToExport: ({ exportedName }: { manifest: any; exportedName: string }) =>
            createMockReference(exportedName),
        generateEndpointMetadata: false
    };

    describe("format creation", () => {
        it("creates ZurgFormat for 'default'", () => {
            const pipeline = new SerializationPipeline({
                ...baseConfig,
                format: "zurg"
            });

            expect(pipeline.getFormat()).toBeInstanceOf(ZurgFormat);
            expect(pipeline.getFormatType()).toBe("zurg");
            expect(pipeline.isEnabled()).toBe(true);
        });

        it("creates PassthroughFormat for 'none'", () => {
            const pipeline = new SerializationPipeline({
                ...baseConfig,
                format: "none"
            });

            expect(pipeline.getFormat()).toBeInstanceOf(PassthroughFormat);
            expect(pipeline.getFormatType()).toBe("none");
            expect(pipeline.isEnabled()).toBe(false);
        });

        it("creates ZodFormat for 'zod'", () => {
            const pipeline = new SerializationPipeline({
                ...baseConfig,
                format: "zod"
            });

            expect(pipeline.getFormat()).toBeInstanceOf(ZodFormat);
            expect(pipeline.getFormatType()).toBe("zod");
            expect(pipeline.isEnabled()).toBe(true);
        });
    });

    describe("resolveFormatType", () => {
        it("returns explicit serializationFormat when provided", () => {
            expect(
                SerializationPipeline.resolveFormatType({
                    serializationFormat: "zurg"
                })
            ).toBe("zurg");

            expect(
                SerializationPipeline.resolveFormatType({
                    serializationFormat: "none"
                })
            ).toBe("none");

            expect(
                SerializationPipeline.resolveFormatType({
                    serializationFormat: "zod"
                })
            ).toBe("zod");
        });

        it("returns 'none' when noSerdeLayer is true", () => {
            expect(
                SerializationPipeline.resolveFormatType({
                    noSerdeLayer: true
                })
            ).toBe("none");
        });

        it("returns 'default' when noSerdeLayer is false", () => {
            expect(
                SerializationPipeline.resolveFormatType({
                    noSerdeLayer: false
                })
            ).toBe("zurg");
        });

        it("returns 'default' when nothing is specified", () => {
            expect(SerializationPipeline.resolveFormatType({})).toBe("zurg");
        });

        it("serializationFormat takes precedence over noSerdeLayer", () => {
            // Even with noSerdeLayer: true, explicit format wins
            expect(
                SerializationPipeline.resolveFormatType({
                    serializationFormat: "zurg",
                    noSerdeLayer: true
                })
            ).toBe("zurg");

            // And vice versa
            expect(
                SerializationPipeline.resolveFormatType({
                    serializationFormat: "none",
                    noSerdeLayer: false
                })
            ).toBe("none");
        });
    });

    describe("runtime configuration", () => {
        it("ZurgFormat returns no npm dependencies", () => {
            const pipeline = new SerializationPipeline({
                ...baseConfig,
                format: "zurg"
            });

            expect(pipeline.getRuntimeDependencies()).toEqual({});
        });

        it("ZurgFormat returns file patterns for bundled runtime", () => {
            const pipeline = new SerializationPipeline({
                ...baseConfig,
                format: "zurg"
            });

            const patterns = pipeline.getRuntimeFilePatterns();
            expect(patterns).not.toBeNull();
            expect(patterns?.patterns).toContain("src/core/schemas/**");
        });

        it("PassthroughFormat returns no dependencies and no files", () => {
            const pipeline = new SerializationPipeline({
                ...baseConfig,
                format: "none"
            });

            expect(pipeline.getRuntimeDependencies()).toEqual({});
            expect(pipeline.getRuntimeFilePatterns()).toBeNull();
        });

        it("ZodFormat returns zod npm dependency and no files", () => {
            const pipeline = new SerializationPipeline({
                ...baseConfig,
                format: "zod"
            });

            const deps = pipeline.getRuntimeDependencies();
            expect(deps).toHaveProperty("zod");
            expect(pipeline.getRuntimeFilePatterns()).toBeNull();
        });
    });

    describe("schema generation through pipeline", () => {
        it("ZurgFormat generates valid schema expressions", () => {
            const pipeline = new SerializationPipeline({
                ...baseConfig,
                format: "zurg"
            });

            const format = pipeline.getFormat();
            const schema = format.object([{ key: { parsed: "name", raw: "name" }, value: format.string() }]);

            const expr = schema.toExpression();
            expect(expr).toBeDefined();

            // Verify it's a valid call expression
            expect(ts.isCallExpression(expr)).toBe(true);
        });

        it("PassthroughFormat generates no-op expressions", () => {
            const pipeline = new SerializationPipeline({
                ...baseConfig,
                format: "none"
            });

            const format = pipeline.getFormat();
            const schema = format.object([{ key: { parsed: "name", raw: "name" }, value: format.string() }]);

            const expr = schema.toExpression();
            expect(expr).toBeDefined();
            // PassthroughFormat returns identifier "undefined"
            expect(ts.isIdentifier(expr)).toBe(true);
        });
    });
});
