import { RubyFile } from "@fern-api/ruby-base";

import { AliasGenerator } from "./alias/AliasGenerator.js";
import { EnumGenerator } from "./enum/EnumGenerator.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { ObjectGenerator } from "./object/ObjectGenerator.js";
import { UndiscriminatedUnionGenerator } from "./union/UndiscriminatedUnionGenerator.js";
import { UnionGenerator } from "./union/UnionGenerator.js";

export function generateModels({ context }: { context: ModelGeneratorContext }): RubyFile[] {
    const files: RubyFile[] = [];
    for (const [_, typeDeclaration] of Object.entries(context.ir.types)) {
        const file = typeDeclaration.shape._visit<RubyFile | undefined>({
            alias: (atd) => {
                return new AliasGenerator(context, typeDeclaration, atd).generate();
            },
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
