import { ApiAuth, AuthScheme } from "@fern-fern/ir-model/auth";
import { TypeReference } from "@fern-fern/ir-model/types";
import { createPropertyAssignment } from "@fern-typescript/commons-v2";
import { CoreUtilities, ParsedAuthSchemes } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";

const AUTHORIZATION_HEADER_NAME = "Authorization";

type HeaderName = string;

interface ParsedAuthSchemeProperty {
    propertyName: string;
    getType: () => ts.TypeNode;
}

export function parseAuthSchemes({
    apiAuth,
    coreUtilities,
    getReferenceToType,
}: {
    apiAuth: ApiAuth;
    coreUtilities: CoreUtilities;
    getReferenceToType: (typeReference: TypeReference) => ts.TypeNode;
}): ParsedAuthSchemes {
    const headerNameToAuthSchemes = apiAuth.schemes.reduce<Record<HeaderName, AuthScheme[]>>((acc, scheme) => {
        const headerName = AuthScheme._visit(scheme, {
            bearer: () => AUTHORIZATION_HEADER_NAME,
            basic: () => AUTHORIZATION_HEADER_NAME,
            header: (header) => header.name.wireValue,
            _unknown: () => {
                throw new Error("Unknkown auth scheme: " + scheme._type);
            },
        });
        (acc[headerName] ??= []).push(scheme);
        return acc;
    }, {});

    const getPropertyForAuthScheme = (scheme: AuthScheme) =>
        AuthScheme._visit<ParsedAuthSchemeProperty>(scheme, {
            bearer: () => {
                return {
                    propertyName: "token",
                    getType: () => coreUtilities.auth.BearerToken._getReferenceToType(),
                };
            },
            basic: () => {
                return {
                    propertyName: "credentials",
                    getType: () => coreUtilities.auth.BasicAuth._getReferenceToType(),
                };
            },
            header: (header) => {
                const propertyName = header.name.camelCase;
                return {
                    propertyName,
                    getType: () => getReferenceToType(header.valueType),
                };
            },
            _unknown: () => {
                throw new Error("Unknown auth scheme: " + scheme._type);
            },
        });

    const getReferenceToProperty = ({
        nodeWithAuthProperties,
        scheme,
    }: {
        nodeWithAuthProperties: ts.Expression;
        scheme: AuthScheme;
    }): ts.Expression => {
        return coreUtilities.fetcher.Supplier.get(
            ts.factory.createPropertyAccessChain(
                nodeWithAuthProperties,
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                getPropertyForAuthScheme(scheme).propertyName
            )
        );
    };

    const getValueForHeader = ({
        nodeWithAuthProperties,
        authSchemesForHeader,
    }: {
        nodeWithAuthProperties: ts.Expression;
        authSchemesForHeader: AuthScheme[];
    }) => {
        const [firstHeaderValue, ...remainingHeaderValues] = authSchemesForHeader.map((scheme) => {
            const referenceToProperty = getReferenceToProperty({
                nodeWithAuthProperties,
                scheme,
            });
            return AuthScheme._visit(scheme, {
                bearer: () => coreUtilities.auth.BearerToken.toAuthorizationHeader(referenceToProperty),
                basic: () => coreUtilities.auth.BasicAuth.toAuthorizationHeader(referenceToProperty),
                header: () => referenceToProperty,
                _unknown: () => {
                    throw new Error("Unknown auth scheme: " + scheme._type);
                },
            });
        });

        if (firstHeaderValue == null) {
            return ts.factory.createIdentifier("undefined");
        }

        return remainingHeaderValues.reduce((left, headerValue) => {
            return ts.factory.createBinaryExpression(
                left,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                headerValue
            );
        }, firstHeaderValue);
    };

    return {
        getProperties: () =>
            apiAuth.schemes.map((scheme) => {
                const property = getPropertyForAuthScheme(scheme);
                return ts.factory.createPropertySignature(
                    undefined,
                    property.propertyName,
                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                    coreUtilities.fetcher.Supplier._getReferenceToType(property.getType())
                );
            }),

        getHeaders: (nodeWithAuthProperties) => {
            return Object.entries(headerNameToAuthSchemes).map(([headerName, authSchemesForHeader]) => {
                return createPropertyAssignment(
                    ts.factory.createStringLiteral(headerName),
                    getValueForHeader({ nodeWithAuthProperties, authSchemesForHeader })
                );
            });
        },
    };
}
