import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasContext, Reference } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

export declare namespace GeneratedEndpointTypeSchema {
    export interface Init extends AbstractGeneratedSchema.Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        type: TypeReference;
    }
}

export class GeneratedEndpointTypeSchema extends AbstractGeneratedSchema<EndpointTypeSchemasContext> {
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private type: TypeReference;

    constructor({ service, endpoint, type, ...superInit }: GeneratedEndpointTypeSchema.Init) {
        super(superInit);
        this.service = service;
        this.endpoint = endpoint;
        this.type = type;
    }

    protected generateRawTypeDeclaration(context: EndpointTypeSchemasContext, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.type).typeNode),
        });
    }

    protected getReferenceToParsedShape(context: EndpointTypeSchemasContext): ts.TypeNode {
        return context.type.getReferenceToType(this.type).typeNode;
    }

    protected buildSchema(context: EndpointTypeSchemasContext): Zurg.Schema {
        return context.typeSchema.getSchemaOfTypeReference(this.type);
    }

    protected getReferenceToSchema(context: EndpointTypeSchemasContext): Reference {
        return context.endpointTypeSchemas.getReferenceToEndpointTypeSchemaExport(this.service.name, this.endpoint.id, [
            this.typeName,
        ]);
    }
}
