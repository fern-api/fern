import { IntermediateRepresentation } from "@fernapi/ir-generation";
import { Directory } from "ts-morph";
import { generateType } from "./types/generateType";
import { TypeResolver } from "./utils/TypeResolver";

export function generateModelFiles({
    directory,
    intermediateRepresentation,
}: {
    directory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
}): void {
    const typeResolver = new TypeResolver(intermediateRepresentation);
    for (const type of intermediateRepresentation.types) {
        generateType({ type, typeResolver, directory });
    }
}
