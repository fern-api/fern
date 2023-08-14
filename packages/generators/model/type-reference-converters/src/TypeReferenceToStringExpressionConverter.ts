import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    ResolvedTypeReference,
    ShapeType,
    TypeReference,
} from "@fern-fern/ir-sdk/api";
import { ts } from "ts-morph";
import { AbstractTypeReferenceConverter } from "./AbstractTypeReferenceConverter";

export declare namespace TypeReferenceToStringExpressionConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {}
}

export class TypeReferenceToStringExpressionConverter extends AbstractTypeReferenceConverter<
    (reference: ts.Expression) => ts.Expression
> {
    public convertWithNullCheckIfOptional(type: TypeReference): (reference: ts.Expression) => ts.Expression {
        const isNullable = TypeReference._visit(type, {
            named: (typeName) => {
                const resolvedType = this.typeResolver.resolveTypeName(typeName);
                return resolvedType.type === "container" && resolvedType.container.type === "optional";
            },
            container: (container) => container.type === "optional",
            primitive: () => false,
            unknown: () => true,
            _other: () => {
                throw new Error("Unknown TypeReference: " + type.type);
            },
        });

        if (!isNullable) {
            return this.convert(type);
        }

        return (reference) =>
            ts.factory.createConditionalExpression(
                ts.factory.createBinaryExpression(
                    reference,
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                    ts.factory.createNull()
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                this.convert(type)(reference),
                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                ts.factory.createIdentifier("undefined")
            );
    }

    protected override named(typeName: DeclaredTypeName): (reference: ts.Expression) => ts.Expression {
        const resolvedType = this.typeResolver.resolveTypeName(typeName);
        return ResolvedTypeReference._visit<(reference: ts.Expression) => ts.Expression>(resolvedType, {
            container: (containerType) =>
                ContainerType._visit(containerType, {
                    list: this.list.bind(this),
                    optional: this.optional.bind(this),
                    set: this.set.bind(this),
                    map: this.map.bind(this),
                    literal: this.literal.bind(this),
                    _other: () => {
                        throw new Error("Unknown ContainerType: " + containerType.type);
                    },
                }),
            primitive: this.primitive.bind(this),
            named: ({ shape }) => {
                if (shape === ShapeType.Enum) {
                    return (reference) => reference;
                }
                if (shape === ShapeType.UndiscriminatedUnion) {
                    return this.jsonStringifyIfNotString.bind(this);
                }
                return this.jsonStringify.bind(this);
            },
            unknown: this.unknown.bind(this),
            _other: () => {
                throw new Error("Unknown ResolvedTypeReference: " + resolvedType.type);
            },
        });
    }

    protected override string(): (reference: ts.Expression) => ts.Expression {
        return (reference) => reference;
    }

    protected override number(): (reference: ts.Expression) => ts.Expression {
        return (reference) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(reference, "toString"),
                undefined,
                undefined
            );
    }

    protected override boolean(): (reference: ts.Expression) => ts.Expression {
        return (reference) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(reference, "toString"),
                undefined,
                undefined
            );
    }

    protected override dateTime(): (reference: ts.Expression) => ts.Expression {
        return (reference) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(reference, "toISOString"),
                undefined,
                undefined
            );
    }

    protected override optional(itemType: TypeReference): (reference: ts.Expression) => ts.Expression {
        return (reference) => this.convert(itemType)(reference);
    }

    protected override unknown(): (reference: ts.Expression) => ts.Expression {
        return this.jsonStringifyIfNotString.bind(this);
    }

    protected override any(): (reference: ts.Expression) => ts.Expression {
        return this.jsonStringifyIfNotString.bind(this);
    }

    protected override list(): (reference: ts.Expression) => ts.Expression {
        return this.jsonStringify.bind(this);
    }

    protected override literal(literal: Literal): (reference: ts.Expression) => ts.Expression {
        return Literal._visit(literal, {
            string: () => (reference: ts.Expression) => reference,
            _other: () => {
                throw new Error("Unknown literal: " + literal.type);
            },
        });
    }

    protected override mapWithEnumKeys(): (reference: ts.Expression) => ts.Expression {
        return this.jsonStringify.bind(this);
    }

    protected override mapWithNonEnumKeys(): (reference: ts.Expression) => ts.Expression {
        return this.jsonStringify.bind(this);
    }

    protected override set(): (reference: ts.Expression) => ts.Expression {
        return this.jsonStringify.bind(this);
    }

    private jsonStringify(reference: ts.Expression): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("JSON"),
                ts.factory.createIdentifier("stringify")
            ),
            undefined,
            [reference]
        );
    }

    private jsonStringifyIfNotString(reference: ts.Expression): ts.Expression {
        return ts.factory.createConditionalExpression(
            ts.factory.createBinaryExpression(
                ts.factory.createTypeOfExpression(reference),
                ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                ts.factory.createStringLiteral("string")
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            reference,
            ts.factory.createToken(ts.SyntaxKind.ColonToken),
            this.jsonStringify(reference)
        );
    }
}
