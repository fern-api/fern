import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { AugmentedService } from "@fern-typescript/commons";
import { GeneratedService } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedServiceImpl } from "./GeneratedServiceImpl";

export declare namespace ServiceGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        neverThrowErrors: boolean;
    }

    export namespace generateService {
        export interface Args {
            service: AugmentedService;
            serviceClassName: string;
        }
    }
}

export class ServiceGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;
    private neverThrowErrors: boolean;

    constructor({ intermediateRepresentation, errorResolver, neverThrowErrors }: ServiceGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.neverThrowErrors = neverThrowErrors;
    }

    public generateService({ service, serviceClassName }: ServiceGenerator.generateService.Args): GeneratedService {
        return new GeneratedServiceImpl({
            apiHeaders: this.intermediateRepresentation.headers,
            apiAuth: this.intermediateRepresentation.auth,
            service,
            serviceClassName,
            errorDiscriminationStrategy: this.intermediateRepresentation.errorDiscriminationStrategy,
            errorResolver: this.errorResolver,
            neverThrowErrors: this.neverThrowErrors,
        });
    }
}
