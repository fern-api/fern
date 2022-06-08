import { HttpEndpoint, HttpService } from "@fern-api/api";
import { getTextOfTsNode, getTypeReference, TypeResolver } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { ClassDeclaration, Directory, InterfaceDeclaration, Scope, ts } from "ts-morph";
import { ClientConstants } from "../../constants";
import { generateEndpointMethodBody } from "./endpoint-method-body/generateEndpointMethodBody";
import { generateEndpointTypes } from "./generate-endpoint-types/generateEndpointTypes";
import { EndpointTypeName, getLocalEndpointTypeReference } from "./getLocalEndpointTypeReference";

export async function addEndpointToService({
    endpoint,
    serviceInterface,
    serviceClass,
    serviceDefinition,
    modelDirectory,
    errorsDirectory,
    endpointsDirectory,
    servicesDirectory,
    typeResolver,
    helperManager,
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    endpointsDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    servicesDirectory: Directory;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
}): Promise<void> {
    const serviceFile = serviceInterface.getSourceFile();

    const generatedEndpointTypes = generateEndpointTypes({
        endpoint,
        serviceName: serviceDefinition.name,
        endpointsDirectory,
        modelDirectory,
        errorsDirectory,
        servicesDirectory,
        typeResolver,
    });

    const getReferenceToLocalEndpointType = (typeName: EndpointTypeName): ts.TypeReferenceNode => {
        return getLocalEndpointTypeReference({
            serviceName: serviceDefinition.name,
            typeName,
            endpointId: endpoint.endpointId,
            servicesDirectory,
            referencedIn: serviceFile,
        });
    };

    const parameters =
        generatedEndpointTypes.endpointParameter != null
            ? [
                  {
                      name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                      type: getTextOfTsNode(
                          generatedEndpointTypes.endpointParameter.isLocal
                              ? getReferenceToLocalEndpointType(generatedEndpointTypes.endpointParameter.typeName)
                              : getTypeReference({
                                    reference: generatedEndpointTypes.endpointParameter.typeReference,
                                    referencedIn: serviceFile,
                                    modelDirectory,
                                })
                      ),
                  },
              ]
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            getReferenceToLocalEndpointType(ClientConstants.HttpService.Endpoint.Types.Response.TYPE_NAME),
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
        statements: await generateEndpointMethodBody({
            endpoint,
            endpointTypes: generatedEndpointTypes,
            serviceFile,
            serviceDefinition,
            getReferenceToLocalEndpointType,
            typeResolver,
            helperManager,
            modelDirectory,
        }),
    });
}
