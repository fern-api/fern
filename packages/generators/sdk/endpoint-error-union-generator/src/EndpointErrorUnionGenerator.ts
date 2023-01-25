import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { GeneratedEndpointErrorUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedEndpointErrorUnionImpl } from "./GeneratedEndpointErrorUnionImpl";

export declare namespace EndpointErrorUnionGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
    }

    export namespace generateEndpointErrorUnion {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class EndpointErrorUnionGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;

    constructor({ intermediateRepresentation, errorResolver }: EndpointErrorUnionGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
    }

    public generateEndpointErrorUnion({
        service,
        endpoint,
    }: EndpointErrorUnionGenerator.generateEndpointErrorUnion.Args): GeneratedEndpointErrorUnion {
        return new GeneratedEndpointErrorUnionImpl({
            service,
            endpoint,
            errorResolver: this.errorResolver,
            errorDiscriminationStrategy: this.intermediateRepresentation.errorDiscriminationStrategy,
        });
    }
}
