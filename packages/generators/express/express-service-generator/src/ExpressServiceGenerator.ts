import { HttpService } from "@fern-fern/ir-model/http";
import { GeneratedExpressService } from "@fern-typescript/contexts";
import { GeneratedExpressServiceImpl } from "./GeneratedExpressServiceImpl";

export declare namespace ExpressServiceGenerator {
    export interface Init {
        doNotHandleUnrecognizedErrors: boolean;
    }

    export namespace generateService {
        export interface Args {
            service: HttpService;
            serviceClassName: string;
        }
    }
}

export class ExpressServiceGenerator {
    private doNotHandleUnrecognizedErrors: boolean;

    constructor({ doNotHandleUnrecognizedErrors }: ExpressServiceGenerator.Init) {
        this.doNotHandleUnrecognizedErrors = doNotHandleUnrecognizedErrors;
    }

    public generateService({
        service,
        serviceClassName,
    }: ExpressServiceGenerator.generateService.Args): GeneratedExpressService {
        return new GeneratedExpressServiceImpl({
            service,
            serviceClassName,
            doNotHandleUnrecognizedErrors: this.doNotHandleUnrecognizedErrors,
        });
    }
}
