import { GeneratedHttpEndpointTypes } from "@fern-typescript/model-context";
import { ServiceTypesConstants } from "@fern-typescript/service-types";
import { ts } from "ts-morph";
import { ServerConstants } from "../constants";

export function generateReturnOkResponse(generatedEndpointTypes: GeneratedHttpEndpointTypes): ts.Statement[] {
    return [
        ts.factory.createExpressionStatement(
            generatedEndpointTypes.response.successBodyReference != null
                ? ts.factory.createCallExpression(
                      ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier(
                              ServerConstants.Middleware.EndpointImplementation.Response.PARAMETER_NAME
                          ),
                          ts.factory.createIdentifier(ServerConstants.Express.ResponseMethods.SEND)
                      ),
                      undefined,
                      [
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createIdentifier(
                                  ServerConstants.Middleware.EndpointImplementation.ImplResult.VARIABLE_NAME
                              ),
                              ts.factory.createIdentifier(
                                  ServiceTypesConstants.Commons.Response.Success.Properties.Body.PROPERTY_NAME
                              )
                          ),
                      ]
                  )
                : ts.factory.createCallExpression(
                      ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier(
                              ServerConstants.Middleware.EndpointImplementation.Response.PARAMETER_NAME
                          ),
                          ts.factory.createIdentifier(ServerConstants.Express.ResponseMethods.END)
                      ),
                      undefined,
                      []
                  )
        ),
    ];
}
