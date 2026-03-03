import { ts } from "ts-morph";

import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl.js";

/**
 * Builds the second argument to this._client.fetch() containing per-request headers
 * and endpoint metadata. HttpClient.fetch() uses these for auth + global + per-request
 * header merging.
 */
export function buildFetchOptionsArg({
    requestOptionsParameterName,
    generateEndpointMetadata,
    generatedSdkClientClass
}: {
    requestOptionsParameterName: string;
    generateEndpointMetadata: boolean;
    generatedSdkClientClass: GeneratedSdkClientClassImpl;
}): ts.Expression {
    const properties: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(
            "requestHeaders",
            ts.factory.createPropertyAccessChain(
                ts.factory.createIdentifier(requestOptionsParameterName),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                "headers"
            )
        )
    ];
    if (generateEndpointMetadata) {
        properties.push(
            ts.factory.createPropertyAssignment(
                "endpointMetadata",
                generatedSdkClientClass.getReferenceToMetadataForEndpointSupplier()
            )
        );
    }
    return ts.factory.createObjectLiteralExpression(properties, true);
}
