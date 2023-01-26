import { HttpEndpoint, HttpService, InlinedRequestBody } from "@fern-fern/ir-model/http";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode, Reference, Zurg } from "@fern-typescript/commons";
import {
    ExpressInlinedRequestBodySchemaContext,
    GeneratedExpressInlinedRequestBodySchema,
} from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

export declare namespace GeneratedExpressInlinedRequestBodySchemaImpl {
    export interface Init extends AbstractGeneratedSchema.Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        inlinedRequestBody: InlinedRequestBody;
    }
}

export class GeneratedExpressInlinedRequestBodySchemaImpl
    extends AbstractGeneratedSchema<ExpressInlinedRequestBodySchemaContext>
    implements GeneratedExpressInlinedRequestBodySchema
{
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private inlinedRequestBody: InlinedRequestBody;

    constructor({
        service,
        endpoint,
        inlinedRequestBody,
        ...superInit
    }: GeneratedExpressInlinedRequestBodySchemaImpl.Init) {
        super(superInit);
        this.service = service;
        this.endpoint = endpoint;
        this.inlinedRequestBody = inlinedRequestBody;
    }

    public writeToFile(context: ExpressInlinedRequestBodySchemaContext): void {
        this.writeSchemaToFile(context);
    }

    public deserializeRequest(
        referenceToRawRequest: ts.Expression,
        context: ExpressInlinedRequestBodySchemaContext
    ): ts.Expression {
        return this.getReferenceToZurgSchema(context).parse(referenceToRawRequest);
    }

    protected getReferenceToSchema(context: ExpressInlinedRequestBodySchemaContext): Reference {
        return context.expressInlinedRequestBodySchema.getReferenceToInlinedRequestBody(
            this.service.name.fernFilepath,
            this.endpoint.name
        );
    }

    protected generateRawTypeDeclaration(
        context: ExpressInlinedRequestBodySchemaContext,
        module: ModuleDeclaration
    ): void {
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

    protected getReferenceToParsedShape(context: ExpressInlinedRequestBodySchemaContext): ts.TypeNode {
        return context.expressInlinedRequestBody
            .getReferenceToInlinedRequestBodyType(this.service.name.fernFilepath, this.endpoint.name)
            .getTypeNode();
    }

    protected buildSchema(context: ExpressInlinedRequestBodySchemaContext): Zurg.Schema {
        let schema = context.base.coreUtilities.zurg.object(
            this.inlinedRequestBody.properties.map((property) => ({
                key: {
                    parsed: context.expressInlinedRequestBody
                        .getGeneratedInlinedRequestBody(this.service.name.fernFilepath, this.endpoint.name)
                        .getPropertyKey(property),
                    raw: property.name.wireValue,
                },
                value: context.typeSchema.getSchemaOfTypeReference(property.valueType),
            }))
        );

        for (const extension of this.inlinedRequestBody.extends) {
            schema = schema.extend(context.typeSchema.getSchemaOfNamedType(extension, { isGeneratingSchema: true }));
        }

        return schema;
    }
}
