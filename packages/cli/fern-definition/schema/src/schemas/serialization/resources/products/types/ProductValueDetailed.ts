/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernDefinition from "../../../../api/index";
import * as core from "../../../../core";
import { VersionDeclarationSchema } from "../../versioning/types/VersionDeclarationSchema";
import { WithDocsSchema } from "../../commons/types/WithDocsSchema";
import { WithName } from "../../commons/types/WithName";

export const ProductValueDetailed: core.serialization.ObjectSchema<
    serializers.ProductValueDetailed.Raw,
    FernDefinition.ProductValueDetailed
> = core.serialization
    .object({
        value: core.serialization.string(),
        versions: VersionDeclarationSchema.optional(),
    })
    .extend(WithDocsSchema)
    .extend(WithName);

export declare namespace ProductValueDetailed {
    export interface Raw extends WithDocsSchema.Raw, WithName.Raw {
        value: string;
        versions?: VersionDeclarationSchema.Raw | null;
    }
}
