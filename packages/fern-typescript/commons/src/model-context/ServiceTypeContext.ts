import { FernFilepath } from "@fern-api/api";
import { SourceFile, ts } from "ts-morph";
import { BaseModelContext, ImportStrategy } from "./base-context/BaseModelContext";

// TODO delete duplicate from service-types package
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
            importStrategy: ImportStrategy;
        }
    }
}

export class ServiceTypeContext extends BaseModelContext {
    public addServiceTypeDefinition(metadata: ServiceTypeMetadata, withFile: (file: SourceFile) => void): SourceFile {
        return this.addFile(
            metadata.typeName,
            metadata.fernFilepath,
            ["service-types", ...metadata.relativeFilepathInServiceTypesDirectory],
            withFile
        );
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
