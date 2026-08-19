import { BaseContext } from "@fern-typescript/contexts";
import { AbstractUnknownSingleUnionType } from "@fern-typescript/union-generator";
import { ts } from "ts-morph";

export class UnknownSingleUnionType extends AbstractUnknownSingleUnionType<BaseContext> {
    public override getDiscriminantValueType(): ts.TypeNode {
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    }

    public needsRequestResponse(): { request: boolean; response: boolean } {
        return {
            request: false,
            response: false
        };
    }
    public getDocs(): string | null | undefined {
        return undefined;
    }
}
