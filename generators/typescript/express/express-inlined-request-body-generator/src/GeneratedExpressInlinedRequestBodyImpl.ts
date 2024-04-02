import { InlinedRequestBody, InlinedRequestBodyProperty } from "@fern-fern/ir-sdk/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressContext, GeneratedExpressInlinedRequestBody } from "@fern-typescript/contexts";

export declare namespace GeneratedExpressInlinedRequestBodyImpl {
    export interface Init {
        requestBody: InlinedRequestBody;
        typeName: string;
        retainOriginalCasing: boolean;
    }
}

export class GeneratedExpressInlinedRequestBodyImpl implements GeneratedExpressInlinedRequestBody {
    private requestBody: InlinedRequestBody;
    private typeName: string;
    private retainOriginalCasing: boolean;

    constructor({ requestBody, typeName, retainOriginalCasing }: GeneratedExpressInlinedRequestBodyImpl.Init) {
        this.requestBody = requestBody;
        this.typeName = typeName;
        this.retainOriginalCasing = retainOriginalCasing;
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
        return this.retainOriginalCasing ? property.name.name.originalName : property.name.name.camelCase.unsafeName;
    }
}
