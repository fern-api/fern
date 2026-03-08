import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { extractAuthProperties } from "./authPropertyUtils.js";

/**
 * Generates {ClientName}Options.cs - a configuration options class for DI registration.
 *
 * This class contains:
 * - Auth parameters derived from the API's auth schemes (e.g., ApiKey, Token, Username/Password)
 * - Client configuration properties (BaseUrl, MaxRetries, Timeout)
 *
 * The options class supports binding from IConfiguration (appsettings.json) via the
 * Microsoft.Extensions.Options pattern.
 *
 * The generated code is wrapped in #if !NETFRAMEWORK to ensure
 * it only compiles for .NET Core targets.
 */
export class DependencyInjectionOptionsGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private readonly clientName: string;
    private readonly optionsClassName: string;

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.clientName = this.names.classes.rootClient;
        this.optionsClassName = `${this.clientName}Options`;
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of(`${this.optionsClassName}.cs`);
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.csharp.classReference({
                name: this.optionsClassName,
                namespace: this.namespaces.root
            }),
            access: ast.Access.Public,
            summary: `Configuration options for the <see cref="${this.clientName}"/> when using dependency injection.`
        });

        // Add auth properties from auth schemes
        this.addAuthProperties(class_);

        // Add client configuration properties
        this.addClientConfigProperties(class_);

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation,
            fileHeader: "#if !NETFRAMEWORK",
            fileFooter: "#endif"
        });
    }

    private addAuthProperties(class_: ast.Class): void {
        const properties = extractAuthProperties(this.context);
        for (const prop of properties) {
            class_.addField({
                access: ast.Access.Public,
                name: prop.pascalName,
                type: this.Primitive.string.asOptional(),
                get: true,
                set: true,
                summary: prop.docs
            });
        }
    }

    private addClientConfigProperties(class_: ast.Class): void {
        // BaseUrl property
        class_.addField({
            access: ast.Access.Public,
            name: "BaseUrl",
            type: this.Primitive.string.asOptional(),
            get: true,
            set: true,
            summary: "The base URL for the API. If not specified, the default environment URL is used."
        });

        // MaxRetries property with default value
        class_.addField({
            access: ast.Access.Public,
            name: "MaxRetries",
            type: this.Primitive.integer,
            get: true,
            set: true,
            summary: "The maximum number of retries for failed requests. Defaults to 2.",
            initializer: this.csharp.codeblock("2")
        });

        // Timeout property with default value
        class_.addField({
            access: ast.Access.Public,
            name: "Timeout",
            type: this.csharp.classReference({
                name: "TimeSpan",
                namespace: "System"
            }),
            get: true,
            set: true,
            summary: "The timeout for HTTP requests. Defaults to 30 seconds.",
            initializer: this.csharp.codeblock("TimeSpan.FromSeconds(30)")
        });
    }
}
