import { ModelContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import { GeneratedUnionImpl } from "../GeneratedUnionImpl";
import { AbstractParsedSingleUnionType } from "../parsed-single-union-type/AbstractParsedSingleUnionType";
import { KnownSingleUnionType } from "./KnownSingleUnionType";

export abstract class AbstractKnownSingleUnionType<Context extends ModelContext>
    extends AbstractParsedSingleUnionType<Context>
    implements KnownSingleUnionType<Context>
{
    public abstract override getDiscriminantValue(): string | number;

    public getDiscriminantValueType(): ts.TypeNode {
        const discriminantValue = this.getDiscriminantValue();
        if (typeof discriminantValue === "string") {
            return ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(discriminantValue));
        }
        if (typeof discriminantValue === "number") {
            return ts.factory.createLiteralTypeNode(ts.factory.createNumericLiteral(discriminantValue));
        }
        assertNever(discriminantValue);
    }

    protected getNonVisitProperties({
        context,
        generatedUnion
    }: {
        context: Context;
        generatedUnion: GeneratedUnionImpl<Context>;
    }): ts.ObjectLiteralElementLike[] {
        return [
            ...this.singleUnionType.getNonDiscriminantPropertiesForBuilder(context),
            ts.factory.createPropertyAssignment(generatedUnion.discriminant, this.getDiscriminantValueAsExpression())
        ];
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
