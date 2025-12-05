import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

export class CustomExceptionInterceptorGenerator extends FileGenerator<CSharpFile> {
    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.CustomExceptionInterceptor,
            access: ast.Access.Public,
            interfaceReferences: [this.Types.ExceptionInterceptor],
            summary: `Custom exception interceptor for the SDK. Implement the CaptureException method to capture exceptions for observability (e.g., Sentry, logging, etc.).`
        });

        class_.addMethod({
            name: "Intercept",
            access: ast.Access.Public,
            parameters: [this.csharp.parameter({ name: "exception", type: this.System.Exception })],
            return_: this.System.Exception,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine("CaptureException(exception);");
                writer.writeLine("return exception;");
            }),
            summary: "Intercepts an exception and returns it after capturing."
        });

        class_.addMethod({
            name: "CaptureException",
            access: ast.Access.Public,
            parameters: [this.csharp.parameter({ name: "exception", type: this.System.Exception })],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine("// TODO: Implement your exception capturing logic here.");
                writer.writeLine("// Examples:");
                writer.writeLine("// - Send to Sentry: SentrySdk.CaptureException(exception);");
                writer.writeLine("// - Log to console: Console.Error.WriteLine(exception);");
                writer.writeLine("// - Send to custom logging service");
            }),
            summary:
                "Captures an exception for observability without re-throwing. SDK authors should implement their exception capturing logic here."
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
