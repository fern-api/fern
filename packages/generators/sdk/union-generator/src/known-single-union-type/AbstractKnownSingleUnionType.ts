import { WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { GeneratedUnionImpl } from "../GeneratedUnionImpl";
import { AbstractParsedSingleUnionType } from "../parsed-single-union-type/AbstractParsedSingleUnionType";
import { KnownSingleUnionType } from "./KnownSingleUnionType";

export abstract class AbstractKnownSingleUnionType<Context extends WithBaseContextMixin>
    extends AbstractParsedSingleUnionType<Context>
    implements KnownSingleUnionType<Context>
{
    public abstract override getDiscriminantValue(): string;

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
                        ts.factory.createStringLiteral(this.getDiscriminantValueOrThrow())
                    ),
                ],
                true
            )
        );
    }
}
