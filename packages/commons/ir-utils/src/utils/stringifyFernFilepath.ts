import { FernFilepath } from "@fern-api/ir-sdk";

import { getNameString } from "./getNameString.js";

export function stringifyFernFilepath(fernFilepath: FernFilepath): string {
    return fernFilepath.allParts.map((part) => getNameString(part)).join("/");
}
