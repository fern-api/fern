/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernIr from "../../../../api/index";
import * as core from "../../../../core";
import { WithDocs } from "../../commons/types/WithDocs";

export const HttpRequestBodyReference: core.serialization.ObjectSchema<
    serializers.HttpRequestBodyReference.Raw,
    FernIr.HttpRequestBodyReference
> = core.serialization
    .objectWithoutOptionalProperties({
        requestBodyType: core.serialization.lazy(() => serializers.TypeReference),
        contentType: core.serialization.string().optional(),
    })
    .extend(WithDocs);

export declare namespace HttpRequestBodyReference {
    export interface Raw extends WithDocs.Raw {
        requestBodyType: serializers.TypeReference.Raw;
        contentType?: string | null;
    }
}
