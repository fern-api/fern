/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../..";
import * as SeedTrace from "../../../../api";
import * as core from "../../../../core";
export declare const ProblemDescription: core.serialization.ObjectSchema<serializers.ProblemDescription.Raw, SeedTrace.ProblemDescription>;
export declare namespace ProblemDescription {
    interface Raw {
        boards: serializers.ProblemDescriptionBoard.Raw[];
    }
}
