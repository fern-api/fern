import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

export class CustomExceptionInterceptorGenerator extends FileGenerator<CSharpFile> {
    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.CustomExceptionInterceptor,
            access: ast.Access.Public,
            interfaceReferences: [this.Types.ExceptionInterceptor],
            summary: `Custom exception interceptor for the SDK. Implement the Intercept method to capture exceptions for observability (e.g., application monitoring platform, logging, etc.).`
        });

        class_.addField({
            access: ast.Access.Private,
            origin: class_.explicit("_clientOptions"),
            type: this.Types.ClientOptions,
            readonly: true
        });

        class_.addConstructor({
            access: ast.Access.Public,
            parameters: [
                this.csharp.parameter({
                    name: "clientOptions",
                    type: this.Types.ClientOptions
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine("_clientOptions = clientOptions;");
            })
        });

        class_.addMethod({
            name: "Intercept",
            access: ast.Access.Public,
            parameters: [
                this.csharp.parameter({
                    name: "exception",
                    type: this.System.Exception
                })
            ],
            return_: this.System.Exception,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine("// TODO: Implement your exception capturing logic here.");
                writer.writeLine("// Examples:");
                writer.writeLine("// - Send to application monitoring platform");
                writer.writeLine("// - Log to console: Console.Error.WriteLine(exception);");
                writer.writeLine("// - Send to custom logging service");
                writer.writeLine("return exception;");
            }),
            summary: "Intercepts an exception and returns it after capturing."
        });

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.core,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.coreFiles,
            RelativeFilePath.of(`${this.Types.CustomExceptionInterceptor.name}.cs`)
        );
    }
}
