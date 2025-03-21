/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../index";
import * as SeedObject from "../../../api/index";
import * as core from "../../../core";

export const PostRootRequest: core.serialization.Schema<serializers.PostRootRequest.Raw, SeedObject.PostRootRequest> =
    core.serialization.object({
        bar: core.serialization.lazyObject(() => serializers.RequestTypeInlineType1),
        foo: core.serialization.string(),
    });

export declare namespace PostRootRequest {
    export interface Raw {
        bar: serializers.RequestTypeInlineType1.Raw;
        foo: string;
    }
}
