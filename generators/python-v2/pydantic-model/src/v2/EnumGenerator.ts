import { RelativeFilePath } from "@fern-api/fs-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";

import { EnumTypeDeclaration, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";

import { PydanticModelGeneratorContext } from "../ModelGeneratorContext";

export class EnumGenerator {
    constructor(
        private readonly typeId: TypeId,
        private readonly context: PydanticModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
    ) {}

    public doGenerate(): WriteablePythonFile {
        // For testing: write the word 'hello' to the file
        const path = this.context.getModulePathForId(this.typeId);
        const filename = this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name);
        const file = python.file({ path });
        file.addStatement(python.codeBlock("hello"));

        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of(path.join("/")),
            filename
        });
    }
}
