import { HttpEndpoint } from "@fern-fern/ir-model";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { SourceFile, ts } from "ts-morph";
import { ServerConstants } from "../constants";
import { convertParamValueForExpectedType } from "./convertParamValueForExpectedType";

export function generateImplCall({
    endpoint,
    generatedEndpointTypes,
    modelContext,
    file,
}: {
    endpoint: HttpEndpoint;
    generatedEndpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
    file: SourceFile;
}): ts.Expression {
    const argument = generateImplCallArgument({ endpoint, generatedEndpointTypes, modelContext, file });
    return ts.factory.createAwaitExpression(
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(ServerConstants.Middleware.PARAMETER_NAME),
                ts.factory.createIdentifier(endpoint.endpointId)
            ),
            undefined,
            argument != null ? [argument] : []
        )
    );
}

function generateImplCallArgument({
    endpoint,
    generatedEndpointTypes,
    modelContext,
    file,
}: {
    endpoint: HttpEndpoint;
    generatedEndpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
    file: SourceFile;
}): ts.Expression | undefined {
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

        return ts.factory.createObjectLiteralExpression(properties, true);
    }

    if (generatedEndpointTypes.request.body != null) {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(ServerConstants.Middleware.EndpointImplementation.Request.PARAMETER_NAME),
            ts.factory.createIdentifier(ServerConstants.Express.RequestProperties.BODY)
        );
    }

    return undefined;
}
