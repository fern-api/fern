import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapperExample } from "@fern-typescript/contexts";

import { GeneratedRequestWrapperExampleImpl } from "./GeneratedRequestWrapperExampleImpl.js";

export class RequestWrapperExampleGenerator {
    public generateExample({
        bodyPropertyName,
        example,
        packageId,
        endpointName,
        requestBody,
        flattenRequestParameters
    }: {
        bodyPropertyName: string;
        example: FernIr.ExampleEndpointCall;
        packageId: PackageId;
        endpointName: FernIr.Name;
        requestBody: FernIr.HttpRequestBody | undefined;
        flattenRequestParameters: boolean;
    }): GeneratedRequestWrapperExample {
        return new GeneratedRequestWrapperExampleImpl({
            bodyPropertyName,
            example,
            packageId,
            endpointName,
            requestBody,
            flattenRequestParameters
        });
    }
}
