import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { AugmentedService } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedSdkClientClassImpl } from "./GeneratedSdkClientClassImpl";

export declare namespace SdkClientClassGenerator {
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

export class SdkClientClassGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;
    private neverThrowErrors: boolean;

    constructor({ intermediateRepresentation, errorResolver, neverThrowErrors }: SdkClientClassGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.neverThrowErrors = neverThrowErrors;
    }

    public generateService({
        service,
        serviceClassName,
    }: SdkClientClassGenerator.generateService.Args): GeneratedSdkClientClass {
        return new GeneratedSdkClientClassImpl({
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
