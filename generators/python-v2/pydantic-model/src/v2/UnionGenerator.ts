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
        file.addReference(python.reference({ name: "Union", modulePath: ["typing"] }));
        file.addReference(python.reference({ name: "Literal", modulePath: ["typing_extensions"] }));

        // Generate variant classes
        this.unionDeclaration.types.forEach((variant: SingleUnionType) => {
            const variantClass = python.class_({
                name: "name",
                extends_: [
                    ...this.unionDeclaration.extends.map((type) =>
                        this.context.pythonTypeMapper.convertToClassReference(type)
                    )
                    //this.context.pythonTypeMapper.convertToClassReference(variant.type)
                ]
            });

            // Add Config class
            variantClass.add(
                python.class_({
                    name: "Config"
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
                    writer.write("name");
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
