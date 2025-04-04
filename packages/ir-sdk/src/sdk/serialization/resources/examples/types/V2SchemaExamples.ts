/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernIr from "../../../../api/index";
import * as core from "../../../../core";
import { V2SchemaExample } from "./V2SchemaExample";

export const V2SchemaExamples: core.serialization.ObjectSchema<
    serializers.V2SchemaExamples.Raw,
    FernIr.V2SchemaExamples
> = core.serialization.objectWithoutOptionalProperties({
    userSpecifiedExamples: core.serialization.list(V2SchemaExample),
    autogeneratedExamples: core.serialization.list(V2SchemaExample),
});

export declare namespace V2SchemaExamples {
    export interface Raw {
        userSpecifiedExamples: V2SchemaExample.Raw[];
        autogeneratedExamples: V2SchemaExample.Raw[];
    }
}
