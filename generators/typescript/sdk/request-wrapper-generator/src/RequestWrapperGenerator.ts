import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapper } from "@fern-typescript/contexts";

import { GeneratedRequestWrapperImpl } from "./GeneratedRequestWrapperImpl.js";

export declare namespace RequestWrapperGenerator {
    export namespace generateRequestWrapper {
        export interface Args {
            service: FernIr.HttpService;
            endpoint: FernIr.HttpEndpoint;
            wrapperName: string;
            packageId: PackageId;
            includeSerdeLayer: boolean;
            retainOriginalCasing: boolean;
            inlineFileProperties: boolean;
            enableInlineTypes: boolean;
            shouldInlinePathParameters: boolean;
            formDataSupport: "Node16" | "Node18";
            flattenRequestParameters: boolean;
            parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
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
        retainOriginalCasing,
        inlineFileProperties,
        enableInlineTypes,
        shouldInlinePathParameters,
        formDataSupport,
        flattenRequestParameters,
        parameterNaming
    }: RequestWrapperGenerator.generateRequestWrapper.Args): GeneratedRequestWrapper {
        return new GeneratedRequestWrapperImpl({
            packageId,
            service,
            endpoint,
            wrapperName,
            includeSerdeLayer,
            retainOriginalCasing,
            inlineFileProperties,
            enableInlineTypes,
            shouldInlinePathParameters,
            formDataSupport,
            flattenRequestParameters,
            parameterNaming
        });
    }
}
