import { RelativeFilePath } from "@fern-api/fs-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";

import { SingleUnionType, TypeDeclaration, TypeId, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { PydanticModelGeneratorContext } from "../ModelGeneratorContext";

export class UnionGenerator {
    constructor(
        private readonly typeId: TypeId,
        private readonly context: PydanticModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
    ) {}

    public doGenerate(): WriteablePythonFile {
        const path = this.context.getModulePathForId(this.typeId);
        const filename = this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name);
        const file = python.file({ path });

        // Add imports
        file.addStatement(python.starImport({ modulePath: "typing", names: ["Union"] }));
        file.addStatement(python.starImport({ modulePath: "typing_extensions", names: ["Literal"] }));

        // Generate variant classes
        this.unionDeclaration.types.forEach((variant: SingleUnionType) => {
            const variantClass = python.class_({
                name: `${this.context.getPascalCaseSafeName(this.typeDeclaration.name.name)}_${this.context.getPascalCaseSafeName(variant.name.name)}`,
                extends_: [
                    ...this.unionDeclaration.extends.map((type) =>
                        this.context.pythonTypeMapper.convertToClassReference(type)
                    ),
                    this.context.pythonTypeMapper.convertToClassReference(variant.type)
                ],
                fields: [
                    python.field({
                        name: this.unionDeclaration.discriminant.name,
                        type: python.typeHint.literal(variant.name.wireValue)
                    }),
                    ...this.unionDeclaration.baseProperties.map((prop) =>
                        python.field({
                            name: prop.name.name,
                            type: this.context.pythonTypeMapper.convertToTypeHint(prop.valueType)
                        })
                    )
                ]
            });

            // Add Config class
            variantClass.add(
                python.class_({
                    name: "Config",
                    fields: [
                        python.field({
                            name: "allow_population_by_field_name",
                            initializer: python.TypeInstantiation.bool(true)
                        })
                    ]
                })
            );

            file.addStatement(variantClass);
        });

        // Add union type
        file.addStatement(
            python.codeBlock((writer) => {
                writer.write(`${this.context.getPascalCaseSafeName(this.typeDeclaration.name.name)} = Union[`);
                this.unionDeclaration.types.forEach((variant, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    writer.write(
                        `${this.context.getPascalCaseSafeName(this.typeDeclaration.name.name)}_${this.context.getPascalCaseSafeName(variant.name.name)}`
                    );
                });
                writer.write("]");
            })
        );

        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of(path.join("/")),
            filename
        });
    }
}
