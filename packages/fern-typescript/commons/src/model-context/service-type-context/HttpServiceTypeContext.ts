import { EndpointId, ServiceName } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { ImportStrategy } from "../utils/ImportStrategy";
import { BaseServiceTypeContext, ServiceTypeMetadata } from "./BaseServiceTypeContext";

export interface HttpServiceTypeMetadata {
    serviceName: ServiceName;
    endpointId: EndpointId;
    typeName: string;
}

export declare namespace HttpServiceTypeContext {
    namespace getReferenceToServiceType {
        interface Args {
            metadata: HttpServiceTypeMetadata;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }
}

export class HttpServiceTypeContext extends BaseServiceTypeContext {
    constructor(modelDirectory: Directory) {
        super(modelDirectory);
    }

    public addHttpServiceTypeDefinition(metadata: HttpServiceTypeMetadata, withFile: (file: SourceFile) => void): void {
        this.addServiceTypeDefinition(convertToServiceTypeMetadata(metadata), withFile);
    }

    public getReferenceToHttpServiceType({
        metadata,
        importStrategy,
        referencedIn,
    }: HttpServiceTypeContext.getReferenceToServiceType.Args): ts.TypeReferenceNode {
        return this.getReferenceToServiceType({
            metadata: convertToServiceTypeMetadata(metadata),
            importStrategy,
            referencedIn,
        });
    }
}

function convertToServiceTypeMetadata(httpMetadata: HttpServiceTypeMetadata): ServiceTypeMetadata {
    return {
        typeName: httpMetadata.typeName,
        fernFilepath: httpMetadata.serviceName.fernFilepath,
        relativeFilepathInServiceTypesDirectory: [httpMetadata.serviceName.name],
    };
}
