/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../index";
import * as SeedObject from "../../api/index";
import * as core from "../../core";

export const UndiscriminatedUnion1DiscriminatedUnion1InlineType2: core.serialization.ObjectSchema<
    serializers.UndiscriminatedUnion1DiscriminatedUnion1InlineType2.Raw,
    SeedObject.UndiscriminatedUnion1DiscriminatedUnion1InlineType2
> = core.serialization.object({
    baz: core.serialization.string(),
    ref: core.serialization.lazyObject(() => serializers.ReferenceType),
});

export declare namespace UndiscriminatedUnion1DiscriminatedUnion1InlineType2 {
    interface Raw {
        baz: string;
        ref: serializers.ReferenceType.Raw;
    }
}
