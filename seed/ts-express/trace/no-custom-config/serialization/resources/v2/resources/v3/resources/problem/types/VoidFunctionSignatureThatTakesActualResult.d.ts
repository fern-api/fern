/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../../../../..";
import * as SeedTrace from "../../../../../../../../api";
import * as core from "../../../../../../../../core";
export declare const VoidFunctionSignatureThatTakesActualResult: core.serialization.ObjectSchema<serializers.v2.v3.VoidFunctionSignatureThatTakesActualResult.Raw, SeedTrace.v2.v3.VoidFunctionSignatureThatTakesActualResult>;
export declare namespace VoidFunctionSignatureThatTakesActualResult {
    interface Raw {
        parameters: serializers.v2.v3.Parameter.Raw[];
        actualResultType: serializers.VariableType.Raw;
    }
}
