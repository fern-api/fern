/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as SeedApi from "../../../../api/index";
import * as core from "../../../../core";

export const SecondUnionFirstElement: core.serialization.ObjectSchema<
    serializers.SecondUnionFirstElement.Raw,
    SeedApi.SecondUnionFirstElement
> = core.serialization.object({
    child: core.serialization.lazy(() => serializers.FirstUnion),
});

export declare namespace SecondUnionFirstElement {
    export interface Raw {
        child: serializers.FirstUnion.Raw;
    }
}
