import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseApiExceptionGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getBaseApiExceptionClassReference(),
            access: "public",
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
                access: "public",
                get: true,
                initializer: csharp.codeblock("statusCode"),
                summary: "The error code of the response that triggered the exception."
            })
        );
        class_.addField(
            csharp.field({
                name: "Body",
                type: csharp.Type.object(),
                access: "public",
                get: true,
                initializer: csharp.codeblock("body"),
                summary: "The body of the response that triggered the exception."
            })
        );
        class_.addMethod(
            csharp.method({
                name: "ToString",
                access: "public",
                isAsync: false,
                parameters: [],
                override: true,
                body: csharp.codeblock(
                    `return $"${class_.name} {{ message: {Message}, statusCode: {StatusCode}, body: {Body} }}";`
                ),
                return_: csharp.Type.string()
            })
        );
        return new CSharpFile({
            clazz: class_,
            directory: this.context.getCoreDirectory()
        });
    }
    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getCoreFilesDirectory(),
            RelativeFilePath.of(`${this.context.getBaseApiExceptionClassReference().name}.cs`)
        );
    }
}
