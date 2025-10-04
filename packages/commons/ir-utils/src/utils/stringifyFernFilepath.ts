import { getOriginalName } from "@fern-api/core-utils";
import { FernFilepath } from "@fern-api/ir-sdk";

export function stringifyFernFilepath(fernFilepath: FernFilepath): string {
    return fernFilepath.allParts.map((part) => getOriginalName(part)).join("/");
}
