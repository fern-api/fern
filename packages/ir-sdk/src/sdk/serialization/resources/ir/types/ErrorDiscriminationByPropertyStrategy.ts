/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernIr from "../../../../api/index";
import * as core from "../../../../core";
import { NameAndWireValue } from "../../commons/types/NameAndWireValue";

export const ErrorDiscriminationByPropertyStrategy: core.serialization.ObjectSchema<
    serializers.ErrorDiscriminationByPropertyStrategy.Raw,
    FernIr.ErrorDiscriminationByPropertyStrategy
> = core.serialization.objectWithoutOptionalProperties({
    discriminant: NameAndWireValue,
    contentProperty: NameAndWireValue,
});

export declare namespace ErrorDiscriminationByPropertyStrategy {
    export interface Raw {
        discriminant: NameAndWireValue.Raw;
        contentProperty: NameAndWireValue.Raw;
    }
}
