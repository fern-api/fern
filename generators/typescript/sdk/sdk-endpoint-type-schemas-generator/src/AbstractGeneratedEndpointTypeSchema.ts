import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { PackageId, Reference } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";

import { GeneratedEndpointTypeSchema } from "./GeneratedEndpointTypeSchema.js";

export declare namespace AbstractGeneratedEndpointTypeSchema {
    export interface Init extends AbstractGeneratedSchema.Init {
        packageId: PackageId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
    }
}

export abstract class AbstractGeneratedEndpointTypeSchema
    extends AbstractGeneratedSchema<SdkContext>
    implements GeneratedEndpointTypeSchema
{
    protected packageId: PackageId;
    protected service: FernIr.HttpService;
    protected endpoint: FernIr.HttpEndpoint;

    constructor({ packageId, service, endpoint, ...superInit }: AbstractGeneratedEndpointTypeSchema.Init) {
        super(superInit);
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
    }

    protected getReferenceToSchema(context: SdkContext): Reference {
        return context.sdkEndpointTypeSchemas.getReferenceToEndpointTypeSchemaExport(
            this.packageId,
            this.endpoint.name,
            [this.typeName]
        );
    }
}
