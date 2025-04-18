/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as SeedCrossPackageTypeNames from "../../../../api/index";
import * as core from "../../../../core";

export const ImportingType: core.serialization.ObjectSchema<
    serializers.ImportingType.Raw,
    SeedCrossPackageTypeNames.ImportingType
> = core.serialization.object({
    imported: core.serialization.lazy(() => serializers.Imported),
});

export declare namespace ImportingType {
    export interface Raw {
        imported: serializers.Imported.Raw;
    }
}
