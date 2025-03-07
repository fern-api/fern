/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernIr from "../../../../api/index";
import * as core from "../../../../core";

export const SafeAndUnsafeString: core.serialization.ObjectSchema<
    serializers.SafeAndUnsafeString.Raw,
    FernIr.SafeAndUnsafeString
> = core.serialization.objectWithoutOptionalProperties({
    unsafeName: core.serialization.string(),
    safeName: core.serialization.string(),
});

export declare namespace SafeAndUnsafeString {
    export interface Raw {
        unsafeName: string;
        safeName: string;
    }
}
