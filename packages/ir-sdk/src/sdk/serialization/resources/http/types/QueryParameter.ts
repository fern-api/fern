/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as FernIr from "../../../../api";
import * as core from "../../../../core";

export const QueryParameter: core.serialization.ObjectSchema<serializers.QueryParameter.Raw, FernIr.QueryParameter> =
    core.serialization
        .objectWithoutOptionalProperties({
            name: core.serialization.lazyObject(async () => (await import("../../..")).NameAndWireValue),
            valueType: core.serialization.lazy(async () => (await import("../../..")).TypeReference),
            allowMultiple: core.serialization.boolean(),
        })
        .extend(core.serialization.lazyObject(async () => (await import("../../..")).Declaration));

export declare namespace QueryParameter {
    interface Raw extends serializers.Declaration.Raw {
        name: serializers.NameAndWireValue.Raw;
        valueType: serializers.TypeReference.Raw;
        allowMultiple: boolean;
    }
}
