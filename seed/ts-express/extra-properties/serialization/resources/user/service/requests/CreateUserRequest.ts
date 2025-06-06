/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../../index";
import * as SeedExtraProperties from "../../../../../api/index";
import * as core from "../../../../../core";

export const CreateUserRequest: core.serialization.Schema<
    serializers.CreateUserRequest.Raw,
    SeedExtraProperties.CreateUserRequest
> = core.serialization.object({
    type: core.serialization.property("_type", core.serialization.stringLiteral("CreateUserRequest")),
    version: core.serialization.property("_version", core.serialization.stringLiteral("v1")),
    name: core.serialization.string(),
});

export declare namespace CreateUserRequest {
    export interface Raw {
        _type: "CreateUserRequest";
        _version: "v1";
        name: string;
    }
}
