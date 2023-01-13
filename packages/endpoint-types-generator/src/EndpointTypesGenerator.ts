import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { GeneratedEndpointTypes } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedEndpointTypesImpl } from "./GeneratedEndpointTypesImpl";

export declare namespace EndpointTypesGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
    }

    export namespace generateEndpointTypes {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class EndpointTypesGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;

    constructor({ intermediateRepresentation, errorResolver }: EndpointTypesGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
    }

    public generateEndpointTypes({
        service,
        endpoint,
    }: EndpointTypesGenerator.generateEndpointTypes.Args): GeneratedEndpointTypes {
        return new GeneratedEndpointTypesImpl({
            service,
            endpoint,
            errorResolver: this.errorResolver,
            errorDiscriminationStrategy: this.intermediateRepresentation.errorDiscriminationStrategy,
        });
    }
}
