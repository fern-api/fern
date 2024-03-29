/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as FernIr from "../../../../api";
import * as core from "../../../../core";

export const HttpRequestBodyReference: core.serialization.ObjectSchema<
    serializers.HttpRequestBodyReference.Raw,
    FernIr.HttpRequestBodyReference
> = core.serialization
    .objectWithoutOptionalProperties({
        requestBodyType: core.serialization.lazy(async () => (await import("../../..")).TypeReference),
        contentType: core.serialization.string().optional(),
    })
    .extend(core.serialization.lazyObject(async () => (await import("../../..")).WithDocs));

export declare namespace HttpRequestBodyReference {
    interface Raw extends serializers.WithDocs.Raw {
        requestBodyType: serializers.TypeReference.Raw;
        contentType?: string | null;
    }
}
