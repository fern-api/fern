import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseExceptionGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getBaseExceptionClassReference(),
            access: csharp.Access.Public,
            parentClassReference: csharp.classReference({ name: "Exception", namespace: "System" }),
            primaryConstructor: {
                parameters: [
                    csharp.parameter({ name: "message", type: csharp.Type.string() }),
                    csharp.parameter({
                        name: "innerException",
                        type: csharp.Type.optional(
                            csharp.Type.reference(csharp.classReference({ name: "Exception", namespace: "System" }))
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
