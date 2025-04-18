import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { PackageId, Reference } from "@fern-typescript/commons";
import { ExpressContext } from "@fern-typescript/contexts";

import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";

import { GeneratedEndpointTypeSchema } from "./GeneratedEndpointTypeSchema";

export declare namespace AbstractGeneratedEndpointTypeSchema {
    export interface Init extends AbstractGeneratedSchema.Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export abstract class AbstractGeneratedEndpointTypeSchema
    extends AbstractGeneratedSchema<ExpressContext>
    implements GeneratedEndpointTypeSchema
{
    protected packageId: PackageId;
    protected service: HttpService;
    protected endpoint: HttpEndpoint;

    constructor({ packageId, service, endpoint, ...superInit }: AbstractGeneratedEndpointTypeSchema.Init) {
        super(superInit);
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
    }

    protected getReferenceToSchema(context: ExpressContext): Reference {
        return context.expressEndpointTypeSchemas.getReferenceToEndpointTypeSchemaExport(
            this.packageId,
            this.endpoint.name,
            [this.typeName]
        );
    }
}
