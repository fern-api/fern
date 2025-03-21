/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernDefinition from "../../../../api/index";
import * as core from "../../../../core";

export const NugetOutputLocationSchema: core.serialization.ObjectSchema<
    serializers.NugetOutputLocationSchema.Raw,
    FernDefinition.NugetOutputLocationSchema
> = core.serialization.object({
    url: core.serialization.string().optional(),
    "package-name": core.serialization.string(),
    "api-key": core.serialization.string().optional(),
});

export declare namespace NugetOutputLocationSchema {
    export interface Raw {
        url?: string | null;
        "package-name": string;
        "api-key"?: string | null;
    }
}
