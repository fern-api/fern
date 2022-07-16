import { HttpAuth, HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import {
    DependencyManager,
    getReferenceToFernServiceUtilsBasicAuthMethod,
    getReferenceToFernServiceUtilsBearerTokenMethod,
    getTextOfTsNode,
    invokeMaybeGetter,
} from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { SourceFile, StatementStructures, StructureKind, ts, VariableDeclarationKind, WriterFunction } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { doesServiceHaveBasicAuth, doesServiceHaveBearerAuth } from "../../utils";
import { generateConstructQueryParams } from "./generateConstructQueryParams";
import { generateFetcherCall } from "./generateFetcherCall";
import { generateReturnResponse } from "./generateReturnResponse";

export async function generateEndpointMethodBody({
    endpoint,
    endpointTypes,
    serviceFile,
    serviceDefinition,
    helperManager,
    modelContext,
    dependencyManager,
}: {
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    helperManager: HelperManager;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
}): Promise<(StatementStructures | WriterFunction | string)[]> {
    const queryParameterStatements = generateConstructQueryParams({ endpoint, modelContext });

    const statements: (StatementStructures | WriterFunction | string)[] = [];

    const authHeaderStatements = getAuthStatements({ serviceDefinition, serviceFile, dependencyManager, endpoint });
    if (authHeaderStatements != null) {
        statements.push(...authHeaderStatements.statements);
    }

    statements.push(
        (writer) => {
            if (queryParameterStatements.length === 0) {
                return;
            }
            for (const statement of queryParameterStatements) {
                writer.writeLine(getTextOfTsNode(statement));
            }
            writer.newLine();
        },
        await generateFetcherCall({
            endpoint,
            endpointTypes,
            serviceFile,
            serviceDefinition,
            includeQueryParams: queryParameterStatements.length > 0,
            helperManager,
            dependencyManager,
            referenceToAuthHeader: authHeaderStatements?.referenceToAuthHeader,
        }),
        (writer) => {
            writer.newLine();
        },
        getTextOfTsNode(
            await generateReturnResponse({
                endpointTypes,
                serviceFile,
                modelContext,
                serviceDefinition,
                endpoint,
                helperManager,
                dependencyManager,
            })
        )
    );

    return statements;
}

function getAuthStatements({
    endpoint,
    serviceDefinition,
    dependencyManager,
    serviceFile,
}: {
    endpoint: HttpEndpoint;
    serviceDefinition: HttpService;
    dependencyManager: DependencyManager;
    serviceFile: SourceFile;
}): { statements: (StatementStructures | string)[]; referenceToAuthHeader: ts.Expression } | undefined {
    return HttpAuth._visit<
        { statements: (StatementStructures | string)[]; referenceToAuthHeader: ts.Expression } | undefined
    >(endpoint.auth, {
        none: () => undefined,
        bearer: () => {
            const TOKEN_LOCAL_VARIABLE_NAME = "token";

            const statements: (StatementStructures | string)[] = [
                {
                    kind: StructureKind.VariableStatement,
                    declarationKind: VariableDeclarationKind.Const,
                    declarations: [
                        {
                            name: TOKEN_LOCAL_VARIABLE_NAME,
                            initializer: getTextOfTsNode(
                                invokeMaybeGetter(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createThis(),
                                        ts.factory.createIdentifier(
                                            ClientConstants.HttpService.PrivateMembers.BEARER_TOKEN
                                        )
                                    )
                                )
                            ),
                        },
                    ],
                },
            ];

            const authInfo = doesServiceHaveBearerAuth(serviceDefinition);
            if (!authInfo.hasAuth) {
                throw new Error("doesServiceHaveBearerAuth incorrect returns hasAuth=false");
            }

            if (authInfo.isOptional) {
                statements.push(
                    getTextOfTsNode(
                        ts.factory.createIfStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(TOKEN_LOCAL_VARIABLE_NAME),
                                ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createBlock(
                                [
                                    ts.factory.createThrowStatement(
                                        ts.factory.createNewExpression(
                                            ts.factory.createIdentifier("Error"),
                                            undefined,
                                            [
                                                ts.factory.createStringLiteral(
                                                    `${TOKEN_LOCAL_VARIABLE_NAME} is not defined.`
                                                ),
                                            ]
                                        )
                                    ),
                                ],
                                true
                            ),
                            undefined
                        )
                    )
                );
            }

            return {
                statements,
                referenceToAuthHeader: ts.factory.createCallExpression(
                    getReferenceToFernServiceUtilsBearerTokenMethod({
                        util: "toAuthorizationHeader",
                        dependencyManager,
                        referencedIn: serviceFile,
                    }),
                    undefined,
                    [ts.factory.createIdentifier(TOKEN_LOCAL_VARIABLE_NAME)]
                ),
            };
        },
        basic: () => {
            const BASIC_AUTH_LOCAL_VARIABLE_NAME = "credentials";

            const statements: (StatementStructures | string)[] = [
                {
                    kind: StructureKind.VariableStatement,
                    declarationKind: VariableDeclarationKind.Const,
                    declarations: [
                        {
                            name: BASIC_AUTH_LOCAL_VARIABLE_NAME,
                            initializer: getTextOfTsNode(
                                invokeMaybeGetter(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createThis(),
                                        ts.factory.createIdentifier(
                                            ClientConstants.HttpService.PrivateMembers.BASIC_AUTH
                                        )
                                    )
                                )
                            ),
                        },
                    ],
                },
            ];

            const authInfo = doesServiceHaveBasicAuth(serviceDefinition);
            if (!authInfo.hasAuth) {
                throw new Error("doesServiceHaveBasicAuth incorrect returns hasAuth=false");
            }

            if (authInfo.isOptional) {
                statements.push(
                    getTextOfTsNode(
                        ts.factory.createIfStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(BASIC_AUTH_LOCAL_VARIABLE_NAME),
                                ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createBlock(
                                [
                                    ts.factory.createThrowStatement(
                                        ts.factory.createNewExpression(
                                            ts.factory.createIdentifier("Error"),
                                            undefined,
                                            [
                                                ts.factory.createStringLiteral(
                                                    `${BASIC_AUTH_LOCAL_VARIABLE_NAME} is not defined.`
                                                ),
                                            ]
                                        )
                                    ),
                                ],
                                true
                            ),
                            undefined
                        )
                    )
                );
            }

            return {
                statements,
                referenceToAuthHeader: ts.factory.createCallExpression(
                    getReferenceToFernServiceUtilsBasicAuthMethod({
                        util: "toAuthorizationHeader",
                        dependencyManager,
                        referencedIn: serviceFile,
                    }),
                    undefined,
                    [ts.factory.createIdentifier(BASIC_AUTH_LOCAL_VARIABLE_NAME)]
                ),
            };
        },
        _unknown: () => {
            throw new Error("Unknown auth type: " + endpoint.auth);
        },
    });
}
