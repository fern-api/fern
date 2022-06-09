import { HttpEndpoint, HttpService } from "@fern-api/api";
import { getTextOfTsNode, getTypeReference, TypeResolver } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import {
    ClassDeclaration,
    Directory,
    InterfaceDeclaration,
    OptionalKind,
    ParameterDeclarationStructure,
    Scope,
    ts,
} from "ts-morph";
import { getLocalServiceTypeReference } from "../../commons/service-types/get-service-type-reference/getLocalServiceTypeReference";
import { ServiceTypeName } from "../../commons/service-types/types";
import { ClientConstants } from "../../constants";
import { generateEndpointMethodBody } from "./endpoint-method-body/generateEndpointMethodBody";
import { generateEndpointTypes } from "./endpoint-types/generateEndpointTypes";

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

    const getReferenceToLocalServiceType = (typeName: ServiceTypeName): ts.TypeReferenceNode => {
        return getLocalServiceTypeReference({
            serviceOrChannelName: serviceDefinition.name,
            typeName,
            endpointOrOperationId: endpoint.endpointId,
            servicesDirectory,
            referencedIn: serviceFile,
        });
    };

    const parameters: OptionalKind<ParameterDeclarationStructure>[] =
        generatedEndpointTypes.request != null
            ? generatedEndpointTypes.request.wrapper != null
                ? [
                      {
                          name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                          type: getTextOfTsNode(
                              generatedEndpointTypes.request.wrapper.reference.isLocal
                                  ? getReferenceToLocalServiceType(
                                        generatedEndpointTypes.request.wrapper.reference.typeName
                                    )
                                  : getTypeReference({
                                        reference: generatedEndpointTypes.request.wrapper.reference.typeReference,
                                        referencedIn: serviceFile,
                                        modelDirectory,
                                    })
                          ),
                      },
                  ]
                : generatedEndpointTypes.request.body != null
                ? [
                      {
                          name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                          type: getTextOfTsNode(
                              generatedEndpointTypes.request.body.isLocal
                                  ? getReferenceToLocalServiceType(generatedEndpointTypes.request.body.typeName)
                                  : getTypeReference({
                                        reference: generatedEndpointTypes.request.body.typeReference,
                                        referencedIn: serviceFile,
                                        modelDirectory,
                                    })
                          ),
                      },
                  ]
                : []
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            getReferenceToLocalServiceType(generatedEndpointTypes.response.reference.typeName),
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
            getReferenceToLocalServiceType,
            typeResolver,
            helperManager,
            modelDirectory,
        }),
    });
}
