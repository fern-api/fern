import { FernFilepath } from "@fern-fern/ir-model";
import { camelCase } from "lodash-es";
import path from "path";

export function getFilepathForFernFilepath(fernFilepath: FernFilepath): string {
    return path.join(...fernFilepath.map((item) => camelCase(item)));
}
