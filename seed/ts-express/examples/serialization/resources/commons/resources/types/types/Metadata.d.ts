/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../../..";
import * as SeedExamples from "../../../../../../api";
import * as core from "../../../../../../core";
export declare const Metadata: core.serialization.ObjectSchema<serializers.commons.Metadata.Raw, SeedExamples.commons.Metadata>;
export declare namespace Metadata {
    interface Raw {
        id: string;
        data?: Record<string, string> | null;
        jsonString?: string | null;
    }
}
