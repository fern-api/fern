import { getTextOfTsNode } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export const FORCE_REFRESH_ARG_NAME = "forceRefresh";

/**
 * The type of the argument to `AuthProvider.getAuthRequest`, e.g.
 * `{ endpointMetadata?: core.EndpointMetadata; forceRefresh?: boolean }`.
 */
export function getAuthRequestArgType(
    context: FileContext,
    { includeForceRefresh }: { includeForceRefresh: boolean }
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
    return getTextOfTsNode(ts.factory.createTypeLiteralNode(properties));
}

/**
 * The destructured `getAuthRequest` parameter, e.g. `{ endpointMetadata, forceRefresh }: {...} = {}`.
 */
export function getDestructuredAuthRequestParameter(
    context: FileContext,
    { includeForceRefresh }: { includeForceRefresh: boolean }
): { name: string; type: string; initializer: string } {
    return {
        name: includeForceRefresh ? `{ endpointMetadata, ${FORCE_REFRESH_ARG_NAME} }` : "{ endpointMetadata }",
        type: getAuthRequestArgType(context, { includeForceRefresh }),
        initializer: "{}"
    };
}
