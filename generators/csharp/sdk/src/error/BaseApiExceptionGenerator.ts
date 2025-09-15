import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseApiExceptionGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            ...this.context.getBaseApiExceptionClassReference(),
            access: ast.Access.Public,
            parentClassReference: this.context.getBaseExceptionClassReference(),
            primaryConstructor: {
                parameters: [
                    this.csharp.parameter({ name: "message", type: this.csharp.Type.string() }),
                    this.csharp.parameter({ name: "statusCode", type: this.csharp.Type.integer() }),
                    this.csharp.parameter({ name: "body", type: this.csharp.Type.object() })
                ],
                superClassArguments: [this.csharp.codeblock("message")]
            },
            summary: "This exception type will be thrown for any non-2XX API responses."
        });
        class_.addField(
            this.csharp.field({
                name: "StatusCode",
                type: this.csharp.Type.integer(),
                access: ast.Access.Public,
                get: true,
                initializer: this.csharp.codeblock("statusCode"),
                summary: "The error code of the response that triggered the exception."
            })
        );
        class_.addField(
            this.csharp.field({
                name: "Body",
                type: this.csharp.Type.object(),
                access: ast.Access.Public,
                get: true,
                initializer: this.csharp.codeblock("body"),
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
