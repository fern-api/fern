import { IrVersions } from '../../ir-versions'
import { convertFernFilepathV1, convertFernFilepathV2 } from './convertFernFilepath'
import { convertNameToV1, convertNameToV2 } from './convertName'

export function convertDeclaredTypeName(
    typeName: IrVersions.V5.types.DeclaredTypeName
): IrVersions.V4.types.DeclaredTypeName {
    return {
        fernFilepath: convertFernFilepathV1(typeName.fernFilepath),
        fernFilepathV2: convertFernFilepathV2(typeName.fernFilepath),
        name: typeName.name.originalName,
        nameV2: convertNameToV1(typeName.name),
        nameV3: convertNameToV2(typeName.name)
    }
}
