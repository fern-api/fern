import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    ResolvedTypeReference,
    ShapeType,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { ExpressionReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { AbstractTypeReferenceConverter } from "./AbstractTypeReferenceConverter";

export declare namespace TypeReferenceToStringExpressionConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {}
}

export class TypeReferenceToStringExpressionConverter extends AbstractTypeReferenceConverter<
    (reference: ts.Expression) => ExpressionReferenceNode
> {
    protected override named(typeName: DeclaredTypeName): (reference: ts.Expression) => ExpressionReferenceNode {
        const resolvedType = this.typeResolver.resolveTypeName(typeName);
        return ResolvedTypeReference._visit<(reference: ts.Expression) => ExpressionReferenceNode>(resolvedType, {
            container: (containerType) =>
                ContainerType._visit(containerType, {
                    list: this.list.bind(this),
                    optional: this.optional.bind(this),
                    set: this.set.bind(this),
                    map: this.map.bind(this),
                    literal: () => {
                        throw new Error("Literals are unsupported!");
                    },
                    _unknown: () => {
                        throw new Error("Unknown ContainerType: " + containerType._type);
                    },
                }),
            primitive: this.primitive.bind(this),
            named: ({ shape }) => {
                if (shape === ShapeType.Enum) {
                    return (reference) => ({
                        expression: reference,
                        isNullable: false,
                    });
                }
                if (shape === ShapeType.UndiscriminatedUnion) {
                    return this.jsonStringifyIfNotString.bind(this);
                }
                return this.jsonStringify.bind(this);
            },
            unknown: this.unknown.bind(this),
            _unknown: () => {
                throw new Error("Unknown ResolvedTypeReference: " + resolvedType._type);
            },
        });
    }

    protected override string(): (reference: ts.Expression) => ExpressionReferenceNode {
        return (reference) => ({ expression: reference, isNullable: false });
    }

    protected override number(): (reference: ts.Expression) => ExpressionReferenceNode {
        return (reference) => ({
            expression: ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(reference, "toString"),
                undefined,
                undefined
            ),
            isNullable: false,
        });
    }

    protected override boolean(): (reference: ts.Expression) => ExpressionReferenceNode {
        return (reference) => ({
            expression: ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(reference, "toString"),
                undefined,
                undefined
            ),
            isNullable: false,
        });
    }

    protected override dateTime(): (reference: ts.Expression) => ExpressionReferenceNode {
        return (reference) => ({
            expression: ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(reference, "toISOString"),
                undefined,
                undefined
            ),
            isNullable: false,
        });
    }

    protected override optional(itemType: TypeReference): (reference: ts.Expression) => ExpressionReferenceNode {
        return (reference) => {
            return {
                expression: this.convert(itemType)(reference).expression,
                isNullable: true,
            };
        };
    }

    protected override unknown(): (reference: ts.Expression) => ExpressionReferenceNode {
        return this.jsonStringifyIfNotString.bind(this);
    }

    protected override list(): (reference: ts.Expression) => ExpressionReferenceNode {
        return this.jsonStringify.bind(this);
    }

    protected override literal(literal: Literal): (reference: ts.Expression) => ExpressionReferenceNode {
        return Literal._visit(literal, {
            string: () => (reference: ts.Expression) => ({
                expression: reference,
                isNullable: false,
            }),
            _unknown: () => {
                throw new Error("Unknown literal: " + literal.type);
            },
        });
    }

    protected override mapWithEnumKeys(): (reference: ts.Expression) => ExpressionReferenceNode {
        return this.jsonStringify.bind(this);
    }

    protected override mapWithNonEnumKeys(): (reference: ts.Expression) => ExpressionReferenceNode {
        return this.jsonStringify.bind(this);
    }

    protected override set(): (reference: ts.Expression) => ExpressionReferenceNode {
        return this.jsonStringify.bind(this);
    }

    private jsonStringify(reference: ts.Expression): ExpressionReferenceNode {
        return {
            expression: ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("JSON"),
                    ts.factory.createIdentifier("stringify")
                ),
                undefined,
                [reference]
            ),
            isNullable: false,
        };
    }

    private jsonStringifyIfNotString(reference: ts.Expression): ExpressionReferenceNode {
        return {
            expression: ts.factory.createConditionalExpression(
                ts.factory.createBinaryExpression(
                    ts.factory.createTypeOfExpression(reference),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    ts.factory.createStringLiteral("string")
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                reference,
                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                this.jsonStringify(reference).expression
            ),
            isNullable: false,
        };
    }
}
