/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../../../../../index.js";
import * as SeedTrace from "../../../../../../../../api/index.js";
import * as core from "../../../../../../../../core/index.js";
import { Parameter } from "./Parameter.js";

export const VoidFunctionSignatureThatTakesActualResult: core.serialization.ObjectSchema<
    serializers.v2.v3.VoidFunctionSignatureThatTakesActualResult.Raw,
    SeedTrace.v2.v3.VoidFunctionSignatureThatTakesActualResult
> = core.serialization.object({
    parameters: core.serialization.list(Parameter),
    actualResultType: core.serialization.lazy(() => serializers.VariableType),
});

export declare namespace VoidFunctionSignatureThatTakesActualResult {
    export interface Raw {
        parameters: Parameter.Raw[];
        actualResultType: serializers.VariableType.Raw;
    }
}
