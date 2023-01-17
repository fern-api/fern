import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { EndpointTypeSchemasContext, Reference } from "@fern-typescript/contexts";
import { GeneratedEndpointTypeSchema } from "./GeneratedEndpointTypeSchema";

export declare namespace AbstractGeneratedEndpointTypeSchema {
    export interface Init extends AbstractGeneratedSchema.Init {
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export abstract class AbstractGeneratedEndpointTypeSchema
    extends AbstractGeneratedSchema<EndpointTypeSchemasContext>
    implements GeneratedEndpointTypeSchema
{
    protected service: HttpService;
    protected endpoint: HttpEndpoint;

    constructor({ service, endpoint, ...superInit }: AbstractGeneratedEndpointTypeSchema.Init) {
        super(superInit);
        this.service = service;
        this.endpoint = endpoint;
    }

    protected getReferenceToSchema(context: EndpointTypeSchemasContext): Reference {
        return context.endpointTypeSchemas.getReferenceToEndpointTypeSchemaExport(
            this.service.name.fernFilepath,
            this.endpoint.name,
            [this.typeName]
        );
    }
}
