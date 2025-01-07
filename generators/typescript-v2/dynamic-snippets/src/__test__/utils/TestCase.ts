import { FernIr } from "@fern-api/dynamic-ir-sdk";

export interface TestCase {
    description: string;
    giveRequest: FernIr.dynamic.EndpointSnippetRequest;
}
