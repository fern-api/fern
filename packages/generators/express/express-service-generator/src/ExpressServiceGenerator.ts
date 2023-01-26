import { HttpService } from "@fern-fern/ir-model/http";
import { GeneratedExpressService } from "@fern-typescript/contexts";
import { GeneratedExpressServiceImpl } from "./GeneratedExpressServiceImpl";

export declare namespace ExpressServiceGenerator {
    export namespace generateService {
        export interface Args {
            service: HttpService;
            serviceClassName: string;
        }
    }
}

export class ExpressServiceGenerator {
    public generateService({
        service,
        serviceClassName,
    }: ExpressServiceGenerator.generateService.Args): GeneratedExpressService {
        return new GeneratedExpressServiceImpl({
            service,
            serviceClassName,
        });
    }
}
