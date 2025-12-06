import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";
import { ZURG_MANIFEST, ZurgFormat } from "../formats/ZurgFormat";

/**
 * Helper to print TypeScript AST to string for snapshot comparison
 */
function printNode(node: ts.Node): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const sourceFile = ts.createSourceFile("test.ts", "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

/**
 * Create a ZurgFormat instance for testing.
 * We don't pass ImportsManager for unit tests - the import tracking
 * is only needed for actual code generation.
 */
function createZurg(): ZurgFormat {
    return new ZurgFormat({
        getReferenceToExport: () => {
            throw new Error("getReferenceToExport should not be called in new ZurgFormat");
        },
        generateEndpointMetadata: false
    });
}

describe("ZurgFormat AST Generation Baseline", () => {
    const zurg = createZurg();

    describe("Primitive Schemas", () => {
        it("string() generates correct AST", () => {
            const schema = zurg.string();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("number() generates correct AST", () => {
            const schema = zurg.number();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("boolean() generates correct AST", () => {
            const schema = zurg.boolean();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("bigint() generates correct AST", () => {
            const schema = zurg.bigint();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("date() generates correct AST", () => {
            const schema = zurg.date();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("any() generates correct AST", () => {
            const schema = zurg.any();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("unknown() generates correct AST", () => {
            const schema = zurg.unknown();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("never() generates correct AST", () => {
            const schema = zurg.never();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Literal Schemas", () => {
        it("stringLiteral() generates correct AST", () => {
            const schema = zurg.stringLiteral("hello");
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("booleanLiteral(true) generates correct AST", () => {
            const schema = zurg.booleanLiteral(true);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("booleanLiteral(false) generates correct AST", () => {
            const schema = zurg.booleanLiteral(false);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Object Schemas", () => {
        it("empty object generates correct AST", () => {
            const schema = zurg.object([]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object with same raw/parsed keys generates correct AST", () => {
            const schema = zurg.object([
                { key: { parsed: "name", raw: "name" }, value: zurg.string() },
                { key: { parsed: "age", raw: "age" }, value: zurg.number() }
            ]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object with different raw/parsed keys generates correct AST", () => {
            const schema = zurg.object([
                { key: { parsed: "firstName", raw: "first_name" }, value: zurg.string() },
                { key: { parsed: "lastName", raw: "last_name" }, value: zurg.string() }
            ]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object with optional property generates correct AST", () => {
            const schema = zurg.object([
                { key: { parsed: "name", raw: "name" }, value: zurg.string() },
                { key: { parsed: "nickname", raw: "nickname" }, value: zurg.string().optional() }
            ]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object with nullable property generates correct AST", () => {
            const schema = zurg.object([{ key: { parsed: "name", raw: "name" }, value: zurg.string().nullable() }]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("objectWithoutOptionalProperties generates correct AST", () => {
            const schema = zurg.objectWithoutOptionalProperties([
                { key: { parsed: "id", raw: "id" }, value: zurg.string() }
            ]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object.extend() generates correct AST", () => {
            const baseSchema = zurg.object([{ key: { parsed: "id", raw: "id" }, value: zurg.string() }]);
            const extendedSchema = baseSchema.extend(
                zurg.object([{ key: { parsed: "name", raw: "name" }, value: zurg.string() }])
            );
            const ast = printNode(extendedSchema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object.passthrough() generates correct AST", () => {
            const schema = zurg.object([{ key: { parsed: "id", raw: "id" }, value: zurg.string() }]).passthrough();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Enum Schemas", () => {
        it("enum with single value generates correct AST", () => {
            const schema = zurg.enum(["ACTIVE"]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("enum with multiple values generates correct AST", () => {
            const schema = zurg.enum(["ACTIVE", "INACTIVE", "PENDING"]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Collection Schemas", () => {
        it("list() generates correct AST", () => {
            const schema = zurg.list(zurg.string());
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("set() generates correct AST", () => {
            const schema = zurg.set(zurg.number());
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("record() generates correct AST", () => {
            const schema = zurg.record({
                keySchema: zurg.string(),
                valueSchema: zurg.number()
            });
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("nested list generates correct AST", () => {
            const schema = zurg.list(zurg.list(zurg.string()));
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Union Schemas", () => {
        it("discriminated union generates correct AST", () => {
            const schema = zurg.union({
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
            });
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("union with different raw/parsed discriminant generates correct AST", () => {
            const schema = zurg.union({
                parsedDiscriminant: "animalType",
                rawDiscriminant: "animal_type",
                singleUnionTypes: [
                    {
                        discriminantValue: "dog",
                        nonDiscriminantProperties: zurg.object([])
                    }
                ]
            });
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("undiscriminatedUnion generates correct AST", () => {
            const schema = zurg.undiscriminatedUnion([zurg.string(), zurg.number(), zurg.boolean()]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Lazy Schemas (for recursion)", () => {
        it("lazy() generates correct AST", () => {
            const schema = zurg.lazy(zurg.string());
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("lazyObject() generates correct AST", () => {
            const schema = zurg.lazyObject(zurg.object([{ key: { parsed: "id", raw: "id" }, value: zurg.string() }]));
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Schema Modifiers", () => {
        it("optional() generates correct AST", () => {
            const schema = zurg.string().optional();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("nullable() generates correct AST", () => {
            const schema = zurg.string().nullable();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("optionalNullable() generates correct AST", () => {
            const schema = zurg.string().optionalNullable();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Schema Operations", () => {
        it("parse() generates correct AST", () => {
            const schema = zurg.string();
            const rawExpr = ts.factory.createIdentifier("rawValue");
            const parseExpr = schema.parse(rawExpr, {
                unrecognizedObjectKeys: "fail",
                allowUnrecognizedUnionMembers: false,
                allowUnrecognizedEnumValues: false,
                skipValidation: false,
                omitUndefined: false,
                breadcrumbsPrefix: []
            });
            const ast = printNode(parseExpr);
            expect(ast).toMatchSnapshot();
        });

        it("json() generates correct AST", () => {
            const schema = zurg.string();
            const parsedExpr = ts.factory.createIdentifier("parsedValue");
            const jsonExpr = schema.json(parsedExpr, {
                unrecognizedObjectKeys: "fail",
                allowUnrecognizedUnionMembers: false,
                allowUnrecognizedEnumValues: false,
                skipValidation: false,
                omitUndefined: false,
                breadcrumbsPrefix: []
            });
            const ast = printNode(jsonExpr);
            expect(ast).toMatchSnapshot();
        });

        it("parseOrThrow() generates correct AST", () => {
            const schema = zurg.string();
            const rawExpr = ts.factory.createIdentifier("rawValue");
            const parseExpr = schema.parseOrThrow(rawExpr, {
                unrecognizedObjectKeys: "fail",
                allowUnrecognizedUnionMembers: false,
                allowUnrecognizedEnumValues: false,
                skipValidation: false,
                omitUndefined: false,
                breadcrumbsPrefix: []
            });
            const ast = printNode(parseExpr);
            expect(ast).toMatchSnapshot();
        });

        it("jsonOrThrow() generates correct AST", () => {
            const schema = zurg.string();
            const parsedExpr = ts.factory.createIdentifier("parsedValue");
            const jsonExpr = schema.jsonOrThrow(parsedExpr, {
                unrecognizedObjectKeys: "fail",
                allowUnrecognizedUnionMembers: false,
                allowUnrecognizedEnumValues: false,
                skipValidation: false,
                omitUndefined: false,
                breadcrumbsPrefix: []
            });
            const ast = printNode(jsonExpr);
            expect(ast).toMatchSnapshot();
        });

        it("parse() with skipValidation generates correct AST", () => {
            const schema = zurg.object([{ key: { parsed: "name", raw: "name" }, value: zurg.string() }]);
            const rawExpr = ts.factory.createIdentifier("rawValue");
            const parseExpr = schema.parse(rawExpr, {
                unrecognizedObjectKeys: "passthrough",
                allowUnrecognizedUnionMembers: true,
                allowUnrecognizedEnumValues: true,
                skipValidation: true,
                omitUndefined: true,
                breadcrumbsPrefix: ["request"]
            });
            const ast = printNode(parseExpr);
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Type References", () => {
        it("Schema._getReferenceToType generates correct AST", () => {
            const rawShape = ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                    undefined,
                    "name",
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                )
            ]);
            const parsedShape = ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                    undefined,
                    "name",
                    undefined,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                )
            ]);
            const typeNode = zurg.Schema._getReferenceToType({ rawShape, parsedShape });
            const ast = printNode(typeNode);
            expect(ast).toMatchSnapshot();
        });

        it("ObjectSchema._getReferenceToType generates correct AST", () => {
            const rawShape = ts.factory.createTypeLiteralNode([]);
            const parsedShape = ts.factory.createTypeLiteralNode([]);
            const typeNode = zurg.ObjectSchema._getReferenceToType({ rawShape, parsedShape });
            const ast = printNode(typeNode);
            expect(ast).toMatchSnapshot();
        });
    });

    describe("MaybeValid Visitor", () => {
        it("_visitMaybeValid generates correct AST", () => {
            const maybeValidRef = ts.factory.createIdentifier("result");
            const statements = zurg.Schema._visitMaybeValid(maybeValidRef, {
                valid: (valueRef: ts.Expression) => [
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(ts.factory.createIdentifier("console.log"), undefined, [
                            valueRef
                        ])
                    )
                ],
                invalid: (errorsRef: ts.Expression) => [
                    ts.factory.createThrowStatement(
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [errorsRef])
                    )
                ]
            });
            const block = ts.factory.createBlock(statements, true);
            const ast = printNode(block);
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Complex Nested Schemas", () => {
        it("deeply nested object generates correct AST", () => {
            const schema = zurg.object([
                {
                    key: { parsed: "user", raw: "user" },
                    value: zurg.object([
                        {
                            key: { parsed: "profile", raw: "profile" },
                            value: zurg.object([
                                { key: { parsed: "name", raw: "name" }, value: zurg.string() },
                                { key: { parsed: "age", raw: "age" }, value: zurg.number().optional() }
                            ])
                        }
                    ])
                },
                {
                    key: { parsed: "tags", raw: "tags" },
                    value: zurg.list(zurg.string())
                },
                {
                    key: { parsed: "metadata", raw: "metadata" },
                    value: zurg.record({ keySchema: zurg.string(), valueSchema: zurg.any() })
                }
            ]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });
});
