import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import {
    EndpointTypeSchemasContextMixin,
    GeneratedEndpointTypeSchemas,
} from "@fern-typescript/sdk-declaration-handler";

export declare namespace EndpointTypeSchemasContextMixinImpl {
    export interface Init {
        endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class EndpointTypeSchemasContextMixinImpl implements EndpointTypeSchemasContextMixin {
    private endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
    private serviceResolver: ServiceResolver;

    constructor({ endpointTypeSchemasGenerator, serviceResolver }: EndpointTypeSchemasContextMixinImpl.Init) {
        this.serviceResolver = serviceResolver;
        this.endpointTypeSchemasGenerator = endpointTypeSchemasGenerator;
    }

    public getGeneratedEndpointTypeSchemas(
        serviceName: DeclaredServiceName,
        endpointId: string
    ): GeneratedEndpointTypeSchemas {
        const service = this.serviceResolver.getServiceDeclarationFromName(serviceName);
        const endpoint = service.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return this.endpointTypeSchemasGenerator.generateEndpointTypeSchemas({ service, endpoint });
    }
}
