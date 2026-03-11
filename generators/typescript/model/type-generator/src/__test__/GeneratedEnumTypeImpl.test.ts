import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { casingsGenerator, createNameAndWireValue } from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";

import { GeneratedEnumTypeImpl } from "../enum/GeneratedEnumTypeImpl.js";

/**
 * Creates a minimal mock BaseContext.
 * The enum generator only uses context for getDocs (via buildExample),
 * which is skipped when examples array is empty.
 */
function createMockBaseContext() {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");
    return {
        sourceFile,
        // biome-ignore lint/suspicious/noEmptyBlockStatements: test mock with no-op logger
        logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        externalDependencies: {},
        coreUtilities: {},
        fernConstants: {},
        type: {},
        typeSchema: {},
        includeSerdeLayer: false,
        jsonContext: {}
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

/**
 * Creates a FernFilepath for test use.
 */
function createFernFilepath(): FernIr.FernFilepath {
    return {
        allParts: [casingsGenerator.generateName("plants")],
        packagePath: [casingsGenerator.generateName("plants")],
        file: casingsGenerator.generateName("types")
    };
}

/**
 * Creates an EnumValue IR object.
 */
function createEnumValue(name: string, opts?: { wireValue?: string; docs?: string }): FernIr.EnumValue {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        docs: opts?.docs,
        availability: undefined
    };
}

/**
 * Creates a GeneratedEnumTypeImpl with the given config.
 */
function createEnumGenerator(opts: {
    typeName: string;
    values: FernIr.EnumValue[];
    includeEnumUtils?: boolean;
    enableForwardCompatibleEnums?: boolean;
    retainOriginalCasing?: boolean;
    docs?: string;
    examples?: FernIr.ExampleType[];
    // biome-ignore lint/suspicious/noExplicitAny: test factory with generic type parameter
}): GeneratedEnumTypeImpl<any> {
    return new GeneratedEnumTypeImpl({
        typeName: opts.typeName,
        shape: { values: opts.values, default: undefined },
        examples: opts.examples ?? [],
        docs: opts.docs,
        fernFilepath: createFernFilepath(),
        getReferenceToSelf: () => ({
            getTypeNode: () => ts.factory.createTypeReferenceNode(opts.typeName),
            getExpression: () => ts.factory.createIdentifier(opts.typeName),
            getEntityName: () => ts.factory.createIdentifier(opts.typeName)
        }),
        includeSerdeLayer: false,
        noOptionalProperties: false,
        retainOriginalCasing: opts.retainOriginalCasing ?? false,
        enableInlineTypes: false,
        generateReadWriteOnlyTypes: false,
        includeEnumUtils: opts.includeEnumUtils ?? false,
        enableForwardCompatibleEnums: opts.enableForwardCompatibleEnums ?? false
    });
}

/**
 * Serializes generateStatements output by writing to a ts-morph SourceFile.
 */
// biome-ignore lint/suspicious/noExplicitAny: test utility with generic type parameter
function serializeStatements(generator: GeneratedEnumTypeImpl<any>): string {
    const context = createMockBaseContext();
    const statements = generator.generateStatements(context);
    context.sourceFile.addStatements(statements);
    return context.sourceFile.getFullText();
}

describe("GeneratedEnumTypeImpl", () => {
    describe("generateStatements", () => {
        it("generates basic enum without utils", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" }),
                    createEnumValue("Cactus", { wireValue: "cactus" })
                ]
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates enum with utils (visitor pattern)", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" }),
                    createEnumValue("Cactus", { wireValue: "cactus" })
                ],
                includeEnumUtils: true
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates forward-compatible enum (adds | string)", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ],
                enableForwardCompatibleEnums: true
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates forward-compatible enum with utils", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ],
                includeEnumUtils: true,
                enableForwardCompatibleEnums: true
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates enum with single value", () => {
            const generator = createEnumGenerator({
                typeName: "Sunlight",
                values: [createEnumValue("Full", { wireValue: "full" })]
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates enum with docs on values", () => {
            const generator = createEnumGenerator({
                typeName: "WaterFrequency",
                values: [
                    createEnumValue("Daily", { wireValue: "daily", docs: "Water once per day" }),
                    createEnumValue("Weekly", { wireValue: "weekly", docs: "Water once per week" }),
                    createEnumValue("Monthly", { wireValue: "monthly" })
                ]
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates enum with wire values differing from names", () => {
            const generator = createEnumGenerator({
                typeName: "SoilType",
                values: [
                    createEnumValue("WellDraining", { wireValue: "well-draining" }),
                    createEnumValue("MoistRetaining", { wireValue: "moist-retaining" }),
                    createEnumValue("Sandy", { wireValue: "SANDY" })
                ]
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        // retainOriginalCasing only affects object/union types, not enums.
        // Enum keys always use pascalCase.unsafeName via getEnumValueName().
        // This test documents that the flag has no effect on enum output.
        it("generates enum with retainOriginalCasing", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ],
                retainOriginalCasing: true
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates enum with top-level type docs", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ],
                docs: "Represents different types of plants."
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates enum with top-level docs and examples", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ],
                docs: "Represents different types of plants.",
                examples: [
                    {
                        name: undefined,
                        docs: undefined,
                        jsonExample: "succulent",
                        shape: FernIr.ExampleTypeShape.enum({
                            value: createNameAndWireValue("Succulent", "succulent")
                        })
                    }
                ]
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates enum with top-level docs and utils", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ],
                docs: "Represents different types of plants.",
                includeEnumUtils: true,
                examples: [
                    {
                        name: undefined,
                        docs: undefined,
                        jsonExample: "succulent",
                        shape: FernIr.ExampleTypeShape.enum({
                            value: createNameAndWireValue("Succulent", "succulent")
                        })
                    }
                ]
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });
    });

    describe("generateForInlineUnion", () => {
        it("generates inline union type for basic enum", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ]
            });

            const context = createMockBaseContext();
            const result = generator.generateForInlineUnion(context);
            const text = getTextOfTsNode(result.typeNode);
            expect(text).toMatchSnapshot();
            expect(result.requestTypeNode).toBeUndefined();
            expect(result.responseTypeNode).toBeUndefined();
        });

        it("generates inline union type with string for forward-compatible enum", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ],
                enableForwardCompatibleEnums: true
            });

            const context = createMockBaseContext();
            const result = generator.generateForInlineUnion(context);
            const text = getTextOfTsNode(result.typeNode);
            expect(text).toMatchSnapshot();
        });
    });

    describe("generateModule", () => {
        it("generates visitor interface module", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" }),
                    createEnumValue("Cactus", { wireValue: "cactus" })
                ],
                includeEnumUtils: true
            });

            const context = createMockBaseContext();
            const moduleDecl = generator.generateModule();
            assert(moduleDecl != null, "expected generateModule to return a module declaration");
            context.sourceFile.addModule(moduleDecl);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });

    describe("buildExample", () => {
        it("builds example for type declaration comment", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ]
            });

            const context = createMockBaseContext();
            const example: FernIr.ExampleTypeShape = FernIr.ExampleTypeShape.enum({
                value: createNameAndWireValue("Succulent", "succulent")
            });
            const result = generator.buildExample(example, context, {
                isForComment: true,
                isForTypeDeclarationComment: true
            });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds example as string literal when not for type declaration", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ]
            });

            const context = createMockBaseContext();
            const example: FernIr.ExampleTypeShape = FernIr.ExampleTypeShape.enum({
                value: createNameAndWireValue("Succulent", "succulent")
            });
            const result = generator.buildExample(example, context, {
                isForComment: false,
                isForTypeDeclarationComment: false
            });
            expect(getTextOfTsNode(result)).toBe('"succulent"');
        });

        it("falls back to first value when wire value does not match", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [
                    createEnumValue("Succulent", { wireValue: "succulent" }),
                    createEnumValue("Fern", { wireValue: "fern" })
                ]
            });

            const context = createMockBaseContext();
            const example: FernIr.ExampleTypeShape = FernIr.ExampleTypeShape.enum({
                value: createNameAndWireValue("Nonexistent", "nonexistent")
            });
            const result = generator.buildExample(example, context, {
                isForComment: true,
                isForTypeDeclarationComment: true
            });
            // Falls back to first value "Succulent"
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("throws for non-enum example shape", () => {
            const generator = createEnumGenerator({
                typeName: "PlantType",
                values: [createEnumValue("Succulent", { wireValue: "succulent" })]
            });

            const context = createMockBaseContext();
            const example: FernIr.ExampleTypeShape = FernIr.ExampleTypeShape.object({
                properties: [],
                extraProperties: undefined
            });
            expect(() => generator.buildExample(example, context, { isForComment: true })).toThrow(
                "Example is not for an enum"
            );
        });
    });
});
