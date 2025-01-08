import { PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapperExample } from "@fern-typescript/contexts";

import { ExampleEndpointCall, HttpRequestBody, Name } from "@fern-fern/ir-sdk/api";

import { GeneratedRequestWrapperExampleImpl } from "./GeneratedRequestWrapperExampleImpl";

export class RequestWrapperExampleGenerator {
    public generateExample({
        bodyPropertyName,
        example,
        packageId,
        endpointName,
        requestBody
    }: {
        bodyPropertyName: string;
        example: ExampleEndpointCall;
        packageId: PackageId;
        endpointName: Name;
        requestBody: HttpRequestBody | undefined;
    }): GeneratedRequestWrapperExample {
        return new GeneratedRequestWrapperExampleImpl({
            bodyPropertyName,
            example,
            packageId,
            endpointName,
            requestBody
        });
    }
}
