import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { GeneratedEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedEndpointTypeSchemasImpl } from "./GeneratedEndpointTypeSchemasImpl";

export declare namespace EndpointTypeSchemasGenerator {
    export interface Init {
        errorResolver: ErrorResolver;
        intermediateRepresentation: IntermediateRepresentation;
    }

    export namespace generateEndpointTypeSchemas {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class EndpointTypeSchemasGenerator {
    private errorResolver: ErrorResolver;
    private intermediateRepresentation: IntermediateRepresentation;

    constructor({ errorResolver, intermediateRepresentation }: EndpointTypeSchemasGenerator.Init) {
        this.errorResolver = errorResolver;
        this.intermediateRepresentation = intermediateRepresentation;
    }

    public generateEndpointTypeSchemas({
        service,
        endpoint,
    }: EndpointTypeSchemasGenerator.generateEndpointTypeSchemas.Args): GeneratedEndpointTypeSchemas {
        return new GeneratedEndpointTypeSchemasImpl({
            service,
            endpoint,
            errorResolver: this.errorResolver,
            errorDiscriminationStrategy: this.intermediateRepresentation.errorDiscriminationStrategy,
        });
    }
}
