import { WebSocketChannel, WebSocketOperation } from "@fern-api/api";
import {
    DependencyManager,
    getOrCreateDirectory,
    getTextOfTsNode,
    getTypeReference,
    TypeResolver,
} from "@fern-typescript/commons";
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
import { generateOperationMethodBody } from "./operation-method-body/generateOperationMethodBody";
import { generateOperationTypes } from "./operation-types/generateOperationTypes";
import { GeneratedOperationTypes } from "./operation-types/types";

export declare namespace addClientOperationToChannel {
    export interface Args {
        channel: WebSocketChannel;
        channelClass: ClassDeclaration;
        channelInterface: InterfaceDeclaration;
        operation: WebSocketOperation;
        modelDirectory: Directory;
        errorsDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
        dependencyManager: DependencyManager;
    }

    export interface Return {
        generatedOperationTypes: GeneratedOperationTypes;
    }
}

export function addClientOperationToChannel({
    channel,
    channelInterface,
    channelClass,
    operation,
    modelDirectory,
    errorsDirectory,
    servicesDirectory,
    typeResolver,
    dependencyManager,
}: addClientOperationToChannel.Args): addClientOperationToChannel.Return {
    const channelFile = channelClass.getSourceFile();
    const channelDirectory = channelFile.getDirectory();
    const operationsDirectory = getOrCreateDirectory(
        channelDirectory,
        ClientConstants.WebsocketChannel.Files.OPERATIONS_DIRECTORY_NAME
    );

    const generatedOperationTypes = generateOperationTypes({
        channel,
        operation,
        operationsDirectory,
        modelDirectory,
        errorsDirectory,
        servicesDirectory,
        typeResolver,
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
                                    baseDirectory: modelDirectory,
                                    baseDirectoryType: "model",
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
