import { FernFilepath } from "@fern-api/api";
import { SourceFile, ts } from "ts-morph";
import { BaseModelContext } from "./BaseModelContext";
import { ImportStrategy } from "./utils/ImportStrategy";

export interface ServiceTypeMetadata {
    typeName: string;
    fernFilepath: FernFilepath;
    relativeFilepathInServiceTypesDirectory: string[];
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

export class ServiceTypeContext extends BaseModelContext {
    public addServiceTypeDefinition(metadata: ServiceTypeMetadata, withFile: (file: SourceFile) => void): void {
        this.addFile({
            fileNameWithoutExtension: metadata.typeName,
            fernFilepath: metadata.fernFilepath,
            intermediateDirectories: ["service-types", ...metadata.relativeFilepathInServiceTypesDirectory],
            withFile,
        });
    }

    public getReferenceToServiceType({
        metadata,
        importStrategy,
        referencedIn,
    }: ServiceTypeContext.getReferenceToServiceType.Args): ts.TypeReferenceNode {
        return this.getReferenceToTypeInModel({
            exportedType: metadata.typeName,
            fernFilepath: metadata.fernFilepath,
            importStrategy,
            referencedIn,
        });
    }
}
