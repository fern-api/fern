import {
    Argument,
    ClassReference,
    ClassReferenceFactory,
    EnvironmentVariable,
    Expression,
    FunctionInvocation,
    Function_,
    Import,
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
    HttpHeader
} from "@fern-fern/ir-sdk/api";
import { isTypeOptional } from "./TypeUtilities";

export interface BasicAuth {
    username: string;
    password: string;
}
export interface BearerAuth {
    token: string;
}

// For global headers + auth headers
export class HeadersGenerator {
    public headers: HttpHeader[];
    public crf: ClassReferenceFactory;
    public auth: ApiAuth;

    public isAuthRequired: boolean;

    constructor(headers: HttpHeader[], crf: ClassReferenceFactory, auth: ApiAuth) {
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
    }

    // Get as parameters
    public getAdditionalHeadersAsParameters(): Parameter[] {
        return this.headers.map(
            (header) =>
                new Parameter({
                    name: header.name.name.snakeCase.safeName,
                    type: this.crf.fromTypeReference(header.valueType),
                    isOptional: isTypeOptional(header.valueType),
                    documentation: header.docs
                })
        );
    }

    public getAuthHeadersAsParameters(): Parameter[] {
        return this.auth.schemes.flatMap((scheme) =>
            scheme._visit<Parameter[]>({
                bearer: (bas: BearerAuthScheme) => [
                    new Parameter({
                        name: bas.token.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: this.isAuthRequired
                    })
                ],
                basic: (bas: BasicAuthScheme) => [
                    new Parameter({
                        name: bas.username.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: this.isAuthRequired
                    }),
                    new Parameter({
                        name: bas.password.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: this.isAuthRequired
                    })
                ],
                header: (has: HeaderAuthScheme) => [
                    new Parameter({
                        name: has.name.name.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: this.isAuthRequired
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

    public getAuthHeadersAsProperties(requireAuthOverride?: boolean): Property[] {
        return this.auth.schemes.flatMap((scheme) =>
            scheme._visit<Property[]>({
                bearer: (bas: BearerAuthScheme) => [
                    new Property({
                        name: bas.token.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: requireAuthOverride ?? this.isAuthRequired,
                        wireValue: "Authorization"
                    })
                ],
                basic: (bas: BasicAuthScheme) => [
                    new Property({
                        name: bas.username.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: requireAuthOverride ?? this.isAuthRequired
                    }),
                    new Property({
                        name: bas.password.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: requireAuthOverride ?? this.isAuthRequired
                    })
                ],
                header: (has: HeaderAuthScheme) => [
                    new Property({
                        name: has.name.name.snakeCase.safeName,
                        type: StringClassReference,
                        isOptional: requireAuthOverride ?? this.isAuthRequired,
                        wireValue: has.name.wireValue
                    })
                ],
                _other: () => {
                    throw new Error("Unrecognized auth scheme.");
                }
            })
        );
    }

    // Get as hash
    public getAdditionalHeaders(): [string, string][] {
        return this.headers.map((header) => [`"${header.name.wireValue}"`, header.name.name.snakeCase.safeName]);
    }

    private getBearerAuthorizationHeader(bas: BearerAuthScheme): [string, string] {
        const bearerValue =
            bas.tokenEnvVar !== undefined
                ? new Expression({
                      leftSide: bas.token.snakeCase.safeName,
                      rightSide: new EnvironmentVariable({ variableName: bas.tokenEnvVar }),
                      isAssignment: false,
                      operation: "||"
                  })
                : new Expression({ rightSide: bas.token.snakeCase.safeName, isAssignment: false });

        return ['"Authorization"', `Bearer #{${bearerValue.write()}}`];
    }

    private getBasicAuthorizationHeader(bas: BasicAuthScheme): [string, string] {
        const userName =
            bas.usernameEnvVar !== undefined
                ? new Expression({
                      leftSide: bas.username.snakeCase.safeName,
                      rightSide: new EnvironmentVariable({ variableName: bas.usernameEnvVar }),
                      isAssignment: false,
                      operation: "||"
                  })
                : new Expression({ rightSide: bas.username.snakeCase.safeName, isAssignment: false });
        const password =
            bas.passwordEnvVar !== undefined
                ? new Expression({
                      leftSide: bas.password.snakeCase.safeName,
                      rightSide: new EnvironmentVariable({ variableName: bas.passwordEnvVar }),
                      isAssignment: false,
                      operation: "||"
                  })
                : new Expression({ rightSide: bas.password.snakeCase.safeName, isAssignment: false });

        const b64 = new FunctionInvocation({
            onObject: new ClassReference({ name: "Base64", import_: new Import({ from: "base64", isExternal: true }) }),
            baseFunction: new Function_({ name: "encode64", functionBody: [] }),
            arguments_: [
                new Argument({
                    isNamed: false,
                    type: StringClassReference,
                    value: `"#{${userName.write()}}:#{${password.write()}}"`
                })
            ]
        });

        return ['"Authorization"', `Basic #{${b64.write()}}`];
    }

    // TODO: I don't love how this works, ideally it's a string to expression hash instead, but we don't
    // have string templates in the AST right now which is necessary for header prefixes
    private getCustomAuthorizationHeader(has: HeaderAuthScheme): [string, string] {
        const jsonValue = new FunctionInvocation({
            onObject: has.name.name.snakeCase.safeName,
            baseFunction: new Function_({ name: "to_json", functionBody: [] })
        });
        const headerValue =
            has.headerEnvVar !== undefined
                ? new Expression({
                      leftSide: jsonValue,
                      rightSide: new EnvironmentVariable({ variableName: has.headerEnvVar }),
                      isAssignment: false,
                      operation: "||"
                  })
                : new Expression({ rightSide: jsonValue, isAssignment: false });

        return [
            `"${has.name.wireValue}"`,
            `${has.prefix !== undefined ? has.prefix + " " : ""} #{${headerValue.write()}}`
        ];
    }

    public getAuthHeaders(): [string, string][] {
        return this.auth.schemes.map((scheme) =>
            scheme._visit<[string, string]>({
                bearer: (bas: BearerAuthScheme) => this.getBearerAuthorizationHeader(bas),
                basic: (bas: BasicAuthScheme) => this.getBasicAuthorizationHeader(bas),
                header: (has: HeaderAuthScheme) => this.getCustomAuthorizationHeader(has),
                _other: () => {
                    throw new Error("Unrecognized auth scheme.");
                }
            })
        );
    }
}
