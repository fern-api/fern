import { getTextOfTsNode } from "@fern-typescript/commons";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractVisitHelper } from "../visit-helper/AbstractVisitHelper";
import { ParsedEnumValue } from "./ParsedEnumValue";

export declare namespace UnionVisitHelper {
    export interface Init {
        parsedEnumValues: ParsedEnumValue[];
    }
}

export class EnumVisitHelper extends AbstractVisitHelper {
    private parsedEnumValues: ParsedEnumValue[];

    constructor(init: UnionVisitHelper.Init) {
        super();
        this.parsedEnumValues = init.parsedEnumValues;
    }

    protected getProperties(): OptionalKind<PropertySignatureStructure>[] {
        return this.parsedEnumValues.map<OptionalKind<PropertySignatureStructure>>((enumValue) => ({
            name: enumValue.getVisitorKey(),
            type: getTextOfTsNode(
                EnumVisitHelper.getVisitorPropertySignature({
                    parameterType: undefined,
                })
            ),
        }));
    }

    protected getUnknownParameterType(): ts.TypeNode {
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    }
}
