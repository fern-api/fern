/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "..";
import * as SeedObjectsWithImports from "../../api";
import * as core from "../../core";
export declare const Node: core.serialization.ObjectSchema<serializers.Node.Raw, SeedObjectsWithImports.Node>;
export declare namespace Node {
    interface Raw {
        id: string;
        label?: string | null;
        metadata?: serializers.commons.Metadata.Raw | null;
    }
}
