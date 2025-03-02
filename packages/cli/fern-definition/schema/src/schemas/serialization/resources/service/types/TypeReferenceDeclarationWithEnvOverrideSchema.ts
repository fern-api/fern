/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernDefinition from "../../../../api/index";
import * as core from "../../../../core";
import { TypeReferenceDeclarationWithName } from "../../types/types/TypeReferenceDeclarationWithName";

export const TypeReferenceDeclarationWithEnvOverrideSchema: core.serialization.ObjectSchema<
    serializers.TypeReferenceDeclarationWithEnvOverrideSchema.Raw,
    FernDefinition.TypeReferenceDeclarationWithEnvOverrideSchema
> = core.serialization
    .object({
        env: core.serialization.string().optional(),
    })
    .extend(TypeReferenceDeclarationWithName);

export declare namespace TypeReferenceDeclarationWithEnvOverrideSchema {
    export interface Raw extends TypeReferenceDeclarationWithName.Raw {
        env?: string | null;
    }
}
