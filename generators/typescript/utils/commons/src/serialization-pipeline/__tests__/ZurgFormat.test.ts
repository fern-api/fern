import { describe, expect, it } from "vitest";
import { ts } from "ts-morph";

import { Reference } from "../../referencing";
import { ZurgImpl } from "../../core-utilities/Zurg";
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
 * Create instances for testing
 */
function createZurgImpl(): ZurgImpl {
    return new ZurgImpl({
        getReferenceToExport: ({ exportedName }) => createMockReference(exportedName),
        generateEndpointMetadata: false
    });
}

function createZurgFormat(): ZurgFormat {
    return new ZurgFormat({
        getReferenceToExport: ({ exportedName }) => createMockReference(exportedName),
        generateEndpointMetadata: false
    });
}

describe("ZurgFormat produces identical output to ZurgImpl", () => {
    const zurgImpl = createZurgImpl();
    const zurgFormat = createZurgFormat();

    describe("Primitive Schemas", () => {
        it("string() matches", () => {
            const implAst = printNode(zurgImpl.string().toExpression());
            const formatAst = printNode(zurgFormat.string().toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("number() matches", () => {
            const implAst = printNode(zurgImpl.number().toExpression());
            const formatAst = printNode(zurgFormat.number().toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("boolean() matches", () => {
            const implAst = printNode(zurgImpl.boolean().toExpression());
            const formatAst = printNode(zurgFormat.boolean().toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("bigint() matches", () => {
            const implAst = printNode(zurgImpl.bigint().toExpression());
            const formatAst = printNode(zurgFormat.bigint().toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("date() matches", () => {
            const implAst = printNode(zurgImpl.date().toExpression());
            const formatAst = printNode(zurgFormat.date().toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("any() matches", () => {
            const implAst = printNode(zurgImpl.any().toExpression());
            const formatAst = printNode(zurgFormat.any().toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("unknown() matches", () => {
            const implAst = printNode(zurgImpl.unknown().toExpression());
            const formatAst = printNode(zurgFormat.unknown().toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("never() matches", () => {
            const implAst = printNode(zurgImpl.never().toExpression());
            const formatAst = printNode(zurgFormat.never().toExpression());
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Literal Schemas", () => {
        it("stringLiteral() matches", () => {
            const implAst = printNode(zurgImpl.stringLiteral("hello").toExpression());
            const formatAst = printNode(zurgFormat.stringLiteral("hello").toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("booleanLiteral(true) matches", () => {
            const implAst = printNode(zurgImpl.booleanLiteral(true).toExpression());
            const formatAst = printNode(zurgFormat.booleanLiteral(true).toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("booleanLiteral(false) matches", () => {
            const implAst = printNode(zurgImpl.booleanLiteral(false).toExpression());
            const formatAst = printNode(zurgFormat.booleanLiteral(false).toExpression());
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Object Schemas", () => {
        it("empty object matches", () => {
            const implAst = printNode(zurgImpl.object([]).toExpression());
            const formatAst = printNode(zurgFormat.object([]).toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("object with same raw/parsed keys matches", () => {
            const implAst = printNode(
                zurgImpl
                    .object([
                        { key: { parsed: "name", raw: "name" }, value: zurgImpl.string() },
                        { key: { parsed: "age", raw: "age" }, value: zurgImpl.number() }
                    ])
                    .toExpression()
            );
            const formatAst = printNode(
                zurgFormat
                    .object([
                        { key: { parsed: "name", raw: "name" }, value: zurgFormat.string() },
                        { key: { parsed: "age", raw: "age" }, value: zurgFormat.number() }
                    ])
                    .toExpression()
            );
            expect(formatAst).toBe(implAst);
        });

        it("object with different raw/parsed keys matches", () => {
            const implAst = printNode(
                zurgImpl
                    .object([
                        { key: { parsed: "firstName", raw: "first_name" }, value: zurgImpl.string() },
                        { key: { parsed: "lastName", raw: "last_name" }, value: zurgImpl.string() }
                    ])
                    .toExpression()
            );
            const formatAst = printNode(
                zurgFormat
                    .object([
                        { key: { parsed: "firstName", raw: "first_name" }, value: zurgFormat.string() },
                        { key: { parsed: "lastName", raw: "last_name" }, value: zurgFormat.string() }
                    ])
                    .toExpression()
            );
            expect(formatAst).toBe(implAst);
        });

        it("objectWithoutOptionalProperties matches", () => {
            const implAst = printNode(
                zurgImpl
                    .objectWithoutOptionalProperties([{ key: { parsed: "id", raw: "id" }, value: zurgImpl.string() }])
                    .toExpression()
            );
            const formatAst = printNode(
                zurgFormat
                    .objectWithoutOptionalProperties([{ key: { parsed: "id", raw: "id" }, value: zurgFormat.string() }])
                    .toExpression()
            );
            expect(formatAst).toBe(implAst);
        });

        it("object.extend() matches", () => {
            const implBase = zurgImpl.object([{ key: { parsed: "id", raw: "id" }, value: zurgImpl.string() }]);
            const implExtended = implBase.extend(
                zurgImpl.object([{ key: { parsed: "name", raw: "name" }, value: zurgImpl.string() }])
            );
            const implAst = printNode(implExtended.toExpression());

            const formatBase = zurgFormat.object([{ key: { parsed: "id", raw: "id" }, value: zurgFormat.string() }]);
            const formatExtended = formatBase.extend(
                zurgFormat.object([{ key: { parsed: "name", raw: "name" }, value: zurgFormat.string() }])
            );
            const formatAst = printNode(formatExtended.toExpression());

            expect(formatAst).toBe(implAst);
        });

        it("object.passthrough() matches", () => {
            const implAst = printNode(
                zurgImpl
                    .object([{ key: { parsed: "id", raw: "id" }, value: zurgImpl.string() }])
                    .passthrough()
                    .toExpression()
            );
            const formatAst = printNode(
                zurgFormat
                    .object([{ key: { parsed: "id", raw: "id" }, value: zurgFormat.string() }])
                    .passthrough()
                    .toExpression()
            );
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Enum Schemas", () => {
        it("enum with values matches", () => {
            const implAst = printNode(zurgImpl.enum(["ACTIVE", "INACTIVE", "PENDING"]).toExpression());
            const formatAst = printNode(zurgFormat.enum(["ACTIVE", "INACTIVE", "PENDING"]).toExpression());
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Collection Schemas", () => {
        it("list() matches", () => {
            const implAst = printNode(zurgImpl.list(zurgImpl.string()).toExpression());
            const formatAst = printNode(zurgFormat.list(zurgFormat.string()).toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("set() matches", () => {
            const implAst = printNode(zurgImpl.set(zurgImpl.number()).toExpression());
            const formatAst = printNode(zurgFormat.set(zurgFormat.number()).toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("record() matches", () => {
            const implAst = printNode(
                zurgImpl.record({ keySchema: zurgImpl.string(), valueSchema: zurgImpl.number() }).toExpression()
            );
            const formatAst = printNode(
                zurgFormat.record({ keySchema: zurgFormat.string(), valueSchema: zurgFormat.number() }).toExpression()
            );
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Union Schemas", () => {
        it("discriminated union matches", () => {
            const implAst = printNode(
                zurgImpl
                    .union({
                        parsedDiscriminant: "type",
                        rawDiscriminant: "type",
                        singleUnionTypes: [
                            {
                                discriminantValue: "dog",
                                nonDiscriminantProperties: zurgImpl.object([
                                    { key: { parsed: "breed", raw: "breed" }, value: zurgImpl.string() }
                                ])
                            }
                        ]
                    })
                    .toExpression()
            );
            const formatAst = printNode(
                zurgFormat
                    .union({
                        parsedDiscriminant: "type",
                        rawDiscriminant: "type",
                        singleUnionTypes: [
                            {
                                discriminantValue: "dog",
                                nonDiscriminantProperties: zurgFormat.object([
                                    { key: { parsed: "breed", raw: "breed" }, value: zurgFormat.string() }
                                ])
                            }
                        ]
                    })
                    .toExpression()
            );
            expect(formatAst).toBe(implAst);
        });

        it("union with different discriminant names matches", () => {
            const implAst = printNode(
                zurgImpl
                    .union({
                        parsedDiscriminant: "animalType",
                        rawDiscriminant: "animal_type",
                        singleUnionTypes: [
                            {
                                discriminantValue: "dog",
                                nonDiscriminantProperties: zurgImpl.object([])
                            }
                        ]
                    })
                    .toExpression()
            );
            const formatAst = printNode(
                zurgFormat
                    .union({
                        parsedDiscriminant: "animalType",
                        rawDiscriminant: "animal_type",
                        singleUnionTypes: [
                            {
                                discriminantValue: "dog",
                                nonDiscriminantProperties: zurgFormat.object([])
                            }
                        ]
                    })
                    .toExpression()
            );
            expect(formatAst).toBe(implAst);
        });

        it("undiscriminatedUnion matches", () => {
            const implAst = printNode(
                zurgImpl.undiscriminatedUnion([zurgImpl.string(), zurgImpl.number()]).toExpression()
            );
            const formatAst = printNode(
                zurgFormat.undiscriminatedUnion([zurgFormat.string(), zurgFormat.number()]).toExpression()
            );
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Lazy Schemas", () => {
        it("lazy() matches", () => {
            const implAst = printNode(zurgImpl.lazy(zurgImpl.string()).toExpression());
            const formatAst = printNode(zurgFormat.lazy(zurgFormat.string()).toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("lazyObject() matches", () => {
            const implAst = printNode(
                zurgImpl
                    .lazyObject(zurgImpl.object([{ key: { parsed: "id", raw: "id" }, value: zurgImpl.string() }]))
                    .toExpression()
            );
            const formatAst = printNode(
                zurgFormat
                    .lazyObject(zurgFormat.object([{ key: { parsed: "id", raw: "id" }, value: zurgFormat.string() }]))
                    .toExpression()
            );
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Schema Modifiers", () => {
        it("optional() matches", () => {
            const implAst = printNode(zurgImpl.string().optional().toExpression());
            const formatAst = printNode(zurgFormat.string().optional().toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("nullable() matches", () => {
            const implAst = printNode(zurgImpl.string().nullable().toExpression());
            const formatAst = printNode(zurgFormat.string().nullable().toExpression());
            expect(formatAst).toBe(implAst);
        });

        it("optionalNullable() matches", () => {
            const implAst = printNode(zurgImpl.string().optionalNullable().toExpression());
            const formatAst = printNode(zurgFormat.string().optionalNullable().toExpression());
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Schema Operations", () => {
        const schemaOpts = {
            unrecognizedObjectKeys: "fail" as const,
            allowUnrecognizedUnionMembers: false,
            allowUnrecognizedEnumValues: false,
            skipValidation: false,
            omitUndefined: false,
            breadcrumbsPrefix: [] as string[]
        };

        it("parse() matches", () => {
            const rawExpr = ts.factory.createIdentifier("raw");
            const implAst = printNode(zurgImpl.string().parse(rawExpr, schemaOpts));
            const formatAst = printNode(zurgFormat.string().parse(rawExpr, schemaOpts));
            expect(formatAst).toBe(implAst);
        });

        it("json() matches", () => {
            const parsedExpr = ts.factory.createIdentifier("parsed");
            const implAst = printNode(zurgImpl.string().json(parsedExpr, schemaOpts));
            const formatAst = printNode(zurgFormat.string().json(parsedExpr, schemaOpts));
            expect(formatAst).toBe(implAst);
        });

        it("parseOrThrow() matches", () => {
            const rawExpr = ts.factory.createIdentifier("raw");
            const implAst = printNode(zurgImpl.string().parseOrThrow(rawExpr, schemaOpts));
            const formatAst = printNode(zurgFormat.string().parseOrThrow(rawExpr, schemaOpts));
            expect(formatAst).toBe(implAst);
        });

        it("jsonOrThrow() matches", () => {
            const parsedExpr = ts.factory.createIdentifier("parsed");
            const implAst = printNode(zurgImpl.string().jsonOrThrow(parsedExpr, schemaOpts));
            const formatAst = printNode(zurgFormat.string().jsonOrThrow(parsedExpr, schemaOpts));
            expect(formatAst).toBe(implAst);
        });

        it("parse() with options matches", () => {
            const rawExpr = ts.factory.createIdentifier("raw");
            const opts = {
                unrecognizedObjectKeys: "passthrough" as const,
                allowUnrecognizedUnionMembers: true,
                allowUnrecognizedEnumValues: true,
                skipValidation: true,
                omitUndefined: true,
                breadcrumbsPrefix: ["request"]
            };
            const implAst = printNode(zurgImpl.string().parse(rawExpr, opts));
            const formatAst = printNode(zurgFormat.string().parse(rawExpr, opts));
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Type References", () => {
        it("Schema._getReferenceToType matches", () => {
            const rawShape = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
            const parsedShape = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);

            const implAst = printNode(zurgImpl.Schema._getReferenceToType({ rawShape, parsedShape }));
            const formatAst = printNode(zurgFormat.Schema._getReferenceToType({ rawShape, parsedShape }));
            expect(formatAst).toBe(implAst);
        });

        it("ObjectSchema._getReferenceToType matches", () => {
            const rawShape = ts.factory.createTypeLiteralNode([]);
            const parsedShape = ts.factory.createTypeLiteralNode([]);

            const implAst = printNode(zurgImpl.ObjectSchema._getReferenceToType({ rawShape, parsedShape }));
            const formatAst = printNode(zurgFormat.ObjectSchema._getReferenceToType({ rawShape, parsedShape }));
            expect(formatAst).toBe(implAst);
        });
    });

    describe("MaybeValid Visitor", () => {
        it("_visitMaybeValid matches", () => {
            const maybeValidRef = ts.factory.createIdentifier("result");
            const visitor = {
                valid: (valueRef: ts.Expression) => [
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(ts.factory.createIdentifier("onValid"), undefined, [valueRef])
                    )
                ],
                invalid: (errorsRef: ts.Expression) => [
                    ts.factory.createThrowStatement(
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [errorsRef])
                    )
                ]
            };

            const implStatements = zurgImpl.Schema._visitMaybeValid(maybeValidRef, visitor);
            const formatStatements = zurgFormat.Schema._visitMaybeValid(maybeValidRef, visitor);

            const implAst = printNode(ts.factory.createBlock(implStatements, true));
            const formatAst = printNode(ts.factory.createBlock(formatStatements, true));
            expect(formatAst).toBe(implAst);
        });
    });

    describe("Field names", () => {
        it("MaybeValid field names match", () => {
            expect(zurgFormat.MaybeValid.ok).toBe(zurgImpl.MaybeValid.ok);
            expect(zurgFormat.MaybeValid.Valid.value).toBe(zurgImpl.MaybeValid.Valid.value);
            expect(zurgFormat.MaybeValid.Invalid.errors).toBe(zurgImpl.MaybeValid.Invalid.errors);
        });

        it("ValidationError field names match", () => {
            expect(zurgFormat.ValidationError.path).toBe(zurgImpl.ValidationError.path);
            expect(zurgFormat.ValidationError.message).toBe(zurgImpl.ValidationError.message);
        });
    });

    describe("Schema._fromExpression", () => {
        it("basic usage matches", () => {
            const expr = ts.factory.createIdentifier("someSchema");
            const implSchema = zurgImpl.Schema._fromExpression(expr);
            const formatSchema = zurgFormat.Schema._fromExpression(expr);

            expect(printNode(formatSchema.toExpression())).toBe(printNode(implSchema.toExpression()));
        });

        it("with isObject option matches", () => {
            const expr = ts.factory.createIdentifier("someObjectSchema");
            const implSchema = zurgImpl.Schema._fromExpression(expr, { isObject: true });
            const formatSchema = zurgFormat.Schema._fromExpression(expr, { isObject: true });

            expect(printNode(formatSchema.toExpression())).toBe(printNode(implSchema.toExpression()));
        });
    });
});

