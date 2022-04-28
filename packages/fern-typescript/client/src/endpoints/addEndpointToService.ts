import { HttpEndpoint } from "@fern-api/api";
import { getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { ClassDeclaration, Directory, InterfaceDeclaration, Scope, ts } from "ts-morph";
import { ENDPOINTS_NAMESPACE_IMPORT } from "../constants";
import { generateEndpointMethodBody } from "./endpoint-method-body/generateEndpointMethodBody";
import { generateEndpointTypes } from "./generate-endpoint-types/generateEndpointTypes";
import { RESPONSE_TYPE_NAME } from "./generate-endpoint-types/response/constants";

export function addEndpointToService({
    endpoint,
    serviceInterface,
    serviceClass,
    modelDirectory,
    errorsDirectory,
    endpointsDirectory,
    typeResolver,
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    endpointsDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    typeResolver: TypeResolver;
}): void {
    const serviceFile = serviceInterface.getSourceFile();
    const serviceDirectory = serviceFile.getDirectory();

    const generatedEndpointTypes = generateEndpointTypes({
        endpoint,
        serviceDirectory,
        endpointsDirectory,
        modelDirectory,
        errorsDirectory,
        typeResolver,
    });

    const getReferenceToEndpointType = (reference: ts.Identifier): ts.TypeReferenceNode => {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier(ENDPOINTS_NAMESPACE_IMPORT),
                    ts.factory.createIdentifier(endpoint.endpointId)
                ),
                reference
            ),
            undefined
        );
    };

    const parameters =
        generatedEndpointTypes.endpointParameter != null
            ? [
                  {
                      name: generatedEndpointTypes.endpointParameter.name,
                      type: getTextOfTsNode(
                          getReferenceToEndpointType(generatedEndpointTypes.endpointParameter.identifier)
                      ),
                  },
              ]
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            getReferenceToEndpointType(ts.factory.createIdentifier(RESPONSE_TYPE_NAME)),
        ])
    );

    serviceInterface.addMethod({
        name: generatedEndpointTypes.methodName,
        parameters,
        returnType,
    });

    serviceClass.addMethod({
        name: generatedEndpointTypes.methodName,
        scope: Scope.Public,
        isAsync: true,
        parameters,
        returnType,
        statements: generateEndpointMethodBody({
            endpoint,
            endpointTypes: generatedEndpointTypes,
            serviceFile,
            getReferenceToEndpointType,
            typeResolver,
        }),
    });
}
