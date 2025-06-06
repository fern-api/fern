/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../../../index.js";
import * as SeedExhaustive from "../../../../../../api/index.js";
import * as core from "../../../../../../core/index.js";

export const Dog: core.serialization.ObjectSchema<serializers.types.Dog.Raw, SeedExhaustive.types.Dog> =
    core.serialization.object({
        name: core.serialization.string(),
        likesToWoof: core.serialization.boolean(),
    });

export declare namespace Dog {
    export interface Raw {
        name: string;
        likesToWoof: boolean;
    }
}
