/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../../../index";
import * as FernIr from "../../../../../../api/index";
import * as core from "../../../../../../core";

export const RubyGemsPublishInfo: core.serialization.ObjectSchema<
    serializers.dynamic.RubyGemsPublishInfo.Raw,
    FernIr.dynamic.RubyGemsPublishInfo
> = core.serialization.objectWithoutOptionalProperties({
    version: core.serialization.string(),
    packageName: core.serialization.string(),
    repoUrl: core.serialization.string().optional(),
});

export declare namespace RubyGemsPublishInfo {
    export interface Raw {
        version: string;
        packageName: string;
        repoUrl?: string | null;
    }
}
