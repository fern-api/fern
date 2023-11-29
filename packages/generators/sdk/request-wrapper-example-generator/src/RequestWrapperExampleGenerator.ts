import { ExampleHeader, ExampleInlinedRequestBody, ExampleQueryParameter, Name } from "@fern-fern/ir-sdk/api";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapperExample } from "@fern-typescript/contexts";
import { GeneratedRequestWrapperExampleImpl } from "./GeneratedRequestWrapperExampleImpl";

export class RequestWrapperExampleGenerator {
    public generateExample({
        exampleHeaders,
        exampleBody,
        exampleQueryParameters,
        packageId,
        endpointName,
    }: {
        exampleHeaders: ExampleHeader[];
        exampleBody: ExampleInlinedRequestBody | undefined;
        exampleQueryParameters: ExampleQueryParameter[];
        packageId: PackageId;
        endpointName: Name;
    }): GeneratedRequestWrapperExample {
        return new GeneratedRequestWrapperExampleImpl({
            exampleHeaders,
            exampleBody,
            exampleQueryParameters,
            packageId,
            endpointName,
        });
    }
}
