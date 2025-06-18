import { RelativeFilePath } from "@fern-api/fs-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";

import { TypeDeclaration, TypeId, UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { PydanticModelGeneratorContext } from "../ModelGeneratorContext";

export class UndiscriminatedUnionGenerator {
    constructor(
        private readonly typeId: TypeId,
        private readonly context: PydanticModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration
    ) {}

    public doGenerate(): WriteablePythonFile {
        const path = this.context.getModulePathForId(this.typeId);
        const filename = this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name);
        const file = python.file({ path });

        // Add imports
        file.addReference(python.reference({ name: "Union", modulePath: ["typing"] }));

        // Add union type
        file.addStatement(
            python.codeBlock((writer) => {
                writer.write(`${this.context.getPascalCaseSafeName(this.typeDeclaration.name.name)} = `);
                writer.write("[");
                this.undiscriminatedUnionDeclaration.members.forEach((member, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    writer.write(this.context.pythonTypeMapper.convert({ reference: member.type }).toString());
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
