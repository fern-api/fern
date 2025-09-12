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
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    protected doGenerate(): CSharpFile {
        const serializerAnnotation = this.csharp.annotation({
            reference: this.csharp.System.Text.Json.Serialization.JsonConverter(),
            argument: this.csharp.codeblock((writer) => {
                writer.write("typeof(");
                writer.writeNode(this.csharp.classReference(this.context.getEnumSerializerClassReference()));
                writer.write("<");
                writer.writeNode(this.classReference);
                writer.write(">");
                writer.write(")");
            })
        });

        const enum_ = this.csharp.enum_({
            ...this.classReference,
            access: ast.Access.Public,
            annotations: [serializerAnnotation]
        });

        this.enumDeclaration.values.forEach((member) =>
            enum_.addMember({ name: member.name.name.pascalCase.safeName, value: member.name.wireValue })
        );

        return new CSharpFile({
            clazz: enum_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
