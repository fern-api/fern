import { assertNeverNoThrow } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace AuthClassGenerator {
    interface Args {
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
 * when the `typed-auth` feature flag is enabled.
 *
 * The generated file contains an abstract `Auth` base with a private constructor
 * that prevents external subclassing (only the nested sealed subclasses can
 * derive from it), plus one sealed subclass per auth scheme declared in the IR:
 *   - `Auth.ClientCredentials` for the OAuth client-credentials flow. The SDK
 *     fetches and refreshes tokens automatically. Required, non-literal custom
 *     properties on the OAuth token endpoint (e.g. `audience`, `scopes`) are
 *     surfaced as additional required init-only properties.
 *   - `Auth.Bearer` for a pre-fetched bearer token (the OAuth escape hatch, or
 *     a stand-alone bearer scheme).
 *   - `Auth.ApiKey` for a header-based API key.
 *   - `Auth.Basic` for HTTP basic auth.
 *
 * All subclasses use `required init` properties so callers construct via
 * object-initializer syntax (`new Auth.ApiKey { Value = "..." }`).
 */
export class AuthClassGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private readonly classReference: ast.ClassReference;

    constructor({ context }: AuthClassGenerator.Args) {
        super(context);
        this.classReference = this.Types.Auth;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.classReference,
            access: ast.Access.Public,
            abstract_: true,
            summary:
                "Authentication option for the SDK.\nPass one of the sealed `Auth` subclasses (`Auth.ClientCredentials`, `Auth.Bearer`, `Auth.ApiKey`, `Auth.Basic`) appropriate to the API's auth scheme."
        });

        // Private constructor: nested types have full access to the enclosing
        // type's private members in C#, so this still allows the sealed
        // subclasses below to call `: base()` while preventing external
        // subclassing of `Auth`.
        class_.addConstructor({
            access: ast.Access.Private
        });

        const oauthScheme = this.findOAuthScheme();
        let emittedBearer = false;

        if (oauthScheme != null) {
            this.addClientCredentialsClass(class_, oauthScheme);
            this.addBearerClass(class_);
            emittedBearer = true;
        }

        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "bearer":
                    if (!emittedBearer) {
                        this.addBearerClass(class_);
                        emittedBearer = true;
                    }
                    break;
                case "basic":
                    this.addBasicClass(class_);
                    break;
                case "header":
                    this.addApiKeyClass(class_);
                    break;
                case "oauth":
                case "inferred":
                    // oauth handled above; inferred is not supported by typed-auth.
                    break;
                default:
                    // Forward-compatible: ignore unknown scheme variants.
                    assertNeverNoThrow(scheme);
                    break;
            }
        }

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

    private findOAuthScheme(): FernIr.OAuthScheme | undefined {
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type === "oauth") {
                return scheme;
            }
        }
        return undefined;
    }

    /**
     * Custom properties (other than clientId/clientSecret) that are required to
     * fetch a token. Literal-valued properties are skipped because they are
     * hard-coded in the request class. Optional properties are skipped to keep
     * the constructor focused on required inputs.
     */
    public getClientCredentialsExtraParams(scheme: FernIr.OAuthScheme): ClientCredentialsParam[] {
        const params: ClientCredentialsParam[] = [];
        for (const customProperty of scheme.configuration.tokenEndpoint.requestProperties.customProperties ?? []) {
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

    private addClientCredentialsClass(parent: ast.Class, scheme: FernIr.OAuthScheme): void {
        const subClass = this.csharp.class_({
            name: this.Types.AuthClientCredentials.name,
            enclosingType: parent.reference,
            access: ast.Access.Public,
            sealed: true,
            parentClassReference: parent.reference,
            summary:
                "Authenticate using OAuth client credentials.\nThe SDK exchanges the client id/secret for an access token automatically and refreshes it as needed."
        });

        const extraParams = this.getClientCredentialsExtraParams(scheme);

        // Required init-only properties: callers populate via object initializer
        // syntax (`new Auth.ClientCredentials { ClientId = ..., ClientSecret = ... }`).
        subClass.addField({
            name: "ClientId",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            init: true,
            useRequired: true,
            summary: "The clientId used to fetch OAuth access tokens."
        });
        subClass.addField({
            name: "ClientSecret",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            init: true,
            useRequired: true,
            summary: "The clientSecret used to fetch OAuth access tokens."
        });
        for (const param of extraParams) {
            subClass.addField({
                name: param.propertyName,
                access: ast.Access.Public,
                type: param.type,
                get: true,
                init: true,
                useRequired: true,
                summary: param.docs
            });
        }

        parent.addNestedClass(subClass);
    }

    private addBearerClass(parent: ast.Class): void {
        const subClass = this.csharp.class_({
            name: this.Types.AuthBearer.name,
            enclosingType: parent.reference,
            access: ast.Access.Public,
            sealed: true,
            parentClassReference: parent.reference,
            summary: "Authenticate using a pre-fetched bearer token sent in the Authorization header."
        });

        subClass.addField({
            name: "Token",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            init: true,
            useRequired: true,
            summary: "The bearer token sent in the Authorization header."
        });

        parent.addNestedClass(subClass);
    }

    private addApiKeyClass(parent: ast.Class): void {
        const subClass = this.csharp.class_({
            name: this.Types.AuthApiKey.name,
            enclosingType: parent.reference,
            access: ast.Access.Public,
            sealed: true,
            parentClassReference: parent.reference,
            summary: "Authenticate using a header-based API key."
        });

        subClass.addField({
            name: "Value",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            init: true,
            useRequired: true,
            summary: "The API key value sent in the auth header."
        });

        parent.addNestedClass(subClass);
    }

    private addBasicClass(parent: ast.Class): void {
        const subClass = this.csharp.class_({
            name: this.Types.AuthBasic.name,
            enclosingType: parent.reference,
            access: ast.Access.Public,
            sealed: true,
            parentClassReference: parent.reference,
            summary: "Authenticate using HTTP basic auth (username + password)."
        });

        subClass.addField({
            name: "Username",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            init: true,
            useRequired: true,
            summary: "The username used for HTTP basic auth."
        });
        subClass.addField({
            name: "Password",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            init: true,
            useRequired: true,
            summary: "The password used for HTTP basic auth."
        });

        parent.addNestedClass(subClass);
    }
}
