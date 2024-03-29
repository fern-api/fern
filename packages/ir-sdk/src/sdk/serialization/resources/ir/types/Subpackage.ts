/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as FernIr from "../../../../api";
import * as core from "../../../../core";

export const Subpackage: core.serialization.ObjectSchema<serializers.Subpackage.Raw, FernIr.Subpackage> =
    core.serialization
        .objectWithoutOptionalProperties({
            name: core.serialization.lazyObject(async () => (await import("../../..")).Name),
        })
        .extend(core.serialization.lazyObject(async () => (await import("../../..")).Package));

export declare namespace Subpackage {
    interface Raw extends serializers.Package.Raw {
        name: serializers.Name.Raw;
    }
}
