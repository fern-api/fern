import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

export class BaseApiExceptionGenerator extends FileGenerator<CSharpFile> {
    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.BaseApiException,
            access: ast.Access.Public,
            parentClassReference: this.Types.BaseException,
            primaryConstructor: {
                parameters: [
                    this.csharp.parameter({ name: "message", type: this.Primitive.string }),
                    this.csharp.parameter({ name: "statusCode", type: this.Primitive.integer }),
                    this.csharp.parameter({ name: "body", type: this.Primitive.object })
                ],
                superClassArguments: [this.csharp.codeblock("message")]
            },
            summary: "This exception type will be thrown for any non-2XX API responses."
        });
        class_.addField({
            origin: class_.explicit("StatusCode"),
            enclosingType: class_,
            type: this.Primitive.integer,
            access: ast.Access.Public,
            get: true,
            initializer: this.csharp.codeblock("statusCode"),
            summary: "The error code of the response that triggered the exception."
        });

        class_.addField({
            origin: class_.explicit("Body"),
            enclosingType: class_,
            type: this.Primitive.object,
            access: ast.Access.Public,
            get: true,
            initializer: this.csharp.codeblock("body"),
            summary: "The body of the response that triggered the exception."
        });

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getPublicCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }
    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.publicCoreFiles,
            RelativeFilePath.of(`${this.Types.BaseApiException.name}.cs`)
        );
    }
}
