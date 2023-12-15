import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapper } from "@fern-typescript/contexts";
import { GeneratedRequestWrapperImpl } from "./GeneratedRequestWrapperImpl";

export declare namespace RequestWrapperGenerator {
    export namespace generateRequestWrapper {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
            wrapperName: string;
            packageId: PackageId;
            includeSerdeLayer: boolean;
        }
    }
}

export class RequestWrapperGenerator {
    public generateRequestWrapper({
        packageId,
        service,
        endpoint,
        wrapperName,
        includeSerdeLayer,
    }: RequestWrapperGenerator.generateRequestWrapper.Args): GeneratedRequestWrapper {
        return new GeneratedRequestWrapperImpl({
            packageId,
            service,
            endpoint,
            wrapperName,
            includeSerdeLayer,
        });
    }
}
