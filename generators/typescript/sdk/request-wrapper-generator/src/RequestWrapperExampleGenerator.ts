import { ExampleEndpointCall, HttpRequestBody, Name } from "@fern-fern/ir-sdk/api";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapperExample } from "@fern-typescript/contexts";

import { GeneratedRequestWrapperExampleImpl } from "./GeneratedRequestWrapperExampleImpl";

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
        example: ExampleEndpointCall;
        packageId: PackageId;
        endpointName: Name;
        requestBody: HttpRequestBody | undefined;
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
