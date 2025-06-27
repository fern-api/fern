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
        const className = this.context.getPascalCaseSafeName(this.typeDeclaration.name.name);

        // Convert each union member to a Python type
        const unionTypes = this.undiscriminatedUnionDeclaration.members.map((member) => {
            return this.context.pythonTypeMapper.convert({ reference: member.type });
        });

        // Create a type alias using assignment: MyUnion = typing.Union[Type1, Type2, ...]
        const typeAlias = python.assign({
            lhs: python.codeBlock(className),
            rhs: python.codeBlock((writer) => {
                const unionType = python.Type.union(unionTypes);
                unionType.write(writer);
            })
        });

        const path = this.context.getModulePathForId(this.typeId);
        const filename = this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name);
        const file = python.file({ path });

        // Add docs as a comment if available
        if (this.typeDeclaration.docs != null) {
            file.addStatement(python.comment({ docs: this.typeDeclaration.docs }));
        }

        file.addStatement(typeAlias);

        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of(path.join("/")),
            filename
        });
    }
}
