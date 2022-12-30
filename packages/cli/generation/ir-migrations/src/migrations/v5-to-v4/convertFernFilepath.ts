import { IrVersions } from "../../ir-versions";

export function convertFernFilepathV1(
    fernFilepath: IrVersions.V5.commons.FernFilepath
): IrVersions.V4.commons.FernFilepath {}

export function convertFernFilepathV2(
    fernFilepath: IrVersions.V5.commons.FernFilepath
): IrVersions.V4.commons.FernFilepathV2 {}
