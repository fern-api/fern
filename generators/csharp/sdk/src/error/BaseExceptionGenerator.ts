import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseExceptionGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.types.BaseException,
            access: ast.Access.Public,
            parentClassReference: this.extern.System.Exception,
            primaryConstructor: {
                parameters: [
                    this.csharp.parameter({ name: "message", type: this.csharp.Type.string }),
                    this.csharp.parameter({
                        name: "innerException",
                        type: this.csharp.Type.optional(this.csharp.Type.reference(this.extern.System.Exception)),
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
        return join(this.constants.folders.publicCoreFiles, RelativeFilePath.of(`${this.types.BaseException.name}.cs`));
    }
}
