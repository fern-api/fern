import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

type AuthScheme = FernIr.AuthScheme;

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
        return RelativeFilePath.of(`Extensions/${this.optionsClassName}.cs`);
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.csharp.classReference({
                name: this.optionsClassName,
                namespace: `${this.namespaces.root}.Extensions`
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
            directory: RelativeFilePath.of("Extensions"),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: `${this.namespaces.root}.Extensions`,
            generation: this.generation,
            fileHeader: "#if !NETFRAMEWORK",
            fileFooter: "#endif"
        });
    }

    private addAuthProperties(class_: ast.Class): void {
        const seenNames = new Set<string>();

        for (const scheme of this.context.ir.auth.schemes) {
            for (const prop of this.getPropertiesFromAuthScheme(scheme)) {
                if (!seenNames.has(prop.name)) {
                    class_.addField({
                        access: ast.Access.Public,
                        origin: class_.explicit(prop.pascalName),
                        type: this.Primitive.string.asOptional(),
                        get: true,
                        set: true,
                        summary: prop.docs
                    });
                    seenNames.add(prop.name);
                }
            }
        }

        // Also include global headers as options properties
        for (const header of this.context.ir.headers) {
            if (header.valueType.type === "container" && header.valueType.container.type === "literal") {
                continue; // Skip literal headers
            }
            const name = header.name.name.camelCase.safeName;
            const pascalName = header.name.name.pascalCase.safeName;
            if (!seenNames.has(name)) {
                class_.addField({
                    access: ast.Access.Public,
                    origin: class_.explicit(pascalName),
                    type: this.Primitive.string.asOptional(),
                    get: true,
                    set: true,
                    summary: header.docs ?? `The ${name} header value.`
                });
                seenNames.add(name);
            }
        }
    }

    private addClientConfigProperties(class_: ast.Class): void {
        // BaseUrl property
        class_.addField({
            access: ast.Access.Public,
            origin: class_.explicit("BaseUrl"),
            type: this.Primitive.string.asOptional(),
            get: true,
            set: true,
            summary: "The base URL for the API. If not specified, the default environment URL is used."
        });

        // MaxRetries property with default value
        class_.addField({
            access: ast.Access.Public,
            origin: class_.explicit("MaxRetries"),
            type: this.Primitive.integer,
            get: true,
            set: true,
            summary: "The maximum number of retries for failed requests. Defaults to 2.",
            initializer: this.csharp.codeblock("2")
        });

        // Timeout property with default value
        class_.addField({
            access: ast.Access.Public,
            origin: class_.explicit("Timeout"),
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

    private getPropertiesFromAuthScheme(scheme: AuthScheme): Array<{ name: string; pascalName: string; docs: string }> {
        if (scheme.type === "header") {
            const name = scheme.name.name.camelCase.safeName;
            const pascalName = scheme.name.name.pascalCase.safeName;
            return [
                {
                    name,
                    pascalName,
                    docs: scheme.docs ?? `The ${name} to use for authentication.`
                }
            ];
        } else if (scheme.type === "bearer") {
            const name = scheme.token.camelCase.safeName;
            const pascalName = scheme.token.pascalCase.safeName;
            return [
                {
                    name,
                    pascalName,
                    docs: scheme.docs ?? `The ${name} to use for authentication.`
                }
            ];
        } else if (scheme.type === "basic") {
            const usernameName = scheme.username.camelCase.safeName;
            const usernamePascal = scheme.username.pascalCase.safeName;
            const passwordName = scheme.password.camelCase.safeName;
            const passwordPascal = scheme.password.pascalCase.safeName;
            return [
                {
                    name: usernameName,
                    pascalName: usernamePascal,
                    docs: `The ${usernameName} to use for authentication.`
                },
                {
                    name: passwordName,
                    pascalName: passwordPascal,
                    docs: `The ${passwordName} to use for authentication.`
                }
            ];
        } else if (scheme.type === "oauth") {
            return [
                {
                    name: "clientId",
                    pascalName: "ClientId",
                    docs: "The client ID for OAuth authentication."
                },
                {
                    name: "clientSecret",
                    pascalName: "ClientSecret",
                    docs: "The client secret for OAuth authentication."
                }
            ];
        }
        return [];
    }
}
