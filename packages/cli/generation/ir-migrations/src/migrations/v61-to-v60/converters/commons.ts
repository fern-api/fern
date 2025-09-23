import { expandName } from "@fern-api/ir-utils";
import { IrVersions } from "../../ir-versions";

export function convertName(name: IrVersions.V61.commons.Name): IrVersions.V60.commons.Name {
    return expandName(name);
}

export function convertNameAndWireValue(nameAndWireValue: IrVersions.V61.commons.NameAndWireValue): IrVersions.V60.commons.NameAndWireValue {
    return {
        wireValue: nameAndWireValue.wireValue,
        name: convertName(nameAndWireValue.name)
    };
}