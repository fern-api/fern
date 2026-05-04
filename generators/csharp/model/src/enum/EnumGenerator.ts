import { getWireValue } from "@fern-api/base-generator";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";

type EnumTypeDeclaration = FernIr.EnumTypeDeclaration;
type TypeDeclaration = FernIr.TypeDeclaration;

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class EnumGenerator extends FileGenerator<CSharpFile, ModelGeneratorContext> {
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
            access: ast.Access.Public
        });

        // Enable per-enum serializer generation (no reflection)
        const serializerRef = enum_.enableSerializerGeneration();

        // Add JsonConverter annotation pointing to the generated serializer
        enum_.addAnnotation(
            this.csharp.annotation({
                reference: this.System.Text.Json.Serialization.JsonConverter(),
                argument: this.csharp.codeblock((writer: Writer) => {
                    writer.write("typeof(");
                    writer.writeNode(this.csharp.classReferenceInternal(serializerRef));
                    writer.write(")");
                })
            })
        );

        this.enumDeclaration.values.forEach((member) =>
            enum_.addMember({
                name: this.case.pascalSafe(member.name),
                value: getWireValue(member.name)
            })
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
