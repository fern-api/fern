import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { collectInferredAuthCredentials } from "../utils/inferredAuthUtils.js";

type AuthScheme = FernIr.AuthScheme;
type OAuthScheme = FernIr.OAuthScheme;

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
        const seenNames = new Set<string>();

        for (const scheme of this.context.ir.auth.schemes) {
            for (const prop of this.getPropertiesFromAuthScheme(scheme)) {
                if (!seenNames.has(prop.name)) {
                    class_.addField({
                        access: ast.Access.Public,
                        name: prop.pascalName,
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
                    name: pascalName,
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

    /**
     * Converts an auth scheme into options properties.
     * Mirrors the parameter extraction logic in RootClientGenerator.getParameterFromAuthScheme.
     */
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
            const oauth = this.context.getOauth();
            if (oauth == null) {
                return [];
            }
            const properties: Array<{ name: string; pascalName: string; docs: string }> = [
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
            // Include additional OAuth parameters (custom properties and scopes)
            properties.push(...this.getOAuthAdditionalProperties(scheme));
            return properties;
        } else if (scheme.type === "inferred") {
            const inferred = this.context.getInferredAuth();
            if (inferred == null) {
                return [];
            }
            return this.getInferredAuthProperties(inferred);
        }
        return [];
    }

    /**
     * Gets additional OAuth properties from custom token endpoint properties and scopes.
     * Mirrors the logic in RootClientGenerator.getOAuthAdditionalConstructorParams.
     */
    private getOAuthAdditionalProperties(
        scheme: OAuthScheme
    ): Array<{ name: string; pascalName: string; docs: string }> {
        const properties: Array<{ name: string; pascalName: string; docs: string }> = [];
        for (const customProperty of scheme.configuration.tokenEndpoint.requestProperties.customProperties ?? []) {
            if (this.isLiteralTypeReference(customProperty.property.valueType)) {
                continue;
            }
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: customProperty.property.valueType
            });
            if (typeRef.isOptional) {
                continue;
            }
            const name = customProperty.property.name.name.camelCase.safeName;
            const pascalName = customProperty.property.name.name.pascalCase.safeName;
            properties.push({
                name,
                pascalName,
                docs: `The ${name} for OAuth authentication.`
            });
        }
        const scopes = scheme.configuration.tokenEndpoint.requestProperties.scopes;
        if (scopes && !this.isLiteralTypeReference(scopes.property.valueType)) {
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: scopes.property.valueType
            });
            if (!typeRef.isOptional) {
                const name = scopes.property.name.name.camelCase.safeName;
                const pascalName = scopes.property.name.name.pascalCase.safeName;
                properties.push({
                    name,
                    pascalName,
                    docs: `The ${name} for OAuth authentication.`
                });
            }
        }
        return properties;
    }

    /**
     * Gets properties from inferred auth credentials.
     * Mirrors the logic in RootClientGenerator.getParameterFromAuthScheme for inferred type.
     */
    private getInferredAuthProperties(
        inferred: FernIr.InferredAuthScheme
    ): Array<{ name: string; pascalName: string; docs: string }> {
        const tokenEndpointReference = inferred.tokenEndpoint.endpoint;
        const tokenEndpointHttpService = this.context.getHttpService(tokenEndpointReference.serviceId);
        if (tokenEndpointHttpService == null) {
            return [];
        }
        const tokenEndpoint = this.context.resolveEndpoint(tokenEndpointHttpService, tokenEndpointReference.endpointId);
        const credentials = collectInferredAuthCredentials(this.context, tokenEndpoint);
        return credentials.map((credential) => ({
            name: credential.camelName,
            pascalName: credential.pascalName,
            docs: credential.docs ?? `The ${credential.camelName} for authentication.`
        }));
    }

    private isLiteralTypeReference(typeReference: FernIr.TypeReference): boolean {
        return typeReference.type === "container" && typeReference.container.type === "literal";
    }
}
