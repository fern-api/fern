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
import { AuthScheme, BasicAuthScheme, BearerAuthScheme, HeaderAuthScheme, HttpHeader } from "@fern-fern/ir-sdk/api";
import { isTypeOptional } from "./TypeUtilities";

export interface BasicAuth {
    username: string;
    password: string;
}
export interface BearerAuth {
    token: string;
}

function getBearerAuthorizationHeader(bas: BearerAuthScheme): [string, string] {
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

function getBasicAuthorizationHeader(bas: BasicAuthScheme): [string, string] {
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

function getCustomAuthorizationHeader(has: HeaderAuthScheme): [string, string] {
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

    return [`"${has.name.wireValue}"`, `${has.prefix !== undefined ? has.prefix + " " : ""} #{${headerValue.write()}}`];
}

export function getAuthHeaders(scheme: AuthScheme): [string, string] {
    return scheme._visit<[string, string]>({
        bearer: (bas: BearerAuthScheme) => getBearerAuthorizationHeader(bas),
        basic: (bas: BasicAuthScheme) => getBasicAuthorizationHeader(bas),
        header: (has: HeaderAuthScheme) => getCustomAuthorizationHeader(has),
        _other: () => {
            throw new Error("Unrecognized auth scheme.");
        }
    });
}

export function getAuthHeadersAsParameters(scheme: AuthScheme, isOptional: boolean): Parameter[] {
    return scheme._visit<Parameter[]>({
        bearer: (bas: BearerAuthScheme) => [
            new Parameter({ name: bas.token.snakeCase.safeName, type: StringClassReference, isOptional })
        ],
        basic: (bas: BasicAuthScheme) => [
            new Parameter({ name: bas.username.snakeCase.safeName, type: StringClassReference, isOptional }),
            new Parameter({ name: bas.password.snakeCase.safeName, type: StringClassReference, isOptional })
        ],
        header: (has: HeaderAuthScheme) => [
            new Parameter({ name: has.name.name.snakeCase.safeName, type: StringClassReference, isOptional })
        ],
        _other: () => {
            throw new Error("Unrecognized auth scheme.");
        }
    });
}

export function getAuthHeadersAsProperties(scheme: AuthScheme, isOptional: boolean): Property[] {
    return scheme._visit<Property[]>({
        bearer: (bas: BearerAuthScheme) => [
            new Property({
                name: bas.token.snakeCase.safeName,
                type: StringClassReference,
                isOptional,
                wireValue: "Authorization"
            })
        ],
        basic: (bas: BasicAuthScheme) => [
            new Property({ name: bas.username.snakeCase.safeName, type: StringClassReference, isOptional }),
            new Property({ name: bas.password.snakeCase.safeName, type: StringClassReference, isOptional })
        ],
        header: (has: HeaderAuthScheme) => [
            new Property({
                name: has.name.name.snakeCase.safeName,
                type: StringClassReference,
                isOptional,
                wireValue: has.name.wireValue
            })
        ],
        _other: () => {
            throw new Error("Unrecognized auth scheme.");
        }
    });
}

export function getAdditionalHeadersAsParameters(headers: HttpHeader[], crf: ClassReferenceFactory): Parameter[] {
    return headers.map(
        (header) =>
            new Parameter({
                name: header.name.name.snakeCase.safeName,
                type: crf.fromTypeReference(header.valueType),
                isOptional: isTypeOptional(header.valueType),
                documentation: header.docs
            })
    );
}

export function getAdditionalHeadersAsProperties(headers: HttpHeader[], crf: ClassReferenceFactory): Property[] {
    return headers.map(
        (header) =>
            new Property({
                name: header.name.name.snakeCase.safeName,
                type: crf.fromTypeReference(header.valueType),
                isOptional: isTypeOptional(header.valueType),
                wireValue: header.name.wireValue,
                documentation: header.docs
            })
    );
}

export function getAdditionalHeaders(headers: HttpHeader[]): [string, string][] {
    return headers.map((header) => [`"${header.name.wireValue}"`, header.name.name.snakeCase.safeName]);
}
