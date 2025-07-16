import { FernFilepath } from "@fern-api/ir-sdk"

export function isRootFernFilepath({ fernFilePath }: { fernFilePath: FernFilepath }): boolean {
    return fernFilePath.packagePath.length === 0 && fernFilePath.file == null
}
