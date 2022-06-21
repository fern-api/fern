import { WebSocketChannel, WebSocketOperation } from "@fern-api/api";
import {
    DependencyManager,
    ErrorResolver,
    getOrCreateDirectory,
    getTextOfTsNode,
    getTypeReference,
    TypeResolver,
} from "@fern-typescript/commons";
import {
    GeneratedWebSocketOperationTypes,
    generateWebSocketOperationTypes,
    getLocalServiceTypeReference,
    ServiceTypeName,
} from "@fern-typescript/service-types";
import {
    ClassDeclaration,
    Directory,
    InterfaceDeclaration,
    OptionalKind,
    ParameterDeclarationStructure,
    Scope,
    ts,
} from "ts-morph";
import { ClientConstants } from "../../constants";
import { generateOperationMethodBody } from "./operation-method-body/generateOperationMethodBody";

export declare namespace addClientOperationToChannel {
    export interface Args {
        channel: WebSocketChannel;
        channelClass: ClassDeclaration;
        channelInterface: InterfaceDeclaration;
        operation: WebSocketOperation;
        modelDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
        errorResolver: ErrorResolver;
        dependencyManager: DependencyManager;
    }

    export interface Return {
        generatedOperationTypes: GeneratedWebSocketOperationTypes;
    }
}

export function addClientOperationToChannel({
    channel,
    channelInterface,
    channelClass,
    operation,
    modelDirectory,
    servicesDirectory,
    typeResolver,
    errorResolver,
    dependencyManager,
}: addClientOperationToChannel.Args): addClientOperationToChannel.Return {
    const channelFile = channelClass.getSourceFile();
    const channelDirectory = channelFile.getDirectory();
    const operationsDirectory = getOrCreateDirectory(
        channelDirectory,
        ClientConstants.WebsocketChannel.Files.OPERATIONS_DIRECTORY_NAME
    );

    const generatedOperationTypes = generateWebSocketOperationTypes({
        channel,
        operation,
        operationsDirectory,
        modelDirectory,
        servicesDirectory,
        typeResolver,
        errorResolver,
        dependencyManager,
    });

    const getReferenceToLocalServiceType = (typeName: ServiceTypeName): ts.TypeReferenceNode => {
        return getLocalServiceTypeReference({
            serviceOrChannelName: channel.name,
            typeName,
            endpointOrOperationId: operation.operationId,
            servicesDirectory,
            referencedIn: channelFile,
        });
    };

    const parameters: OptionalKind<ParameterDeclarationStructure>[] =
        generatedOperationTypes.request.body != null
            ? [
                  {
                      name: ClientConstants.WebsocketChannel.Operation.Signature.REQUEST_PARAMETER,
                      type: getTextOfTsNode(
                          generatedOperationTypes.request.body.isLocal
                              ? getReferenceToLocalServiceType(generatedOperationTypes.request.body.typeName)
                              : getTypeReference({
                                    reference: generatedOperationTypes.request.body.typeReference,
                                    referencedIn: channelFile,
                                    modelDirectory,
                                })
                      ),
                  },
              ]
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            getReferenceToLocalServiceType(generatedOperationTypes.response.reference.typeName),
        ])
    );

    channelInterface.addMethod({
        name: operation.operationId,
        parameters,
        returnType,
    });

    channelClass.addMethod({
        name: operation.operationId,
        scope: Scope.Public,
        isAsync: true,
        parameters,
        returnType,
        statements: generateOperationMethodBody({
            operation,
            operationTypes: generatedOperationTypes,
            channelFile,
            getReferenceToLocalServiceType,
            dependencyManager,
        }),
    });

    return { generatedOperationTypes };
}
