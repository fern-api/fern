import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";
import { GeneratedRequestWrapper } from "@fern-typescript/contexts";
import { GeneratedRequestWrapperImpl } from "./GeneratedRequestWrapperImpl";

export declare namespace RequestWrapperGenerator {
    export namespace generateRequestWrapper {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
            wrapperName: string;
        }
    }
}

export class RequestWrapperGenerator {
    public generateRequestWrapper({
        service,
        endpoint,
        wrapperName,
    }: RequestWrapperGenerator.generateRequestWrapper.Args): GeneratedRequestWrapper {
        return new GeneratedRequestWrapperImpl({
            service,
            endpoint,
            wrapperName,
        });
    }
}
