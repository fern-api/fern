import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseApiExceptionGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getBaseApiExceptionClassReference(),
            access: csharp.Access.Public,
            parentClassReference: this.context.getBaseExceptionClassReference(),
            primaryConstructor: {
                parameters: [
                    csharp.parameter({ name: "message", type: csharp.Type.string() }),
                    csharp.parameter({ name: "statusCode", type: csharp.Type.integer() }),
                    csharp.parameter({ name: "body", type: csharp.Type.object() })
                ],
                superClassArguments: [csharp.codeblock("message")]
            },
            summary: "This exception type will be thrown for any non-2XX API responses."
        });
        class_.addField(
            csharp.field({
                name: "StatusCode",
                type: csharp.Type.integer(),
                access: csharp.Access.Public,
                get: true,
                initializer: csharp.codeblock("statusCode"),
                summary: "The error code of the response that triggered the exception."
            })
        );
        class_.addField(
            csharp.field({
                name: "Body",
                type: csharp.Type.object(),
                access: csharp.Access.Public,
                get: true,
                initializer: csharp.codeblock("body"),
                summary: "The body of the response that triggered the exception."
            })
        );
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
            RelativeFilePath.of(`${this.context.getBaseApiExceptionClassReference().name}.cs`)
        );
    }
}
