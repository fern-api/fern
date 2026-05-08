import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace AuthClassGenerator {
    interface Args {
        scheme: FernIr.OAuthScheme;
        context: SdkGeneratorContext;
    }
}

interface ClientCredentialsParam {
    name: string;
    propertyName: string;
    type: ast.Type;
    docs?: string;
}

/**
 * Generates the public `Auth` abstract class hierarchy used by the root client
 * when the `auth-class-hierarchy` feature flag is enabled.
 *
 * The generated file contains:
 *   - `Auth`: abstract base with a private constructor that prevents external
 *     subclassing (only the nested sealed subclasses can derive from it).
 *   - `Auth.ClientCredentials`: sealed subclass for the OAuth client-credentials
 *     flow. The SDK fetches and refreshes tokens automatically.
 *   - `Auth.Bearer`: sealed subclass for a pre-fetched bearer token, bypassing
 *     OAuth entirely. This is the harder-to-find escape hatch.
 *
 * Any required, non-literal custom properties on the OAuth token endpoint
 * (e.g. `audience`, `scopes`) are propagated as additional constructor
 * parameters and read-only properties on `Auth.ClientCredentials`.
 */
export class AuthClassGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private readonly scheme: FernIr.OAuthScheme;
    private readonly classReference: ast.ClassReference;

    constructor({ context, scheme }: AuthClassGenerator.Args) {
        super(context);
        this.scheme = scheme;
        this.classReference = this.Types.Auth;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.classReference,
            access: ast.Access.Public,
            abstract_: true,
            summary:
                "Authentication option for the SDK.\nUse `Auth.ClientCredentials` for the OAuth client-credentials flow (recommended) or `Auth.Bearer` to supply a pre-fetched bearer token."
        });

        // Private constructor: nested types have full access to the enclosing
        // type's private members in C#, so this still allows the sealed
        // subclasses below to call `: base()` while preventing external
        // subclassing of `Auth`.
        class_.addConstructor({
            access: ast.Access.Private
        });

        this.addClientCredentialsClass(class_);
        this.addBearerClass(class_);

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getPublicCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.publicCore,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.publicCoreFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }

    /**
     * Custom properties (other than clientId/clientSecret) that are required to
     * fetch a token. Literal-valued properties are skipped because they are
     * hard-coded in the request class. Optional properties are skipped to keep
     * the constructor focused on required inputs.
     */
    public getClientCredentialsExtraParams(): ClientCredentialsParam[] {
        const params: ClientCredentialsParam[] = [];
        for (const customProperty of this.scheme.configuration.tokenEndpoint.requestProperties.customProperties ?? []) {
            if (
                customProperty.property.valueType.type === "container" &&
                customProperty.property.valueType.container.type === "literal"
            ) {
                continue;
            }
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: customProperty.property.valueType
            });
            if (typeRef.isOptional) {
                continue;
            }
            params.push({
                name: this.case.camelSafe(customProperty.property.name),
                propertyName: this.case.pascalSafe(customProperty.property.name),
                type: typeRef,
                docs: `The ${this.case.camelSafe(customProperty.property.name)} for OAuth authentication.`
            });
        }
        return params;
    }

    private addClientCredentialsClass(parent: ast.Class): void {
        const subClass = this.csharp.class_({
            name: this.Types.AuthClientCredentials.name,
            enclosingType: parent.reference,
            access: ast.Access.Public,
            sealed: true,
            parentClassReference: parent.reference,
            summary:
                "Authenticate using OAuth client credentials.\nThe SDK exchanges the client id/secret for an access token automatically and refreshes it as needed."
        });

        const extraParams = this.getClientCredentialsExtraParams();

        // Read-only properties for each constructor parameter.
        subClass.addField({
            name: "ClientId",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            summary: "The clientId used to fetch OAuth access tokens."
        });
        subClass.addField({
            name: "ClientSecret",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            summary: "The clientSecret used to fetch OAuth access tokens."
        });
        for (const param of extraParams) {
            subClass.addField({
                name: param.propertyName,
                access: ast.Access.Public,
                type: param.type,
                get: true,
                summary: param.docs
            });
        }

        subClass.addConstructor({
            access: ast.Access.Public,
            parameters: [
                this.csharp.parameter({ name: "clientId", type: this.Primitive.string }),
                this.csharp.parameter({ name: "clientSecret", type: this.Primitive.string }),
                ...extraParams.map((param) => this.csharp.parameter({ name: param.name, type: param.type }))
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement("ClientId = clientId ?? throw new ArgumentNullException(nameof(clientId))");
                writer.writeTextStatement(
                    "ClientSecret = clientSecret ?? throw new ArgumentNullException(nameof(clientSecret))"
                );
                for (const param of extraParams) {
                    if (this.isReferenceTypeForNullCheck(param.type)) {
                        writer.writeTextStatement(
                            `${param.propertyName} = ${param.name} ?? throw new ArgumentNullException(nameof(${param.name}))`
                        );
                    } else {
                        writer.writeTextStatement(`${param.propertyName} = ${param.name}`);
                    }
                }
            })
        });

        parent.addNestedClass(subClass);
    }

    private addBearerClass(parent: ast.Class): void {
        const subClass = this.csharp.class_({
            name: this.Types.AuthBearer.name,
            enclosingType: parent.reference,
            access: ast.Access.Public,
            sealed: true,
            parentClassReference: parent.reference,
            summary:
                "Authenticate using a pre-fetched bearer token, bypassing the OAuth flow.\nUse this when callers manage token acquisition out-of-band; the SDK will not refresh the token."
        });

        subClass.addField({
            name: "Token",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            summary: "The bearer token sent in the Authorization header."
        });

        subClass.addConstructor({
            access: ast.Access.Public,
            parameters: [this.csharp.parameter({ name: "token", type: this.Primitive.string })],
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement("Token = token ?? throw new ArgumentNullException(nameof(token))");
            })
        });

        parent.addNestedClass(subClass);
    }

    /**
     * Returns true when the type is a reference type and therefore eligible for
     * a `?? throw new ArgumentNullException(...)` null check. Value types (int,
     * bool, etc.) are non-nullable in C# and don't need the guard.
     */
    private isReferenceTypeForNullCheck(type: ast.Type): boolean {
        return type.isReferenceType !== false;
    }
}
