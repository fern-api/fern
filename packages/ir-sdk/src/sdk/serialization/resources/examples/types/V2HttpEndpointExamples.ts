/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernIr from "../../../../api/index";
import * as core from "../../../../core";
import { V2HttpEndpointExample } from "./V2HttpEndpointExample";

export const V2HttpEndpointExamples: core.serialization.ObjectSchema<
    serializers.V2HttpEndpointExamples.Raw,
    FernIr.V2HttpEndpointExamples
> = core.serialization.objectWithoutOptionalProperties({
    userSpecifiedExamples: core.serialization.list(V2HttpEndpointExample),
    autogeneratedExamples: core.serialization.list(V2HttpEndpointExample),
});

export declare namespace V2HttpEndpointExamples {
    export interface Raw {
        userSpecifiedExamples: V2HttpEndpointExample.Raw[];
        autogeneratedExamples: V2HttpEndpointExample.Raw[];
    }
}
