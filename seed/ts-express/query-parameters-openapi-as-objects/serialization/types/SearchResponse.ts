/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../index";
import * as SeedApi from "../../api/index";
import * as core from "../../core";

export const SearchResponse: core.serialization.ObjectSchema<serializers.SearchResponse.Raw, SeedApi.SearchResponse> =
    core.serialization.object({
        results: core.serialization.list(core.serialization.string()).optional(),
    });

export declare namespace SearchResponse {
    export interface Raw {
        results?: string[] | null;
    }
}
