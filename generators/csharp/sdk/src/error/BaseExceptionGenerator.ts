import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

export class BaseExceptionGenerator extends FileGenerator<CSharpFile> {
    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.BaseException,
            access: ast.Access.Public,
            parentClassReference: this.System.Exception,
            primaryConstructor: {
                parameters: [
                    this.csharp.parameter({ name: "message", type: this.Primitive.string }),
                    this.csharp.parameter({
                        name: "innerException",
                        type: this.System.Exception.asOptional(),
                        initializer: "null"
                    })
                ],
                superClassArguments: [this.csharp.codeblock("message"), this.csharp.codeblock("innerException")]
            },
            summary: "Base exception class for all exceptions thrown by the SDK."
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
        return join(this.constants.folders.publicCoreFiles, RelativeFilePath.of(`${this.Types.BaseException.name}.cs`));
    }
}
