/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernIr from "../../../index";

export interface V2HttpEndpointRequest extends FernIr.WithDocs {
    endpoint: FernIr.V2EndpointLocation;
    baseUrl: string | undefined;
    environment: FernIr.V2EnvironmentValues | undefined;
    auth: FernIr.V2AuthValues | undefined;
    pathParameters: FernIr.V2ExampleValues | undefined;
    queryParameters: FernIr.V2ExampleValues | undefined;
    headers: FernIr.V2ExampleValues | undefined;
    requestBody: unknown | undefined;
}
