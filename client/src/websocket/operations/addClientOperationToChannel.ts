import { WebSocketChannel, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, getTextOfTsNode, ModelContext } from "@fern-typescript/commons";
import {
    GeneratedWebSocketOperationTypes,
    generateWebSocketOperationTypes,
    getServiceTypeReference,
} from "@fern-typescript/service-types";
import {
    ClassDeclaration,
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
        modelContext: ModelContext;
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
    modelContext,
    dependencyManager,
}: addClientOperationToChannel.Args): addClientOperationToChannel.Return {
    const channelFile = channelClass.getSourceFile();

    const generatedOperationTypes = generateWebSocketOperationTypes({
        channel,
        operation,
        modelContext,
        dependencyManager,
    });

    const parameters: OptionalKind<ParameterDeclarationStructure>[] =
        generatedOperationTypes.request.body != null
            ? [
                  {
                      name: ClientConstants.WebsocketChannel.Operation.Signature.REQUEST_PARAMETER,
                      type: getTextOfTsNode(
                          getServiceTypeReference({
                              reference: generatedOperationTypes.request.body,
                              referencedIn: channelFile,
                              modelContext,
                          })
                      ),
                  },
              ]
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            getServiceTypeReference({
                reference: generatedOperationTypes.response.reference,
                referencedIn: channelFile,
                modelContext,
            }),
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
            dependencyManager,
            modelContext,
        }),
    });

    return { generatedOperationTypes };
}
