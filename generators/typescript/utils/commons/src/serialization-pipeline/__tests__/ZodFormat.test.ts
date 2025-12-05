import { describe, expect, it } from "vitest";
import { ts } from "ts-morph";

import { Reference } from "../../referencing";
import { ZodFormat } from "../formats/ZodFormat";

/**
 * Helper to print TypeScript AST to string for comparison
 */
function printNode(node: ts.Node): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const sourceFile = ts.createSourceFile("test.ts", "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

/**
 * Create a mock reference for testing
 */
function createMockReference(exportedName: string): Reference {
    return {
        getExpression: () => {
            return ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("z"),
                ts.factory.createIdentifier(exportedName)
            );
        },
        getTypeNode: () => {
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier("z"),
                    ts.factory.createIdentifier(exportedName)
                ),
                undefined
            );
        },
        getEntityName: () => {
            return ts.factory.createQualifiedName(
                ts.factory.createIdentifier("z"),
                ts.factory.createIdentifier(exportedName)
            );
        }
    };
}

/**
 * Create a ZodFormat instance for testing
 */
function createZod(): ZodFormat {
    return new ZodFormat({
        getReferenceToExport: ({ exportedName }) => createMockReference(exportedName),
        generateEndpointMetadata: false
    });
}

describe("ZodFormat AST Generation", () => {
    const zod = createZod();

    describe("Primitive Schemas", () => {
        it("string() generates z.string()", () => {
            const schema = zod.string();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("number() generates z.number()", () => {
            const schema = zod.number();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("boolean() generates z.boolean()", () => {
            const schema = zod.boolean();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("bigint() generates z.bigint()", () => {
            const schema = zod.bigint();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("date() generates z.string().transform()", () => {
            const schema = zod.date();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("any() generates z.any()", () => {
            const schema = zod.any();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("unknown() generates z.unknown()", () => {
            const schema = zod.unknown();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("never() generates z.never()", () => {
            const schema = zod.never();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Literal Schemas", () => {
        it("stringLiteral() generates z.literal()", () => {
            const schema = zod.stringLiteral("hello");
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("booleanLiteral(true) generates z.literal(true)", () => {
            const schema = zod.booleanLiteral(true);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("booleanLiteral(false) generates z.literal(false)", () => {
            const schema = zod.booleanLiteral(false);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Object Schemas", () => {
        it("empty object generates z.object({})", () => {
            const schema = zod.object([]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object with same raw/parsed keys generates z.object()", () => {
            const schema = zod.object([
                { key: { parsed: "name", raw: "name" }, value: zod.string() },
                { key: { parsed: "age", raw: "age" }, value: zod.number() }
            ]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object with different raw/parsed keys generates transform", () => {
            const schema = zod.object([
                { key: { parsed: "firstName", raw: "first_name" }, value: zod.string() },
                { key: { parsed: "lastName", raw: "last_name" }, value: zod.string() }
            ]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object with optional property", () => {
            const schema = zod.object([
                { key: { parsed: "name", raw: "name" }, value: zod.string() },
                { key: { parsed: "nickname", raw: "nickname" }, value: zod.string().optional() }
            ]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object with nullable property", () => {
            const schema = zod.object([
                { key: { parsed: "name", raw: "name" }, value: zod.string().nullable() }
            ]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("object.passthrough()", () => {
            const schema = zod.object([
                { key: { parsed: "id", raw: "id" }, value: zod.string() }
            ]).passthrough();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Enum Schemas", () => {
        it("enum generates z.enum()", () => {
            const schema = zod.enum(["ACTIVE", "INACTIVE", "PENDING"]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Collection Schemas", () => {
        it("list() generates z.array()", () => {
            const schema = zod.list(zod.string());
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("set() generates z.set()", () => {
            const schema = zod.set(zod.number());
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("record() generates z.record()", () => {
            const schema = zod.record({
                keySchema: zod.string(),
                valueSchema: zod.number()
            });
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("nested list generates z.array(z.array())", () => {
            const schema = zod.list(zod.list(zod.string()));
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Union Schemas", () => {
        it("discriminated union generates z.discriminatedUnion()", () => {
            const schema = zod.union({
                parsedDiscriminant: "type",
                rawDiscriminant: "type",
                singleUnionTypes: [
                    {
                        discriminantValue: "dog",
                        nonDiscriminantProperties: zod.object([
                            { key: { parsed: "breed", raw: "breed" }, value: zod.string() }
                        ])
                    },
                    {
                        discriminantValue: "cat",
                        nonDiscriminantProperties: zod.object([
                            { key: { parsed: "indoor", raw: "indoor" }, value: zod.boolean() }
                        ])
                    }
                ]
            });
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("undiscriminatedUnion generates z.union()", () => {
            const schema = zod.undiscriminatedUnion([zod.string(), zod.number(), zod.boolean()]);
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Lazy Schemas", () => {
        it("lazy() generates z.lazy()", () => {
            const schema = zod.lazy(zod.string());
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("lazyObject() generates z.lazy()", () => {
            const schema = zod.lazyObject(
                zod.object([{ key: { parsed: "id", raw: "id" }, value: zod.string() }])
            );
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Schema Modifiers", () => {
        it("optional() generates .optional()", () => {
            const schema = zod.string().optional();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("nullable() generates .nullable()", () => {
            const schema = zod.string().nullable();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });

        it("optionalNullable() generates .optional().nullable()", () => {
            const schema = zod.string().optionalNullable();
            const ast = printNode(schema.toExpression());
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Schema Operations", () => {
        it("parse() generates .parse()", () => {
            const schema = zod.string();
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
    });

    describe("Type References", () => {
        it("Schema._getReferenceToType generates z.ZodType", () => {
            const rawShape = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
            const parsedShape = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
            const typeNode = zod.Schema._getReferenceToType({ rawShape, parsedShape });
            const ast = printNode(typeNode);
            expect(ast).toMatchSnapshot();
        });
    });

    describe("MaybeValid Visitor", () => {
        it("_visitMaybeValid generates if/else with success/data/error", () => {
            const maybeValidRef = ts.factory.createIdentifier("result");
            const statements = zod.Schema._visitMaybeValid(maybeValidRef, {
                valid: (valueRef) => [
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("console.log"),
                            undefined,
                            [valueRef]
                        )
                    )
                ],
                invalid: (errorsRef) => [
                    ts.factory.createThrowStatement(
                        ts.factory.createNewExpression(
                            ts.factory.createIdentifier("Error"),
                            undefined,
                            [errorsRef]
                        )
                    )
                ]
            });
            const block = ts.factory.createBlock(statements, true);
            const ast = printNode(block);
            expect(ast).toMatchSnapshot();
        });
    });

    describe("Field names", () => {
        it("MaybeValid field names use Zod conventions", () => {
            expect(zod.MaybeValid.ok).toBe("success");
            expect(zod.MaybeValid.Valid.value).toBe("data");
            expect(zod.MaybeValid.Invalid.errors).toBe("error");
        });
    });

    describe("Runtime Configuration", () => {
        it("returns zod as npm dependency", () => {
            const deps = zod.getRuntimeDependencies();
            expect(deps).toHaveProperty("zod");
            expect(deps.zod).toMatch(/^\^3\./);
        });

        it("returns null for runtime file patterns (uses npm)", () => {
            const patterns = zod.getRuntimeFilePatterns();
            expect(patterns).toBeNull();
        });
    });
});

