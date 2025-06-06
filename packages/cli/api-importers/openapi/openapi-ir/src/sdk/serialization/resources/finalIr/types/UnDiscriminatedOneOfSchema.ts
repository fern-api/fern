/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernOpenapiIr from "../../../../api/index";
import * as core from "../../../../core";
import { WithSdkGroupName } from "../../commons/types/WithSdkGroupName";
import { WithNamespace } from "../../commons/types/WithNamespace";
import { WithName } from "../../commons/types/WithName";
import { WithDescription } from "../../commons/types/WithDescription";
import { WithAvailability } from "../../commons/types/WithAvailability";
import { WithEncoding } from "../../commons/types/WithEncoding";
import { WithSource } from "../../commons/types/WithSource";
import { WithTitle } from "../../commons/types/WithTitle";
import { WithInline } from "../../commons/types/WithInline";

export const UnDiscriminatedOneOfSchema: core.serialization.ObjectSchema<
    serializers.UnDiscriminatedOneOfSchema.Raw,
    FernOpenapiIr.UnDiscriminatedOneOfSchema
> = core.serialization
    .objectWithoutOptionalProperties({
        schemas: core.serialization.list(core.serialization.lazy(() => serializers.Schema)),
    })
    .extend(WithSdkGroupName)
    .extend(WithNamespace)
    .extend(WithName)
    .extend(WithDescription)
    .extend(WithAvailability)
    .extend(WithEncoding)
    .extend(WithSource)
    .extend(WithTitle)
    .extend(WithInline);

export declare namespace UnDiscriminatedOneOfSchema {
    export interface Raw
        extends WithSdkGroupName.Raw,
            WithNamespace.Raw,
            WithName.Raw,
            WithDescription.Raw,
            WithAvailability.Raw,
            WithEncoding.Raw,
            WithSource.Raw,
            WithTitle.Raw,
            WithInline.Raw {
        schemas: serializers.Schema.Raw[];
    }
}
