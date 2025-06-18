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

        // Track non-primitive types for imports
        const nonPrimitiveTypes: string[] = [];
        const pythonPrimitives = ["str", "int", "float", "bool", "list", "dict", "set", "tuple", "None"];

        // Add imports
        file.addStatement(
            python.codeBlock((writer) => {
                writer.write("import typing");
            })
        );

        this.undiscriminatedUnionDeclaration.members.forEach((member, index) => {
            const typeString = this.context.pythonTypeMapper.convert({ reference: member.type }).toString();
            if (!nonPrimitiveTypes.includes(typeString)) {
                nonPrimitiveTypes.push(typeString);
            }
        });

        // Add union type
        file.addStatement(
            python.codeBlock((writer) => {
                writer.write(`${this.context.getPascalCaseSafeName(this.typeDeclaration.name.name)} = `);
                writer.write("typing.Union[");
                this.undiscriminatedUnionDeclaration.members.forEach((member, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    const memberType = this.context.pythonTypeMapper.convert({ reference: member.type }).toString();
                    if (pythonPrimitives.includes(memberType)) {
                        writer.write(memberType);
                    } else {
                        writer.write(`typing.${memberType}`);
                    }
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
