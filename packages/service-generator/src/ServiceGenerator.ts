import { AugmentedService } from "@fern-typescript/commons-v2";
import { GeneratedService } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedServiceImpl } from "./GeneratedServiceImpl";

export declare namespace ServiceGenerator {
    export namespace generateService {
        export interface Args {
            service: AugmentedService;
            serviceClassName: string;
        }
    }
}

export class ServiceGenerator {
    public generateService({ service, serviceClassName }: ServiceGenerator.generateService.Args): GeneratedService {
        return new GeneratedServiceImpl({ service, serviceClassName });
    }
}
