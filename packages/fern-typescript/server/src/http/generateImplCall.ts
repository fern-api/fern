import { HttpAuth, HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import {
    DependencyManager,
    getReferenceToFernServiceUtilsBasicAuthMethod,
    getReferenceToFernServiceUtilsBearerTokenMethod,
} from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { SourceFile, ts } from "ts-morph";
import { ServerConstants } from "../constants";
import { convertParamValueForExpectedType } from "./convertParamValueForExpectedType";

export function generateImplCall({
    service,
    endpoint,
    generatedEndpointTypes,
    modelContext,
    file,
    dependencyManager,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    generatedEndpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
    file: SourceFile;
    dependencyManager: DependencyManager;
}): ts.Expression {
    const args = generateImplCallArguments({
        service,
        endpoint,
        generatedEndpointTypes,
        modelContext,
        dependencyManager,
        file,
    });
    return ts.factory.createAwaitExpression(
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(ServerConstants.Middleware.PARAMETER_NAME),
                ts.factory.createIdentifier(endpoint.endpointId)
            ),
            undefined,
            args
        )
    );
}

function generateImplCallArguments({
    service,
    endpoint,
    generatedEndpointTypes,
    modelContext,
    file,
    dependencyManager,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    generatedEndpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
    file: SourceFile;
    dependencyManager: DependencyManager;
}): ts.Expression[] {
    return [
        ...generateImplAuthArguments({ endpoint, dependencyManager, file }),
        ...generateImplRequestArguments({ service, endpoint, generatedEndpointTypes, modelContext, file }),
    ];
}

function generateImplAuthArguments({
    endpoint,
    dependencyManager,
    file,
}: {
    endpoint: HttpEndpoint;
    dependencyManager: DependencyManager;
    file: SourceFile;
}): ts.Expression[] {
    return HttpAuth._visit<ts.Expression[]>(endpoint.auth, {
        bearer: () => {
            return [
                ts.factory.createCallExpression(
                    getReferenceToFernServiceUtilsBearerTokenMethod({
                        util: "fromAuthorizationHeader",
                        dependencyManager,
                        referencedIn: file,
                    }),
                    undefined,
                    [ts.factory.createNonNullExpression(getRequestHeader("Authorization"))]
                ),
            ];
        },
        basic: () => {
            return [
                ts.factory.createCallExpression(
                    getReferenceToFernServiceUtilsBasicAuthMethod({
                        util: "fromAuthorizationHeader",
                        dependencyManager,
                        referencedIn: file,
                    }),
                    undefined,
                    [ts.factory.createNonNullExpression(getRequestHeader("Authorization"))]
                ),
            ];
        },
        none: () => [],
        _unknown: () => {
            throw new Error("Unknown auth: " + endpoint.auth);
        },
    });
}

function generateImplRequestArguments({
    service,
    endpoint,
    generatedEndpointTypes,
    modelContext,
    file,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    generatedEndpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
    file: SourceFile;
}): ts.Expression[] {
    if (generatedEndpointTypes.request.wrapper != null) {
        const properties: ts.ObjectLiteralElementLike[] = [
            ...endpoint.pathParameters.map((pathParameter) =>
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(pathParameter.key),
                    convertParamValueForExpectedType({
                        valueReference: ts.factory.createPropertyAccessExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(
                                    ServerConstants.Middleware.EndpointImplementation.Request.PARAMETER_NAME
                                ),
                                ts.factory.createIdentifier(ServerConstants.Express.RequestProperties.PARAMS)
                            ),
                            ts.factory.createIdentifier(pathParameter.key)
                        ),
                        // express path params are typed as string
                        isValueReferenceTypedAsString: true,
                        modelContext,
                        expectedType: pathParameter.valueType,
                        file,
                    })
                )
            ),
            ...endpoint.queryParameters.map((queryParameter) =>
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(queryParameter.key),
                    convertParamValueForExpectedType({
                        valueReference: ts.factory.createPropertyAccessExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(
                                    ServerConstants.Middleware.EndpointImplementation.Request.PARAMETER_NAME
                                ),
                                ts.factory.createIdentifier(ServerConstants.Express.RequestProperties.QUERY_PARAMS)
                            ),
                            ts.factory.createIdentifier(queryParameter.key)
                        ),
                        // express query params aren't typed as string
                        isValueReferenceTypedAsString: false,
                        modelContext,
                        expectedType: queryParameter.valueType,
                        file,
                    })
                )
            ),
            ...[...service.headers, ...endpoint.headers].map((header) =>
                ts.factory.createPropertyAssignment(
                    ts.factory.createStringLiteral(header.header),
                    convertParamValueForExpectedType({
                        valueReference: ts.factory.createNonNullExpression(getRequestHeader(header.header)),
                        isValueReferenceTypedAsString: true,
                        modelContext,
                        expectedType: header.valueType,
                        file,
                    })
                )
            ),
        ];

        if (generatedEndpointTypes.request.body != null) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    generatedEndpointTypes.request.wrapper.propertyName,
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(
                            ServerConstants.Middleware.EndpointImplementation.Request.PARAMETER_NAME
                        ),
                        ts.factory.createIdentifier(ServerConstants.Express.RequestProperties.BODY)
                    )
                )
            );
        }

        return [ts.factory.createObjectLiteralExpression(properties, true)];
    }

    if (generatedEndpointTypes.request.body != null) {
        return [
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(ServerConstants.Middleware.EndpointImplementation.Request.PARAMETER_NAME),
                ts.factory.createIdentifier(ServerConstants.Express.RequestProperties.BODY)
            ),
        ];
    }

    return [];
}

function getRequestHeader(header: string) {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(ServerConstants.Middleware.EndpointImplementation.Request.PARAMETER_NAME),
            ts.factory.createIdentifier(ServerConstants.Express.RequestMethods.HEADER)
        ),
        undefined,
        [ts.factory.createStringLiteral(header)]
    );
}
