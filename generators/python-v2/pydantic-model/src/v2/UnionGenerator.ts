import { RelativeFilePath } from "@fern-api/fs-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";

import { Literal, SingleUnionType, TypeDeclaration, TypeId, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

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
        file.addReference(python.reference({ name: "Union", modulePath: ["typing"] }));

        // Generate variant classes
        this.unionDeclaration.types.forEach((variant: SingleUnionType) => {
            file.addReference(
                python.reference({
                    name: `${this.context.getPascalCaseSafeName(variant.discriminantValue.name)}`,
                    modulePath: [`.${this.context.getPascalCaseSafeName(variant.discriminantValue.name).toLowerCase()}`]
                })
            );
            const variantClass = python.class_({
                name: `${this.context.getPascalCaseSafeName(this.typeDeclaration.name.name)}_${this.context.getPascalCaseSafeName(variant.discriminantValue.name)}(${this.context.getPascalCaseSafeName(variant.discriminantValue.name)})`,
                extends_: [
                    ...this.unionDeclaration.extends.map((type) =>
                        this.context.pythonTypeMapper.convertToClassReference(type)
                    )
                ]
            });

            // Add the literal type field
            variantClass.add(
                python.field({
                    name: this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name),
                    type: python.Type.literal(
                        `${this.context.getPascalCaseSafeName(variant.discriminantValue.name).toLowerCase()}`
                    )
                })
            );

            variantClass.add(this.getConfigClass());

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
                        `${this.context.getPascalCaseSafeName(this.typeDeclaration.name.name)}_${this.context.getPascalCaseSafeName(variant.discriminantValue.name)}`
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

    private getConfigClass(): python.Class {
        const configClass = python.class_({
            name: "Config"
        });

        configClass.addField(
            python.field({
                name: "allow_population_by_field_name",
                initializer: python.TypeInstantiation.bool(true)
            })
        );

        return configClass;
    }
}
