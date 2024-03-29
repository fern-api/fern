/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as FernDocsConfig from "../../../../api";
import * as core from "../../../../core";

export const EditThisPageConfig: core.serialization.ObjectSchema<
    serializers.EditThisPageConfig.Raw,
    FernDocsConfig.EditThisPageConfig
> = core.serialization.object({
    github: core.serialization.lazyObject(async () => (await import("../../..")).GithubEditThisPageConfig).optional(),
});

export declare namespace EditThisPageConfig {
    interface Raw {
        github?: serializers.GithubEditThisPageConfig.Raw | null;
    }
}
