import { ExampleHeader, ExampleInlinedRequestBody, ExampleQueryParameter, Name } from "@fern-fern/ir-sdk/api";
import { PackageId } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedRequestWrapper } from "./GeneratedRequestWrapper";
import { GeneratedRequestWrapperExample } from "./GeneratedRequestWrapperExample";

export interface RequestWrapperContext {
    getGeneratedRequestWrapper: (packageId: PackageId, endpointName: Name) => GeneratedRequestWrapper;
    getReferenceToRequestWrapper: (packageId: PackageId, endpointName: Name) => ts.TypeNode;
    getGeneratedExample: ({
        exampleHeaders,
        exampleBody,
        exampleQueryParameters,
        packageId,
        endpointName,
    }: {
        exampleBody: ExampleInlinedRequestBody | undefined;
        exampleQueryParameters: ExampleQueryParameter[] | undefined;
        exampleHeaders: ExampleHeader[] | undefined;
        packageId: PackageId;
        endpointName: Name;
    }) => GeneratedRequestWrapperExample;
}
