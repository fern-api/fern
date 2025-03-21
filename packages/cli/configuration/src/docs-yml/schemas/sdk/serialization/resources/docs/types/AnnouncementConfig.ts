/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernDocsConfig from "../../../../api/index";
import * as core from "../../../../core";

export const AnnouncementConfig: core.serialization.ObjectSchema<
    serializers.AnnouncementConfig.Raw,
    FernDocsConfig.AnnouncementConfig
> = core.serialization.object({
    message: core.serialization.string(),
});

export declare namespace AnnouncementConfig {
    export interface Raw {
        message: string;
    }
}
