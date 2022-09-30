import { ApiAuth, AuthScheme } from "@fern-fern/ir-model/auth";
import { TypeReference } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
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
                    propertyName: "_token",
                    getType: () => coreUtilities.auth.BearerToken._getReferenceToType(),
                };
            },
            basic: () => {
                return {
                    propertyName: "_credentials",
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

    const getValueForHeader = ({
        nodeWithAuthProperties,
        authSchemesForHeader,
    }: {
        nodeWithAuthProperties: ts.Expression;
        authSchemesForHeader: AuthScheme[];
    }) => {
        // special case for single simple header
        const [firstScheme, ...rest] = authSchemesForHeader;
        if (firstScheme != null && firstScheme._type === "header" && rest.length === 0) {
            return ts.factory.createPropertyAccessExpression(
                nodeWithAuthProperties,
                getPropertyForAuthScheme(firstScheme).propertyName
            );
        }

        return authSchemesForHeader.reduceRight<ts.Expression>((conditional, scheme) => {
            const referenceToProperty = ts.factory.createPropertyAccessExpression(
                nodeWithAuthProperties,
                getPropertyForAuthScheme(scheme).propertyName
            );

            return createNullCheckConditional(
                referenceToProperty,
                AuthScheme._visit(scheme, {
                    bearer: () => coreUtilities.auth.BearerToken.toAuthorizationHeader(referenceToProperty),
                    basic: () => coreUtilities.auth.BasicAuth.toAuthorizationHeader(referenceToProperty),
                    header: () => referenceToProperty,
                    _unknown: () => {
                        throw new Error("Unknown auth scheme: " + scheme._type);
                    },
                }),
                conditional
            );
        }, ts.factory.createIdentifier("undefined"));
    };

    return {
        getProperties: () =>
            apiAuth.schemes.map((scheme) => {
                const property = getPropertyForAuthScheme(scheme);
                return {
                    name: property.propertyName,
                    hasQuestionToken: true,
                    type: getTextOfTsNode(property.getType()),
                };
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

function createNullCheckConditional(
    maybeNull: ts.Expression,
    ifNotNull: ts.Expression,
    ifNull: ts.Expression
): ts.Expression {
    return ts.factory.createConditionalExpression(
        ts.factory.createBinaryExpression(
            maybeNull,
            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
            ts.factory.createNull()
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ifNotNull,
        ts.factory.createToken(ts.SyntaxKind.ColonToken),
        ifNull
    );
}
