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
        // TODO(suyash): This currently only supports string enums. We should add support other basic types, and properly support multi-type enums as well.
        const enumClass = python.class_({
            name: this.context.getPascalCaseSafeName(this.typeDeclaration.name.name),
            docs: this.typeDeclaration.docs,
            extends_: [python.reference({ name: "str" }), python.reference({ name: "enum.Enum" })],
            decorators: []
        });

        // Add enum members
        for (const enumValue of this.enumDeclaration.values) {
            const memberName = enumValue.name.name.screamingSnakeCase.safeName;
            const wireValue = this.escapeStringForPython(enumValue.name.wireValue);

            enumClass.addField(
                python.field({
                    name: memberName,
                    initializer: python.codeBlock(wireValue),
                    docs: enumValue.docs
                })
            );
        }

        // TODO(suyash): Generate a visit function for the enum class.

        const path = this.context.getModulePathForId(this.typeId);
        const filename = this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name);
        const file = python.file({ path });
        file.addStatement(enumClass);

        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of(path.join("/")),
            filename
        });
    }

    private escapeStringForPython(value: string): string {
        // Use JSON.stringify to properly escape the string, then ensure it's a valid Python string
        const jsonEscaped = JSON.stringify(value);
        // JSON.stringify already handles quotes, backslashes, and special characters correctly
        return jsonEscaped;
    }
}
