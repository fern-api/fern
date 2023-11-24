import { IrVersions } from "../../ir-versions";
import { convertNameAndWireValueToV1, convertNameAndWireValueToV2 } from "./convertName";
import { convertTypeReference } from "./convertTypeReference";

export function convertHeader(header: IrVersions.V5.http.HttpHeader): IrVersions.V4.services.http.HttpHeader {
    return {
        name: convertNameAndWireValueToV1(header.name),
        nameV2: convertNameAndWireValueToV2(header.name),
        valueType: convertTypeReference(header.valueType),
        availability: header.availability,
        docs: header.docs
    };
}
