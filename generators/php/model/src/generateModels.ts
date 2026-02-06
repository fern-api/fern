import { PhpFile } from "@fern-api/php-base";
import { FernIr } from "@fern-fern/ir-sdk";

import { EnumGenerator } from "./enum/EnumGenerator.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { ObjectGenerator } from "./object/ObjectGenerator.js";
import { UnionGenerator } from "./union/UnionGenerator.js";

export function generateModels(context: ModelGeneratorContext): void {
    for (const typeDeclaration of Object.values(context.ir.types)) {
        const file = typeDeclaration.shape._visit<PhpFile | undefined>({
            alias: () => undefined,
            enum: (enumDeclaration: FernIr.EnumTypeDeclaration) => {
                return new EnumGenerator(context, typeDeclaration, enumDeclaration).generate();
            },
            object: (objectDeclaration) => {
                return new ObjectGenerator(context, typeDeclaration, objectDeclaration).generate();
            },
            undiscriminatedUnion: () => undefined,
            union: (unionTypeDeclaration) => {
                return new UnionGenerator(context, typeDeclaration, unionTypeDeclaration).generate();
            },
            _other: () => undefined
        });
        if (file != null) {
            context.project.addSourceFiles(file);
        }
    }
}
