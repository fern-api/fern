import { FernIr } from "@fern-fern/ir-sdk";
import { getOriginalName, getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressContext, GeneratedExpressInlinedRequestBody } from "@fern-typescript/contexts";

export declare namespace GeneratedExpressInlinedRequestBodyImpl {
    export interface Init {
        requestBody: FernIr.InlinedRequestBody;
        typeName: string;
        retainOriginalCasing: boolean;
        includeSerdeLayer: boolean;
    }
}

export class GeneratedExpressInlinedRequestBodyImpl implements GeneratedExpressInlinedRequestBody {
    private requestBody: FernIr.InlinedRequestBody;
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
                name: this.getPropertyKey(property, context),
                type: getTextOfTsNode(propertyType.typeNodeWithoutUndefined),
                hasQuestionToken: propertyType.isOptional
            });
        }
    }

    public getPropertyKey(property: FernIr.InlinedRequestBodyProperty, context: ExpressContext): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return context.case.camelUnsafe(property.name);
        } else {
            return getOriginalName(property.name);
        }
    }
}
