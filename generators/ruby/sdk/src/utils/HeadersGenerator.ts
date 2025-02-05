import {
    Argument,
    ClassReference,
    ClassReferenceFactory,
    EnvironmentVariable,
    Expression,
    FunctionInvocation,
    Function_,
    Import,
    MethodClassReference,
    Parameter,
    Property,
    StringClassReference
} from "@fern-api/ruby-codegen";

import {
    ApiAuth,
    AuthSchemesRequirement,
    BasicAuthScheme,
    BearerAuthScheme,
    HeaderAuthScheme,
    HttpHeader,
    OAuthScheme
} from "@fern-fern/ir-sdk/api";

import { isTypeOptional } from "./TypeUtilities";
import { OauthTokenProvider } from "./oauth/OauthTokenProvider";

export interface BasicAuth {
    username: string;
    password: string;
}
export interface BearerAuth {
    token: string;
}

// For global headers + auth headers
export class HeadersGenerator {
    BASIC_AUTH_VARIABLE_NAME = "basic_auth_token";
    public headers: HttpHeader[];
    public crf: ClassReferenceFactory;
    public auth: ApiAuth;

    public isAuthRequired: boolean;
    public shouldGeneratOauth: boolean;

    constructor(headers: HttpHeader[], crf: ClassReferenceFactory, auth: ApiAuth, shouldGeneratOauth: boolean) {
        this.headers = headers;
        this.crf = crf;
        this.auth = auth;

        this.isAuthRequired = AuthSchemesRequirement._visit<boolean>(auth.requirement, {
            all: () => true,
            any: () => false,
            _other: () => {
                throw new Error("Unrecognized auth requirement.");
            }
        });
        this.shouldGeneratOauth = shouldGeneratOauth;
    }

    // Get as parameters
    public getAdditionalHeadersAsParameters(): Parameter[] {
        return this.headers.map(
            (header) =>
                new Parameter({
                    name: header.name.name.snakeCase.safeName,
                    type: this.crf.fromTypeReference(header.valueType),
                    isOptional: isTypeOptional(header.valueType),
                    documentation: header.docs,
                    // If the header is optional, let's not provide an example
                    example: isTypeOptional(header.valueType) ? undefined : `"${header.name.name.pascalCase.safeName}"`
                })
        );
    }

    public getAuthHeadersAsParameters(forRootClient: boolean): Parameter[] {
        return this.auth.schemes.flatMap((scheme) =>
            scheme._visit<Parameter[]>({
                bearer: (bas: BearerAuthScheme) => [
                    new Parameter({
                        name: bas.token.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: bas.tokenEnvVar !== undefined || !this.isAuthRequired,
                        example: '"YOUR_AUTH_TOKEN"',
                        defaultValue:
                            bas.tokenEnvVar != null
                                ? new EnvironmentVariable({ variableName: bas.tokenEnvVar })
                                : undefined
                    })
                ],
                basic: (bas: BasicAuthScheme) => [
                    new Parameter({
                        name: bas.username.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: bas.usernameEnvVar !== undefined || !this.isAuthRequired,
                        example: '"YOUR_USERNAME"',
                        defaultValue:
                            bas.usernameEnvVar != null
                                ? new EnvironmentVariable({ variableName: bas.usernameEnvVar })
                                : undefined
                    }),
                    new Parameter({
                        name: bas.password.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: bas.passwordEnvVar !== undefined || !this.isAuthRequired,
                        example: '"YOUR_PASSWORD"',
                        defaultValue:
                            bas.passwordEnvVar != null
                                ? new EnvironmentVariable({ variableName: bas.passwordEnvVar })
                                : undefined
                    })
                ],
                oauth: (oas: OAuthScheme) =>
                    this.shouldGeneratOauth
                        ? oas.configuration._visit<Parameter[]>({
                              clientCredentials: (cc) =>
                                  forRootClient
                                      ? [
                                            new Parameter({
                                                name: "client_id",
                                                type: StringClassReference,
                                                isOptional: cc.clientIdEnvVar !== undefined || !this.isAuthRequired,
                                                example: '"YOUR_CLIENT_ID"',
                                                defaultValue:
                                                    cc.clientIdEnvVar != null
                                                        ? new EnvironmentVariable({ variableName: cc.clientIdEnvVar })
                                                        : undefined
                                            }),
                                            new Parameter({
                                                name: "client_secret",
                                                type: StringClassReference,
                                                isOptional: cc.clientSecretEnvVar !== undefined || !this.isAuthRequired,
                                                example: '"YOUR_CLIENT_SECRET"',
                                                defaultValue:
                                                    cc.clientSecretEnvVar != null
                                                        ? new EnvironmentVariable({
                                                              variableName: cc.clientSecretEnvVar
                                                          })
                                                        : undefined
                                            })
                                        ]
                                      : [
                                            new Parameter({
                                                name: OauthTokenProvider.FIELD_NAME,
                                                type: [StringClassReference, MethodClassReference],
                                                isOptional: true
                                            })
                                        ],
                              _other: () => {
                                  throw new Error("Unrecognized auth scheme.");
                              }
                          })
                        : [
                              new Parameter({
                                  name: OauthTokenProvider.FIELD_NAME,
                                  type: StringClassReference,
                                  isOptional: !this.isAuthRequired,
                                  example: '"YOUR_AUTH_TOKEN"'
                              })
                          ],
                header: (has: HeaderAuthScheme) => [
                    new Parameter({
                        name: has.name.name.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: has.headerEnvVar !== undefined || !this.isAuthRequired,
                        example: `"YOUR_${has.name.name.screamingSnakeCase.safeName}"`,
                        defaultValue:
                            has.headerEnvVar != null
                                ? new EnvironmentVariable({ variableName: has.headerEnvVar })
                                : undefined
                    })
                ],
                _other: () => {
                    throw new Error("Unrecognized auth scheme.");
                }
            })
        );
    }

    // Get as properties
    public getAdditionalHeadersAsProperties(requireHeaderOverride?: boolean): Property[] {
        return this.headers.map(
            (header) =>
                new Property({
                    name: header.name.name.snakeCase.safeName,
                    type: this.crf.fromTypeReference(header.valueType),
                    isOptional: requireHeaderOverride ?? isTypeOptional(header.valueType),
                    wireValue: header.name.wireValue,
                    documentation: header.docs
                })
        );
    }

    public getAuthHeadersAsProperties(isOptionalOverride?: boolean): Property[] {
        return this.auth.schemes.flatMap((scheme) =>
            scheme._visit<Property[]>({
                bearer: (bas: BearerAuthScheme) => [
                    new Property({
                        name: bas.token.snakeCase.safeName,
                        type: StringClassReference,
                        // If you've overridden optionality, use that, otherwise:
                        //     If there's an envvar it should be optional
                        //     If there's not an envvar then check if auth is required
                        isOptional: isOptionalOverride ?? (bas.tokenEnvVar !== undefined || !this.isAuthRequired),
                        wireValue: "Authorization"
                    })
                ],
                basic: (bas: BasicAuthScheme) => [
                    new Property({
                        name: this.BASIC_AUTH_VARIABLE_NAME,
                        type: StringClassReference,
                        // If you've overridden optionality, use that, otherwise:
                        //     If there's an envvar it should be optional
                        //     If there's not an envvar then check if auth is required
                        isOptional:
                            isOptionalOverride ??
                            ((bas.usernameEnvVar !== undefined && bas.passwordEnvVar !== undefined) ||
                                !this.isAuthRequired),
                        wireValue: "Authorization"
                    })
                ],
                header: (has: HeaderAuthScheme) => [
                    new Property({
                        name: has.name.name.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: isOptionalOverride ?? (has.headerEnvVar !== undefined || !this.isAuthRequired),
                        wireValue: has.name.wireValue
                    })
                ],
                oauth: (_: OAuthScheme) => [
                    new Property({
                        name: OauthTokenProvider.FIELD_NAME,
                        type: [StringClassReference, MethodClassReference],
                        isOptional: true,
                        wireValue: "Authorization"
                    })
                ],
                _other: () => {
                    throw new Error("Unrecognized auth scheme.");
                }
            })
        );
    }

    // Get as hash
    // public getAdditionalHeaders(): [string, string][] {
    //     return this.headers.map((header) => [`"${header.name.wireValue}"`, header.name.name.snakeCase.safeName]);
    // }

    private getBearerAuthorizationHeader(bas: BearerAuthScheme): [string, string] {
        const bearerValue = new Expression({ rightSide: bas.token.snakeCase.safeName, isAssignment: false });
        return [`@${bas.token.snakeCase.safeName}`, `"Bearer #{${bearerValue.write({})}}"`];
    }

    private getOAuthBearerAuthorizationHeader(oas: OAuthScheme): [string, string] {
        // The meat of the logic for bearer auth happens within an oauth token provider, which passes
        // the get token function to the RequestClient, so this is just leveraging that.
        return this.shouldGeneratOauth
            ? oas.configuration._visit<[string, string]>({
                  clientCredentials: (cc) => {
                      // Note we're hardcoding to bearer auth and assuming that we're setting an `@token` property
                      return [
                          `@${OauthTokenProvider.FIELD_NAME}`,
                          cc.tokenPrefix != null
                              ? `"${cc.tokenPrefix} #{${OauthTokenProvider.FIELD_NAME}}"`
                              : OauthTokenProvider.FIELD_NAME
                      ];
                  },
                  _other: () => {
                      throw new Error("Unrecognized auth scheme.");
                  }
              })
            : [`@${OauthTokenProvider.FIELD_NAME}`, `"Bearer #{${OauthTokenProvider.FIELD_NAME}}"`];
    }

    private getBasicAuthorizationHeader(bas: BasicAuthScheme): [string, string] {
        const userName = new Expression({ rightSide: bas.username.snakeCase.safeName, isAssignment: false });
        const password = new Expression({ rightSide: bas.password.snakeCase.safeName, isAssignment: false });

        const b64 = new FunctionInvocation({
            onObject: new ClassReference({ name: "Base64", import_: new Import({ from: "base64", isExternal: true }) }),
            baseFunction: new Function_({ name: "encode64", functionBody: [] }),
            arguments_: [
                new Argument({
                    isNamed: false,
                    value: `'#{${userName.write({})}}:#{${password.write({})}}'`
                })
            ]
        });

        return [`@${this.BASIC_AUTH_VARIABLE_NAME}`, `"Basic #{${b64.write({})}}"`];
    }

    // TODO: I don't love how this works, ideally it's a string to expression hash instead, but we don't
    // have string templates in the AST right now which is necessary for header prefixes
    private getCustomAuthorizationHeader(has: HeaderAuthScheme): [string, string] {
        // TODO(P0): fix this, we need to know what actually needs to_json, strings do not
        // What other objects can go here, what would that look like?

        // const jsonValue = new FunctionInvocation({
        //     onObject: has.name.name.snakeCase.safeName,
        //     baseFunction: new Function_({ name: "to_json", functionBody: [] })
        // });
        const headerValue = new Expression({ rightSide: has.name.name.snakeCase.safeName, isAssignment: false });

        return [
            `@${has.name.name.snakeCase.safeName}`,
            has.prefix != null ? `"${has.prefix} #{${headerValue.write({})}}"` : headerValue.write({})
        ];
    }

    public getAuthHeaders(): [string, string][] {
        return this.auth.schemes.map((scheme) =>
            scheme._visit<[string, string]>({
                bearer: (bas: BearerAuthScheme) => this.getBearerAuthorizationHeader(bas),
                basic: (bas: BasicAuthScheme) => this.getBasicAuthorizationHeader(bas),
                header: (has: HeaderAuthScheme) => this.getCustomAuthorizationHeader(has),
                oauth: (oas: OAuthScheme) => this.getOAuthBearerAuthorizationHeader(oas),
                _other: () => {
                    throw new Error("Unrecognized auth scheme.");
                }
            })
        );
    }
}
