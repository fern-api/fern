import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class EnumGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly classReference: ast.ClassReference;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
    ) {
        super(context);
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration);
    }

    protected doGenerate(): CSharpFile {
        const enum_ = this.csharp.enum_({
            ...this.classReference,
            access: ast.Access.Public,
            annotations: [
                this.csharp.annotation({
                    reference: this.extern.System.Text.Json.Serialization.JsonConverter(),
                    argument: this.csharp.codeblock((writer) => {
                        writer.write("typeof(");
                        writer.writeNode(this.csharp.classReferenceInternal(this.types.EnumSerializer));
                        writer.write("<");
                        writer.writeNode(this.classReference);
                        writer.write(">");
                        writer.write(")");
                    })
                })
            ]
        });

        this.enumDeclaration.values.forEach((member) =>
            enum_.addMember({ name: member.name.name.pascalCase.safeName, value: member.name.wireValue })
        );

        return new CSharpFile({
            clazz: enum_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
