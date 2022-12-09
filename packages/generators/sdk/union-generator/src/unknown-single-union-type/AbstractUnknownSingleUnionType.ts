import { WithBaseContextMixin } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedUnionImpl } from "../GeneratedUnionImpl";
import { AbstractParsedSingleUnionType } from "../parsed-single-union-type/AbstractParsedSingleUnionType";

export declare namespace AbstractUnknownSingleUnionType {
    export interface Init<Context extends WithBaseContextMixin> extends AbstractParsedSingleUnionType.Init<Context> {
        builderParameterName: string;
    }
}

export abstract class AbstractUnknownSingleUnionType<
    Context extends WithBaseContextMixin
> extends AbstractParsedSingleUnionType<Context> {
    protected static INTERFACE_NAME = "_Unknown";
    protected static BUILDER_NAME = "_unknown";
    protected static VISITOR_KEY = "_other";

    private builderParameterName: string;

    constructor({ builderParameterName, ...superInit }: AbstractUnknownSingleUnionType.Init<Context>) {
        super(superInit);
        this.builderParameterName = builderParameterName;
    }

    public getDiscriminantValue(): string | undefined {
        return undefined;
    }

    public getInterfaceName(): string {
        return AbstractUnknownSingleUnionType.INTERFACE_NAME;
    }

    public getBuilderName(): string {
        return AbstractUnknownSingleUnionType.BUILDER_NAME;
    }

    public getVisitorKey(): string {
        return AbstractUnknownSingleUnionType.VISITOR_KEY;
    }

    protected override getVariableWithoutVisitDeclaration({
        referenceToTypeWithoutVisit,
    }: {
        referenceToTypeWithoutVisit: ts.TypeNode;
        context: Context;
        generatedUnion: GeneratedUnionImpl<Context>;
    }): ts.VariableDeclaration {
        return ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(AbstractParsedSingleUnionType.VALUE_WITHOUT_VISIT_VARIABLE_NAME),
            undefined,
            undefined,
            ts.factory.createAsExpression(
                ts.factory.createAsExpression(
                    ts.factory.createIdentifier(this.builderParameterName),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                ),
                referenceToTypeWithoutVisit
            )
        );
    }
}
