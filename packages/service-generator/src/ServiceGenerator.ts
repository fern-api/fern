import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { AugmentedService } from "@fern-typescript/commons-v2";
import { GeneratedService } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedServiceImpl } from "./GeneratedServiceImpl";

export declare namespace ServiceGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
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

    constructor({ intermediateRepresentation }: ServiceGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
    }
    public generateService({ service, serviceClassName }: ServiceGenerator.generateService.Args): GeneratedService {
        return new GeneratedServiceImpl({
            apiHeaders: this.intermediateRepresentation.headers,
            apiAuth: this.intermediateRepresentation.auth,
            service,
            serviceClassName,
        });
    }
}
