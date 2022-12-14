import { InlinedRequestBody } from "@fern-fern/ir-model/services/http";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractGeneratedEndpointTypeSchema } from "./AbstractGeneratedEndpointTypeSchema";

export declare namespace GeneratedInlinedRequestBodySchema {
    export interface Init extends AbstractGeneratedEndpointTypeSchema.Init {
        inlinedRequestBody: InlinedRequestBody;
    }
}

export class GeneratedInlinedRequestBodySchema extends AbstractGeneratedEndpointTypeSchema {
    private inlinedRequestBody: InlinedRequestBody;

    constructor({ inlinedRequestBody, ...superInit }: GeneratedInlinedRequestBodySchema.Init) {
        super(superInit);
        this.inlinedRequestBody = inlinedRequestBody;
    }

    protected generateRawTypeDeclaration(context: EndpointTypeSchemasContext, module: ModuleDeclaration): void {
        module.addInterface({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            properties: this.inlinedRequestBody.properties.map((property) => {
                const type = context.typeSchema.getReferenceToRawType(property.valueType);
                return {
                    name: `"${property.name.wireValue}"`,
                    type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                    hasQuestionToken: type.isOptional,
                };
            }),
            extends: this.inlinedRequestBody.extends.map((extension) =>
                getTextOfTsNode(context.typeSchema.getReferenceToRawNamedType(extension).getTypeNode())
            ),
        });
    }

    protected getReferenceToParsedShape(context: EndpointTypeSchemasContext): ts.TypeNode {
        const referenceToRequestWrapper = context.requestWrapper.getReferenceToRequestWrapper(
            this.service.name,
            this.endpoint.id
        );
        const generatedRequestWrapper = context.requestWrapper.getGeneratedRequestWrapper(
            this.service.name,
            this.endpoint.id
        );
        const nonBodyKeys = generatedRequestWrapper.getNonBodyKeys();
        if (nonBodyKeys.length === 0) {
            return referenceToRequestWrapper;
        } else {
            return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
                referenceToRequestWrapper,
                ts.factory.createUnionTypeNode(
                    nonBodyKeys.map((nonBodyKey) =>
                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(nonBodyKey))
                    )
                ),
            ]);
        }
    }

    protected buildSchema(context: EndpointTypeSchemasContext): Zurg.Schema {
        let schema = context.base.coreUtilities.zurg.object(
            this.inlinedRequestBody.properties.map((property) => ({
                key: {
                    parsed: context.requestWrapper
                        .getGeneratedRequestWrapper(this.service.name, this.endpoint.id)
                        .getInlinedRequestBodyPropertyKey(property),
                    raw: property.name.wireValue,
                },
                value: context.typeSchema.getSchemaOfTypeReference(property.valueType),
            }))
        );

        for (const extension of this.inlinedRequestBody.extends) {
            schema = schema.extend(context.typeSchema.getSchemaOfNamedType(extension));
        }

        return schema;
    }
}
