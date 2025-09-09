import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { csharp, System } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseExceptionGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getBaseExceptionClassReference(),
            access: csharp.Access.Public,
            parentClassReference: System.Exception,
            primaryConstructor: {
                parameters: [
                    csharp.parameter({ name: "message", type: csharp.Type.string() }),
                    csharp.parameter({
                        name: "innerException",
                        type: csharp.Type.optional(
                            csharp.Type.reference(System.Exception)
                        ),
                        initializer: "null"
                    })
                ],
                superClassArguments: [csharp.codeblock("message"), csharp.codeblock("innerException")]
            },
            summary: "Base exception class for all exceptions thrown by the SDK."
        });
        return new CSharpFile({
            clazz: class_,
            directory: this.context.getPublicCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }
    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getPublicCoreFilesDirectory(),
            RelativeFilePath.of(`${this.context.getBaseExceptionClassReference().name}.cs`)
        );
    }
}
