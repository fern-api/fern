/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernDocsConfig from "../../../../api/index";
import * as core from "../../../../core";
import { VersionConfig } from "./VersionConfig";
import { WithPermissions } from "./WithPermissions";
import { WithFeatureFlags } from "./WithFeatureFlags";

export const ProductConfig: core.serialization.ObjectSchema<
    serializers.ProductConfig.Raw,
    FernDocsConfig.ProductConfig
> = core.serialization
    .object({
        displayName: core.serialization.property("display-name", core.serialization.string()),
        path: core.serialization.string(),
        subtitle: core.serialization.string().optional(),
        icon: core.serialization.string().optional(),
        image: core.serialization.string().optional(),
        slug: core.serialization.string().optional(),
        versions: core.serialization.list(VersionConfig).optional(),
    })
    .extend(WithPermissions)
    .extend(WithFeatureFlags);

export declare namespace ProductConfig {
    export interface Raw extends WithPermissions.Raw, WithFeatureFlags.Raw {
        "display-name": string;
        path: string;
        subtitle?: string | null;
        icon?: string | null;
        image?: string | null;
        slug?: string | null;
        versions?: VersionConfig.Raw[] | null;
    }
}
