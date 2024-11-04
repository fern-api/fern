import { WriteablePythonFile } from "@fern-api/base-python-generator";
import { TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";
import { PydanticModelGeneratorContext } from "../ModelGeneratorContext";
import { ObjectGenerator } from "./ObjectGenerator";

export function generateV2Models({ context }: { context: PydanticModelGeneratorContext }): WriteablePythonFile[] {
    const files: WriteablePythonFile[] = [];
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<WriteablePythonFile | undefined>({
            alias: () => undefined,
            enum: () => undefined,
            object: (otd) => {
                return new ObjectGenerator(typeId as TypeId, context, typeDeclaration, otd).doGenerate();
            },
            undiscriminatedUnion: () => undefined,
            union: () => undefined,
            _other: () => undefined
        });
        if (file != null) {
            files.push(file);
        }
    }
    return files;
}
