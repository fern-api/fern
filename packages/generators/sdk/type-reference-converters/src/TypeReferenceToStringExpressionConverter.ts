import {
    ContainerType,
    DeclaredTypeName,
    ResolvedTypeReference,
    ShapeType,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { ExpressionReferenceNode } from "@fern-typescript/commons-v2";
import { ts } from "ts-morph";
import { AbstractTypeReferenceConverter } from "./AbstractTypeReferenceConverter";

export declare namespace TypeReferenceToStringExpressionConverter {
    export interface Init extends AbstractTypeReferenceConverter.Init {
        stringifyEnum: (referenceToEnum: ts.Expression) => ts.Expression;
    }
}

export class TypeReferenceToStringExpressionConverter extends AbstractTypeReferenceConverter<
    (reference: ts.Expression) => ExpressionReferenceNode
> {
    private stringifyEnum: (referenceToEnum: ts.Expression) => ts.Expression;

    constructor({ stringifyEnum, ...superInit }: TypeReferenceToStringExpressionConverter.Init) {
        super(superInit);
        this.stringifyEnum = stringifyEnum;
    }

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
                        expression: this.stringifyEnum(reference),
                        isNullable: false,
                    });
                }
                throw new Error("Cannot convert type to string: " + shape);
            },
            unknown: this.unknown.bind(this),
            void: this.void.bind(this),
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
        throw new Error("Cannot convert unknown to string");
    }

    protected override list(): (reference: ts.Expression) => ExpressionReferenceNode {
        throw new Error("Cannot convert list to string");
    }

    protected override map(): (reference: ts.Expression) => ExpressionReferenceNode {
        throw new Error("Cannot convert map to string");
    }

    protected override set(): (reference: ts.Expression) => ExpressionReferenceNode {
        throw new Error("Cannot convert set to string");
    }
}
