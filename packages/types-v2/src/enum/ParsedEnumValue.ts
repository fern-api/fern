import { EnumValue } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { OptionalKind, ts, VariableDeclarationKind, VariableStatementStructure } from "ts-morph";
import { EnumInterface } from "./EnumInterface";
import { EnumVisitHelper } from "./EnumVisitHelper";

export declare namespace ParsedEnumValue {
    export interface Init {
        enumValue: EnumValue;
    }
}

export class ParsedEnumValue {
    private enumValue: EnumValue;

    constructor({ enumValue }: ParsedEnumValue.Init) {
        this.enumValue = enumValue;
    }

    public getRawValue(): { typeNode: ts.TypeNode; expression: ts.Expression } {
        const literal = ts.factory.createStringLiteral(this.enumValue.value);
        return {
            typeNode: ts.factory.createLiteralTypeNode(literal),
            expression: literal,
        };
    }

    public getVisitorKey(): string {
        return this.enumValue.name.camelCase;
    }

    public getBuilderKey(): string {
        return this.enumValue.name.pascalCase;
    }

    public getBuiltObjectDeclaration(enumInterface: EnumInterface): OptionalKind<VariableStatementStructure> {
        return {
            declarations: [
                {
                    name: this.getBuiltObjectName(),
                    type: getTextOfTsNode(enumInterface.getReferenceToEnumValue(this)),
                    initializer: getTextOfTsNode(
                        ParsedEnumValue.getBuiltObjectDeclaration({
                            enumValue: this.getRawValue().expression,
                            visitorKey: this.getVisitorKey(),
                            visitorArguments: [],
                        })
                    ),
                },
            ],
            declarationKind: VariableDeclarationKind.Const,
        };
    }

    private getBuiltObjectName(): string {
        return `_${this.getBuilderKey()}`;
    }

    public getReferenceToBuiltObject(): ts.Expression {
        return ts.factory.createIdentifier(this.getBuiltObjectName());
    }

    public static getBuiltObjectDeclaration({
        enumValue,
        visitorKey,
        visitorArguments,
    }: {
        enumValue: ts.Expression;
        visitorKey: string;
        visitorArguments: ts.Expression[];
    }): ts.ObjectLiteralExpression {
        return ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment(
                    EnumInterface.GET_METHOD_NAME,
                    ts.factory.createArrowFunction(undefined, undefined, [], undefined, undefined, enumValue)
                ),
                ts.factory.createPropertyAssignment(
                    EnumInterface.VISIT_METHOD_NAME,
                    EnumVisitHelper.getVisitMethod({
                        visitorKey,
                        visitorArguments,
                    })
                ),
            ],
            true
        );
    }

    public getDocs(): string | undefined {
        return this.enumValue.docs ?? undefined;
    }
}
