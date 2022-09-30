import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractVisitHelper } from "../visit-helper/AbstractVisitHelper";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";
import { UnknownSingleUnionType } from "./UnknownSingleUnionType";

export declare namespace UnionVisitHelper {
    export interface Init {
        parsedSingleUnionTypes: ParsedSingleUnionType[];
        unknownSingleUnionType: UnknownSingleUnionType;
    }
}

export class UnionVisitHelper extends AbstractVisitHelper {
    private unknownSingleUnionType: UnknownSingleUnionType;
    private parsedSingleUnionTypes: ParsedSingleUnionType[];

    constructor(init: UnionVisitHelper.Init) {
        super();
        this.unknownSingleUnionType = init.unknownSingleUnionType;
        this.parsedSingleUnionTypes = init.parsedSingleUnionTypes;
    }

    protected override getProperties(file: SdkFile): OptionalKind<PropertySignatureStructure>[] {
        return this.parsedSingleUnionTypes.map<OptionalKind<PropertySignatureStructure>>((singleUnionType) => ({
            name: singleUnionType.getVisitorKey(),
            type: getTextOfTsNode(singleUnionType.getVisitMethodSignature(file)),
        }));
    }

    protected override getUnknownParameterType(file: SdkFile): ts.TypeNode {
        return this.unknownSingleUnionType.getVisitorArgument(file);
    }
}
