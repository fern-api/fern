import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { GeneratedEndpointTypes } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedEndpointTypesImpl } from "./GeneratedEndpointTypesImpl";
import { NoopGeneratedEndpointTypes } from "./NoopGeneratedEndpointTypes";

export declare namespace EndpointTypesGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        neverThrowErrors: boolean;
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
    private neverThrowErrors: boolean;

    constructor({ intermediateRepresentation, errorResolver, neverThrowErrors }: EndpointTypesGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.neverThrowErrors = neverThrowErrors;
    }

    public generateEndpointTypes({
        service,
        endpoint,
    }: EndpointTypesGenerator.generateEndpointTypes.Args): GeneratedEndpointTypes {
        return this.neverThrowErrors
            ? new GeneratedEndpointTypesImpl({
                  service,
                  endpoint,
                  errorResolver: this.errorResolver,
                  errorDiscriminationStrategy: this.intermediateRepresentation.errorDiscriminationStrategy,
              })
            : new NoopGeneratedEndpointTypes();
    }
}
