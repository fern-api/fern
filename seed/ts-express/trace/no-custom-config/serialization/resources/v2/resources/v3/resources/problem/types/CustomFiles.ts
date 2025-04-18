/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../../../../../index";
import * as SeedTrace from "../../../../../../../../api/index";
import * as core from "../../../../../../../../core";

export const CustomFiles: core.serialization.Schema<serializers.v2.v3.CustomFiles.Raw, SeedTrace.v2.v3.CustomFiles> =
    core.serialization
        .union("type", {
            basic: core.serialization.lazyObject(() => serializers.v2.v3.BasicCustomFiles),
            custom: core.serialization.object({
                value: core.serialization.record(
                    core.serialization.lazy(() => serializers.Language),
                    core.serialization.lazyObject(() => serializers.v2.v3.Files).optional(),
                ),
            }),
        })
        .transform<SeedTrace.v2.v3.CustomFiles>({
            transform: (value) => value,
            untransform: (value) => value,
        });

export declare namespace CustomFiles {
    export type Raw = CustomFiles.Basic | CustomFiles.Custom;

    export interface Basic extends serializers.v2.v3.BasicCustomFiles.Raw {
        type: "basic";
    }

    export interface Custom {
        type: "custom";
        value: Record<serializers.Language.Raw, serializers.v2.v3.Files.Raw | null | undefined>;
    }
}
