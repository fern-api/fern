import { IrVersions } from "../../ir-versions";
import { convertNameToV1, convertNameToV2 } from "./convertName";

export function convertFernFilepathV1(
    fernFilepath: IrVersions.V5.commons.FernFilepath
): IrVersions.V4.commons.FernFilepath {
    return fernFilepath.map((part) => convertNameToV1(part));
}

export function convertFernFilepathV2(
    fernFilepath: IrVersions.V5.commons.FernFilepath
): IrVersions.V4.commons.FernFilepathV2 {
    return fernFilepath.map((part) => convertNameToV2(part));
}
