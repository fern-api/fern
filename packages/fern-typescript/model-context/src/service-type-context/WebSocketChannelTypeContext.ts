import { FernFilepath, ServiceName } from "@fern-api/api";
import { ImportStrategy } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { BaseServiceTypeContext, ServiceTypeMetadata } from "./BaseServiceTypeContext";
import { GeneratedRequest, InlinedServiceTypeReference, ServiceTypeReference } from "./types";

export type WebSocketChannelTypeReference = ServiceTypeReference<WebSocketChannelTypeMetadata>;
export type InlinedWebSocketChannelTypeReference = InlinedServiceTypeReference<WebSocketChannelTypeMetadata>;

export interface GeneratedWebSocketOperationTypes {
    request: GeneratedRequest<WebSocketChannelTypeMetadata>;
    response: {
        reference: InlinedWebSocketChannelTypeReference;
        successBodyReference: WebSocketChannelTypeReference | undefined;
        errorBodyReference: InlinedWebSocketChannelTypeReference;
    };
}

type NonQualifiedChannelName = string;
type OperationId = string;

export interface WebSocketChannelTypeMetadata {
    channelName: ServiceName;
    operationId: OperationId;
    typeName: string;
}

export declare namespace WebSocketChannelTypeContext {
    namespace getReferenceToServiceType {
        interface Args {
            metadata: WebSocketChannelTypeMetadata;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }

    namespace registerGeneratedTypes {
        interface Args {
            channelName: ServiceName;
            operationId: OperationId;
            generatedTypes: GeneratedWebSocketOperationTypes;
        }
    }

    namespace getGeneratedTypes {
        interface Args {
            channelName: ServiceName;
            operationId: OperationId;
        }
    }
}

export class WebSocketChannelTypeContext extends BaseServiceTypeContext {
    private generatedTypes: Record<
        FernFilepath,
        Record<NonQualifiedChannelName, Record<OperationId, GeneratedWebSocketOperationTypes>>
    > = {};

    constructor(modelDirectory: Directory) {
        super(modelDirectory);
    }

    public addWebSocketChannelTypeDeclaration(
        metadata: WebSocketChannelTypeMetadata,
        withFile: (file: SourceFile) => void
    ): void {
        this.addServiceTypeDeclaration(convertToServiceTypeMetadata(metadata), withFile);
    }

    public getReferenceToWebSocketChannelType({
        metadata,
        importStrategy,
        referencedIn,
    }: WebSocketChannelTypeContext.getReferenceToServiceType.Args): ts.TypeReferenceNode {
        return this.getReferenceToServiceType({
            metadata: convertToServiceTypeMetadata(metadata),
            importStrategy,
            referencedIn,
        });
    }

    public registerGeneratedTypes({
        channelName,
        operationId,
        generatedTypes,
    }: WebSocketChannelTypeContext.registerGeneratedTypes.Args): void {
        const generatedTypesForPackage = (this.generatedTypes[channelName.fernFilepath] ??= {});
        const generatedTypesForChannel = (generatedTypesForPackage[channelName.name] ??= {});
        generatedTypesForChannel[operationId] = generatedTypes;
    }

    public getGeneratedTypes({
        channelName,
        operationId,
    }: WebSocketChannelTypeContext.getGeneratedTypes.Args): GeneratedWebSocketOperationTypes {
        const generatedTypes = this.generatedTypes[channelName.fernFilepath]?.[channelName.name]?.[operationId];
        if (generatedTypes == null) {
            throw new Error(
                "Cannot find generated types for " + `${channelName.fernFilepath}:${channelName.name}:${operationId}`
            );
        }
        return generatedTypes;
    }
}

function convertToServiceTypeMetadata(channelMetadata: WebSocketChannelTypeMetadata): ServiceTypeMetadata {
    return {
        typeName: channelMetadata.typeName,
        fernFilepath: channelMetadata.channelName.fernFilepath,
        relativeFilepathInServiceTypesDirectory: [channelMetadata.channelName.name],
    };
}
