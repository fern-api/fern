import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";
import { CoreUtility } from "../../core-utilities/CoreUtility";
import { Reference } from "../../referencing";
import { ZurgFormat } from "../formats/ZurgFormat";

/**
 * Helper to print TypeScript AST to string for comparison
 */
function printNode(node: ts.Node): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const sourceFile = ts.createSourceFile("test.ts", "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

/**
 * Create a mock reference that simulates what the real system does.
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

/**
 * Create a ZurgFormat instance for testing
 */
function createZurgFormat(): ZurgFormat {
    return new ZurgFormat({
        getReferenceToExport: ({ exportedName }: { manifest: CoreUtility.Manifest; exportedName: string }) =>
            createMockReference(exportedName),
        generateEndpointMetadata: false
    });
}

describe("ZurgFormat AST Generation", () => {
    const zurg = createZurgFormat();

    describe("Primitive Schemas", () => {
        it("string() generates correct AST", () => {
            const ast = printNode(zurg.string().toExpression());
            expect(ast).toBe("serialization.string()");
        });

        it("number() generates correct AST", () => {
            const ast = printNode(zurg.number().toExpression());
            expect(ast).toBe("serialization.number()");
        });

        it("boolean() generates correct AST", () => {
            const ast = printNode(zurg.boolean().toExpression());
            expect(ast).toBe("serialization.boolean()");
        });

        it("bigint() generates correct AST", () => {
            const ast = printNode(zurg.bigint().toExpression());
            expect(ast).toBe("serialization.bigint()");
        });

        it("date() generates correct AST", () => {
            const ast = printNode(zurg.date().toExpression());
            expect(ast).toBe("serialization.date()");
        });

        it("any() generates correct AST", () => {
            const ast = printNode(zurg.any().toExpression());
            expect(ast).toBe("serialization.any()");
        });

        it("unknown() generates correct AST", () => {
            const ast = printNode(zurg.unknown().toExpression());
            expect(ast).toBe("serialization.unknown()");
        });

        it("never() generates correct AST", () => {
            const ast = printNode(zurg.never().toExpression());
            expect(ast).toBe("serialization.never()");
        });
    });

    describe("Literal Schemas", () => {
        it("stringLiteral() generates correct AST", () => {
            const ast = printNode(zurg.stringLiteral("hello").toExpression());
            expect(ast).toBe('serialization.stringLiteral("hello")');
        });

        it("booleanLiteral(true) generates correct AST", () => {
            const ast = printNode(zurg.booleanLiteral(true).toExpression());
            expect(ast).toBe("serialization.booleanLiteral(true)");
        });

        it("booleanLiteral(false) generates correct AST", () => {
            const ast = printNode(zurg.booleanLiteral(false).toExpression());
            expect(ast).toBe("serialization.booleanLiteral(false)");
        });
    });

    describe("Object Schemas", () => {
        it("empty object generates correct AST", () => {
            const ast = printNode(zurg.object([]).toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object with same raw/parsed keys generates correct AST", () => {
            const ast = printNode(
                zurg
                    .object([
                        { key: { parsed: "name", raw: "name" }, value: zurg.string() },
                        { key: { parsed: "age", raw: "age" }, value: zurg.number() }
                    ])
                    .toExpression()
            );
            expect(ast).toMatchSnapshot();
        });

        it("object with different raw/parsed keys generates correct AST", () => {
            const ast = printNode(
                zurg
                    .object([
                        { key: { parsed: "firstName", raw: "first_name" }, value: zurg.string() },
                        { key: { parsed: "lastName", raw: "last_name" }, value: zurg.string() }
                    ])
                    .toExpression()
            );
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Enum Schema", () => {
        it("enum with values generates correct AST", () => {
            const ast = printNode(zurg.enum(["A", "B", "C"]).toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Collection Schemas", () => {
        it("list(string()) generates correct AST", () => {
            const ast = printNode(zurg.list(zurg.string()).toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("set(number()) generates correct AST", () => {
            const ast = printNode(zurg.set(zurg.number()).toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("record(string, any) generates correct AST", () => {
            const ast = printNode(zurg.record({ keySchema: zurg.string(), valueSchema: zurg.any() }).toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Union Schemas", () => {
        it("discriminated union generates correct AST", () => {
            const ast = printNode(
                zurg
                    .union({
                        parsedDiscriminant: "type",
                        rawDiscriminant: "type",
                        singleUnionTypes: [
                            {
                                discriminantValue: "dog",
                                nonDiscriminantProperties: zurg.object([
                                    { key: { parsed: "breed", raw: "breed" }, value: zurg.string() }
                                ])
                            },
                            {
                                discriminantValue: "cat",
                                nonDiscriminantProperties: zurg.object([
                                    { key: { parsed: "indoor", raw: "indoor" }, value: zurg.boolean() }
                                ])
                            }
                        ]
                    })
                    .toExpression()
            );
            expect(ast).toMatchSnapshot();
        });

        it("undiscriminated union generates correct AST", () => {
            const ast = printNode(
                zurg.undiscriminatedUnion([zurg.string(), zurg.number(), zurg.boolean()]).toExpression()
            );
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Schema Modifiers", () => {
        it("optional() generates correct AST", () => {
            const ast = printNode(zurg.string().optional().toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("nullable() generates correct AST", () => {
            const ast = printNode(zurg.string().nullable().toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("optionalNullable() generates correct AST", () => {
            const ast = printNode(zurg.string().optionalNullable().toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Lazy Schemas", () => {
        it("lazy() generates correct AST", () => {
            const ast = printNode(zurg.lazy(zurg.string()).toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("lazyObject() generates correct AST", () => {
            const innerSchema = zurg.object([{ key: { parsed: "id", raw: "id" }, value: zurg.string() }]);
            const ast = printNode(zurg.lazyObject(innerSchema).toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Runtime Configuration", () => {
        it("returns empty dependencies for Zurg", () => {
            expect(zurg.getRuntimeDependencies()).toEqual({});
        });

        it("returns runtime file patterns for Zurg", () => {
            const patterns = zurg.getRuntimeFilePatterns();
            expect(patterns).not.toBeNull();
            expect(patterns?.patterns).toContain("src/core/schemas/**");
        });
    });

    describe("Format Identity", () => {
        it("has name 'default'", () => {
            expect(zurg.name).toBe("default");
        });
    });
});
