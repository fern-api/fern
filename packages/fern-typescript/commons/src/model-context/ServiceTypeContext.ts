import { FernFilepath } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { BaseModelContext, ModelItem } from "./BaseModelContext";
import { ImportStrategy } from "./utils/ImportStrategy";

export interface ServiceTypeMetadata {
    typeName: string;
    fernFilepath: FernFilepath;
    relativeFilepathInServiceTypesDirectory: string[];
}

interface ServiceTypeModelItem extends ModelItem {
    metadata: ServiceTypeMetadata;
}

export declare namespace ServiceTypeContext {
    namespace getReferenceToServiceType {
        interface Args {
            metadata: ServiceTypeMetadata;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }
}

export class ServiceTypeContext extends BaseModelContext<ServiceTypeModelItem> {
    constructor(modelDirectory: Directory) {
        super({
            modelDirectory,
            intermediateDirectories: (item) => [
                "service-types",
                ...item.metadata.relativeFilepathInServiceTypesDirectory,
            ],
        });
    }

    public addServiceTypeDefinition(metadata: ServiceTypeMetadata, withFile: (file: SourceFile) => void): void {
        this.addFile({
            item: {
                typeName: metadata.typeName,
                fernFilepath: metadata.fernFilepath,
                metadata,
            },
            withFile,
        });
    }

    public getReferenceToServiceType({
        metadata,
        importStrategy,
        referencedIn,
    }: ServiceTypeContext.getReferenceToServiceType.Args): ts.TypeReferenceNode {
        return this.getReferenceToTypeInModel({
            item: {
                typeName: metadata.typeName,
                fernFilepath: metadata.fernFilepath,
                metadata,
            },
            importStrategy,
            referencedIn,
        });
    }
}
