import { RubyFile } from "@fern-api/ruby-base";

import { EnumGenerator } from "./enum/EnumGenerator";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object/ObjectGenerator";
import { UndiscriminatedUnionGenerator } from "./union/UndiscriminatedUnionGenerator";
import { UnionGenerator } from "./union/UnionGenerator";

export function generateModels({ context }: { context: ModelGeneratorContext }): RubyFile[] {
    const files: RubyFile[] = [];
    for (const [_, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<RubyFile | undefined>({
            alias: () => undefined,
            enum: (etd) => {
                return new EnumGenerator(context, typeDeclaration, etd).generate();
            },
            object: (otd) => {
                return new ObjectGenerator(context, typeDeclaration, otd).generate();
            },
            undiscriminatedUnion: (uutd) => {
                return new UndiscriminatedUnionGenerator(context, typeDeclaration, uutd).generate();
            },
            union: (utd) => {
                return new UnionGenerator(context, typeDeclaration, utd).generate();
            },
            _other: () => undefined
        });
        if (file != null) {
            files.push(file);
        }
    }
    return files;
}
