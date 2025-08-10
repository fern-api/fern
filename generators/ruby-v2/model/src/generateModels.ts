import { RubyFile } from "@fern-api/ruby-base";

import { ObjectGenerator } from "./object/ObjectGenerator";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export function generateModels({ context }: { context: ModelGeneratorContext }): RubyFile[] {
    const files: RubyFile[] = [];
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<RubyFile | undefined>({
            alias: () => undefined,
            enum: () => undefined,
            object: (otd) => {
                return new ObjectGenerator(context, typeDeclaration, otd).generate();
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
