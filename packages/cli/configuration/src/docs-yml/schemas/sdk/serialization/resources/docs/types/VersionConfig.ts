/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as FernDocsConfig from "../../../../api";
import * as core from "../../../../core";

export const VersionConfig: core.serialization.ObjectSchema<
    serializers.VersionConfig.Raw,
    FernDocsConfig.VersionConfig
> = core.serialization.object({
    displayName: core.serialization.property("display-name", core.serialization.string()),
    path: core.serialization.string(),
    slug: core.serialization.string().optional(),
    availability: core.serialization.lazy(async () => (await import("../../..")).VersionAvailability).optional(),
});

export declare namespace VersionConfig {
    interface Raw {
        "display-name": string;
        path: string;
        slug?: string | null;
        availability?: serializers.VersionAvailability.Raw | null;
    }
}
