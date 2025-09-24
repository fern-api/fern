import { ts } from "ts-morph";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";
import { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";

export function generateEndpointMetadata({
    httpEndpoint,
    context
}: {
    httpEndpoint: FernIr.HttpEndpoint;
    context: SdkContext;
}): ts.Statement[] {
    /**
     * metadata should look like this:
     * {
     *   security: [
     *     {
     *       "apiKeyScheme": [],
     *       "myOAuthScheme": ["read", "write"],
     *     },
     *     { "anotherApiKeyScheme": [] }
     *   ]
     * }
     */
    return [
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        GeneratedSdkClientClassImpl.METADATA_FOR_TOKEN_SUPPLIER_VAR,
                        undefined,
                        context.coreUtilities.fetcher.EndpointMetadata._getReferenceToType(),
                        ts.factory.createObjectLiteralExpression(
                            [
                                ts.factory.createPropertyAssignment(
                                    "security",
                                    typeof httpEndpoint.security === "undefined"
                                        ? ts.factory.createIdentifier("undefined")
                                        : ts.factory.createArrayLiteralExpression(
                                              httpEndpoint.security.map((securityRequirement) =>
                                                  ts.factory.createObjectLiteralExpression(
                                                      Object.entries(securityRequirement).map(([key, scopes]) =>
                                                          ts.factory.createPropertyAssignment(
                                                              getPropertyKey(key),
                                                              ts.factory.createArrayLiteralExpression(
                                                                  scopes.map((scope) =>
                                                                      ts.factory.createStringLiteral(scope)
                                                                  )
                                                              )
                                                          )
                                                      ),
                                                      false
                                                  )
                                              ),
                                              false
                                          )
                                )
                            ],
                            false
                        )
                    )
                ],

                ts.NodeFlags.Const
            )
        )
    ];
}
