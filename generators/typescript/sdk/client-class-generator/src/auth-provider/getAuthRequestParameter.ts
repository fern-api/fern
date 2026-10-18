import { getTextOfTsNode } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export const FORCE_REFRESH_ARG_NAME = "forceRefresh";
export const FAILED_AUTH_HEADERS_ARG_NAME = "failedAuthHeaders";

/**
 * The type of the argument to `AuthProvider.getAuthRequest`, e.g.
 * `{ endpointMetadata?: core.EndpointMetadata; forceRefresh?: boolean; failedAuthHeaders?: Record<string, string> }`.
 */
export function getAuthRequestArgType(
    context: FileContext,
    {
        includeForceRefresh,
        includeFailedAuthHeaders = includeForceRefresh
    }: { includeForceRefresh: boolean; includeFailedAuthHeaders?: boolean }
): string {
    const properties = [
        ts.factory.createPropertySignature(
            undefined,
            "endpointMetadata",
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            context.coreUtilities.fetcher.EndpointMetadata._getReferenceToType()
        )
    ];
    if (includeForceRefresh) {
        properties.push(
            ts.factory.createPropertySignature(
                undefined,
                FORCE_REFRESH_ARG_NAME,
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
            )
        );
    }
    if (includeFailedAuthHeaders) {
        properties.push(
            ts.factory.createPropertySignature(
                undefined,
                FAILED_AUTH_HEADERS_ARG_NAME,
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                ts.factory.createTypeReferenceNode("Record", [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                ])
            )
        );
    }
    return getTextOfTsNode(ts.factory.createTypeLiteralNode(properties));
}

/**
 * The destructured `getAuthRequest` parameter, e.g. `{ endpointMetadata, forceRefresh }: {...} = {}`.
 */
export function getDestructuredAuthRequestParameter(
    context: FileContext,
    {
        includeForceRefresh,
        includeFailedAuthHeaders = includeForceRefresh
    }: { includeForceRefresh: boolean; includeFailedAuthHeaders?: boolean }
): { name: string; type: string; initializer: string } {
    const names = ["endpointMetadata"];
    if (includeForceRefresh) {
        names.push(FORCE_REFRESH_ARG_NAME);
    }
    if (includeFailedAuthHeaders) {
        names.push(FAILED_AUTH_HEADERS_ARG_NAME);
    }
    return {
        name: `{ ${names.join(", ")} }`,
        type: getAuthRequestArgType(context, { includeForceRefresh, includeFailedAuthHeaders }),
        initializer: "{}"
    };
}
