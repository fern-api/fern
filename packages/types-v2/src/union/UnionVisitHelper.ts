import { UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractVisitHelper } from "../visit-helper/AbstractVisitHelper";
import {
    AbstractParsedSingleUnionType,
    ParsedSingleUnionType,
} from "./parsed-single-union-type/AbstractParsedSingleUnionType";

export declare namespace UnionVisitHelper {
    export interface Init {
        parsedSingleUnionTypes: ParsedSingleUnionType[];
        union: UnionTypeDeclaration;
    }
}

export class UnionVisitHelper extends AbstractVisitHelper {
    private parsedSingleUnionTypes: ParsedSingleUnionType[];
    private union: UnionTypeDeclaration;

    constructor(init: UnionVisitHelper.Init) {
        super();
        this.parsedSingleUnionTypes = init.parsedSingleUnionTypes;
        this.union = init.union;
    }

    protected getProperties(file: SdkFile): OptionalKind<PropertySignatureStructure>[] {
        return this.parsedSingleUnionTypes.map<OptionalKind<PropertySignatureStructure>>((singleUnionType) => ({
            name: singleUnionType.getVisitorKey(),
            type: getTextOfTsNode(singleUnionType.getVisitMethodSignature(file)),
        }));
    }

    protected getUnknownParameterType(): ts.TypeNode {
        return ts.factory.createTypeLiteralNode([
            ts.factory.createPropertySignature(
                undefined,
                ts.factory.createIdentifier(AbstractParsedSingleUnionType.getDiscriminantKey(this.union)),
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            ),
        ]);
    }
}
