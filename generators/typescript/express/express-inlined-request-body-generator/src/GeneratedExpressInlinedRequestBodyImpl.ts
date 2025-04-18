import { getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressContext, GeneratedExpressInlinedRequestBody } from "@fern-typescript/contexts";

import { InlinedRequestBody, InlinedRequestBodyProperty } from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedExpressInlinedRequestBodyImpl {
    export interface Init {
        requestBody: InlinedRequestBody;
        typeName: string;
        retainOriginalCasing: boolean;
        includeSerdeLayer: boolean;
    }
}

export class GeneratedExpressInlinedRequestBodyImpl implements GeneratedExpressInlinedRequestBody {
    private requestBody: InlinedRequestBody;
    private typeName: string;
    private retainOriginalCasing: boolean;
    private includeSerdeLayer: boolean;

    constructor({
        requestBody,
        typeName,
        retainOriginalCasing,
        includeSerdeLayer
    }: GeneratedExpressInlinedRequestBodyImpl.Init) {
        this.requestBody = requestBody;
        this.typeName = typeName;
        this.retainOriginalCasing = retainOriginalCasing;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public writeToFile(context: ExpressContext): void {
        const requestInterface = context.sourceFile.addInterface({
            name: this.typeName,
            isExported: true
        });
        for (const extension of this.requestBody.extends) {
            requestInterface.addExtends(getTextOfTsNode(context.type.getReferenceToNamedType(extension).getTypeNode()));
        }
        for (const property of this.requestBody.properties) {
            const propertyType = context.type.getReferenceToType(property.valueType);
            requestInterface.addProperty({
                name: this.getPropertyKey(property),
                type: getTextOfTsNode(propertyType.typeNodeWithoutUndefined),
                hasQuestionToken: propertyType.isOptional
            });
        }
    }

    public getPropertyKey(property: InlinedRequestBodyProperty): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return property.name.name.camelCase.unsafeName;
        } else {
            return property.name.name.originalName;
        }
    }
}
