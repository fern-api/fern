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
        const className = this.context.getPascalCaseSafeName(this.typeDeclaration.name.name);

        const enumClass = python.class_({
            name: className,
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

        // Add visit method
        enumClass.add(python.codeBlock(""));
        enumClass.add(this.generateVisitMethod(className));

        const path = this.context.getModulePathForId(this.typeId);
        const filename = this.context.getSnakeCaseSafeName(this.typeDeclaration.name.name);
        const file = python.file({ path });

        // Add T_Result type variable
        file.addStatement(python.codeBlock('T_Result = typing.TypeVar("T_Result")'));
        file.addStatement(enumClass);

        return new WriteablePythonFile({
            contents: file,
            directory: RelativeFilePath.of(path.join("/")),
            filename
        });
    }

    private generateVisitMethod(className: string): python.Method {
        const visitMethod = python.method({
            name: "visit",
            parameters: [
                python.parameter({
                    name: "self",
                    type: undefined
                }),
                ...this.enumDeclaration.values.map((enumValue) => {
                    const parameterName = enumValue.name.name.snakeCase.safeName;
                    return python.parameter({
                        name: parameterName,
                        type: python.Type.reference(
                            python.reference({
                                name: "typing.Callable[[], T_Result]"
                            })
                        )
                    });
                })
            ],
            return_: python.Type.reference(
                python.reference({
                    name: "T_Result"
                })
            )
        });

        // Add if statements for each enum value
        for (const enumValue of this.enumDeclaration.values) {
            const memberName = enumValue.name.name.screamingSnakeCase.safeName;
            const parameterName = enumValue.name.name.snakeCase.safeName;

            visitMethod.addStatement(
                python.codeBlock((writer) => {
                    writer.write(`if self is ${className}.${memberName}:`);
                    writer.write("\n");
                    writer.write(`    return ${parameterName}()`);
                })
            );
        }

        return visitMethod;
    }

    private escapeStringForPython(value: string): string {
        // Use JSON.stringify to properly escape the string, then ensure it's a valid Python string
        const jsonEscaped = JSON.stringify(value);
        // JSON.stringify already handles quotes, backslashes, and special characters correctly
        return jsonEscaped;
    }
}
