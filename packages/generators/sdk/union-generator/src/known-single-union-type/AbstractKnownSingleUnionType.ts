import { assertNever } from "@fern-api/core-utils";
import { WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { GeneratedUnionImpl } from "../GeneratedUnionImpl";
import { AbstractParsedSingleUnionType } from "../parsed-single-union-type/AbstractParsedSingleUnionType";
import { KnownSingleUnionType } from "./KnownSingleUnionType";

export abstract class AbstractKnownSingleUnionType<Context extends WithBaseContextMixin>
    extends AbstractParsedSingleUnionType<Context>
    implements KnownSingleUnionType<Context>
{
    public abstract override getDiscriminantValue(): string | number;

    protected getVariableWithoutVisitDeclaration({
        referenceToTypeWithoutVisit,
        context,
        generatedUnion,
    }: {
        referenceToTypeWithoutVisit: ts.TypeNode;
        context: Context;
        generatedUnion: GeneratedUnionImpl<Context>;
    }): ts.VariableDeclaration {
        return ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(AbstractParsedSingleUnionType.VALUE_WITHOUT_VISIT_VARIABLE_NAME),
            undefined,
            referenceToTypeWithoutVisit,
            ts.factory.createObjectLiteralExpression(
                [
                    ...this.singleUnionType.getNonDiscriminantPropertiesForBuilder(context),
                    ts.factory.createPropertyAssignment(
                        generatedUnion.discriminant,
                        this.getDiscriminantValueAsExpression()
                    ),
                ],
                true
            )
        );
    }

    public getDiscriminantValueAsExpression(): ts.Expression {
        const discriminantValue = this.getDiscriminantValueOrThrow();
        if (typeof discriminantValue === "string") {
            return ts.factory.createStringLiteral(discriminantValue);
        }
        if (typeof discriminantValue === "number") {
            return ts.factory.createNumericLiteral(discriminantValue);
        }
        assertNever(discriminantValue);
    }
}
