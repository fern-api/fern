import { ServiceName } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { ImportStrategy } from "../utils/ImportStrategy";
import { BaseServiceTypeContext, ServiceTypeMetadata } from "./BaseServiceTypeContext";

export interface WebSocketChannelTypeMetadata {
    channelName: ServiceName;
    operationId: string;
    // TODO change to ServiceTypeName
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
}

export class WebSocketChannelTypeContext extends BaseServiceTypeContext {
    constructor(modelDirectory: Directory) {
        super(modelDirectory);
    }

    public addWebSocketChannelTypeDefinition(
        metadata: WebSocketChannelTypeMetadata,
        withFile: (file: SourceFile) => void
    ): void {
        this.addServiceTypeDefinition(convertToServiceTypeMetadata(metadata), withFile);
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
}

function convertToServiceTypeMetadata(channelMetadata: WebSocketChannelTypeMetadata): ServiceTypeMetadata {
    return {
        typeName: channelMetadata.typeName,
        fernFilepath: channelMetadata.channelName.fernFilepath,
        relativeFilepathInServiceTypesDirectory: [channelMetadata.channelName.name],
    };
}
