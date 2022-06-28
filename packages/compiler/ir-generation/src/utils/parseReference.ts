import { FernFilepath } from "@fern-fern/ir-model/types";
import path from "path";
import { convertToFernFilepath } from "./convertToFernFilepath";

export function parseReference({
    reference,
    fernFilepath,
    imports,
}: {
    reference: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): { fernFilepath: FernFilepath; referenceName: string } {
    const [firstPart, secondPart, ...rest] = reference.split(".");

    if (firstPart == null || rest.length > 0) {
        throw new Error(`Invalid reference: ${reference}`);
    }

    if (secondPart == null) {
        return {
            fernFilepath,
            referenceName: firstPart,
        };
    }

    const importAlias = firstPart;
    const importPath = imports[importAlias];
    if (importPath == null) {
        throw new Error(`Invalid reference: ${reference}. Package ${importAlias} not found.`);
    }

    return {
        fernFilepath: convertToFernFilepath(path.join(path.dirname(fernFilepath.toString()), importPath)),
        referenceName: secondPart,
    };
}
