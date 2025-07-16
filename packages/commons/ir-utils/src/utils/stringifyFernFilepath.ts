import { FernFilepath } from "@fern-api/ir-sdk"

export function stringifyFernFilepath(fernFilepath: FernFilepath): string {
    return fernFilepath.allParts.map((part) => part.originalName).join("/")
}
