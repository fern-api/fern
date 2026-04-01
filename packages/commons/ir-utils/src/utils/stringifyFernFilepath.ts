import { FernFilepath } from "@fern-api/ir-sdk";

import { getOriginalName } from "./namesUtils.js";

export function stringifyFernFilepath(fernFilepath: FernFilepath): string {
    return fernFilepath.allParts.map((part) => getOriginalName(part)).join("/");
}
