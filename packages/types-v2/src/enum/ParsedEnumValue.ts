import { EnumValue } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";
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

    public getBuild(enumInterface: EnumInterface): ts.ArrowFunction {
        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            enumInterface.getReferenceToEnumValue(this),
            undefined,
            ts.factory.createParenthesizedExpression(
                ParsedEnumValue.getBuiltObject({
                    enumValue: this.getRawValue().expression,
                    visitorKey: this.getVisitorKey(),
                    visitorArguments: [],
                })
            )
        );
    }

    public static getBuiltObject({
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
