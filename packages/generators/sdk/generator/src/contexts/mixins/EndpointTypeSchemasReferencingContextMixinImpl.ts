import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import {
    EndpointTypeSchemasReferencingContextMixin,
    GeneratedEndpointTypeSchemas,
} from "@fern-typescript/sdk-declaration-handler";

export declare namespace EndpointTypeSchemasReferencingContextMixinImpl {
    export interface Init {
        endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class EndpointTypeSchemasReferencingContextMixinImpl implements EndpointTypeSchemasReferencingContextMixin {
    private endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
    private serviceResolver: ServiceResolver;

    constructor({
        endpointTypeSchemasGenerator,
        serviceResolver,
    }: EndpointTypeSchemasReferencingContextMixinImpl.Init) {
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
