/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernOpenapiIr from "../../../../api/index";
import * as core from "../../../../core";

export const CommonPropertyWithExample: core.serialization.ObjectSchema<
    serializers.CommonPropertyWithExample.Raw,
    FernOpenapiIr.CommonPropertyWithExample
> = core.serialization.objectWithoutOptionalProperties({
    key: core.serialization.string(),
    schema: core.serialization.lazy(() => serializers.SchemaWithExample),
});

export declare namespace CommonPropertyWithExample {
    export interface Raw {
        key: string;
        schema: serializers.SchemaWithExample.Raw;
    }
}
