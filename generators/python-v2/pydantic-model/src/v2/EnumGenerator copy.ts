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
        const enum_ = python.enum_({
            name: this.context.getPascalCaseSafeName(this.typeDeclaration.name.name),
            values: this.enumDeclaration.values.map((value) => ({
                name: this.context.getPascalCaseSafeName(value.name.name),
                value: value.name.wireValue
            }))
        });

        const path = this.context.getModulePathForId(this.typeId);
        const filename = this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name);
        const file = python.file({ path });
        file.addStatement(enum_);

        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of(path.join("/")),
            filename
        });
    }
}
