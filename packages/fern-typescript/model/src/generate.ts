import { IntermediateRepresentation } from "@fern/ir-generation";
import { Project } from "ts-morph";
import { generateType } from "./types/generateType";
import { getFileNameForType } from "./utils/getFileNameForType";
import { TypeResolver } from "./utils/TypeResolver";

export function generateModelFiles(project: Project, ir: IntermediateRepresentation): void {
    const typeResolver = new TypeResolver(ir);
    for (const type of ir.types) {
        const file = project.createSourceFile(getFileNameForType(type.name));
        generateType({ file, type, typeResolver });
    }
}
