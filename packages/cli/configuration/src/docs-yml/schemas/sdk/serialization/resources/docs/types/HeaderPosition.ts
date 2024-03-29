/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as FernDocsConfig from "../../../../api";
import * as core from "../../../../core";

export const HeaderPosition: core.serialization.Schema<serializers.HeaderPosition.Raw, FernDocsConfig.HeaderPosition> =
    core.serialization.enum_(["fixed", "static"]);

export declare namespace HeaderPosition {
    type Raw = "fixed" | "static";
}
