import { FernFilepath } from "@fern-fern/ir-model/commons";

export type StringifiedFernFilepath = string;

export function stringifyFernFilepath(fernFilepath: FernFilepath): StringifiedFernFilepath {
    return fernFilepath.map((part) => part.originalName).join("/");
}
