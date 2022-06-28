import { FernFilepath } from "@fern-fern/ir-model";
import { ImportStrategy } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { BaseModelContext } from "../base-model-context/BaseModelContext";
import { ModelItem } from "../base-model-context/types";

export interface ServiceTypeMetadata {
    typeName: string;
    fernFilepath: FernFilepath;
    relativeFilepathInServiceTypesDirectory: string[];
}

interface ServiceTypeModelItem extends ModelItem {
    metadata: ServiceTypeMetadata;
}

export declare namespace BaseServiceTypeContext {
    namespace getReferenceToServiceType {
        interface Args {
            metadata: ServiceTypeMetadata;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }

    namespace getReferenceToServiceTypeUtils {
        interface Args {
            metadata: ServiceTypeMetadata;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }
}

export class BaseServiceTypeContext extends BaseModelContext<ServiceTypeModelItem> {
    constructor(modelDirectory: Directory) {
        super({
            modelDirectory,
            intermediateDirectories: (item) => [
                "service-types",
                ...item.metadata.relativeFilepathInServiceTypesDirectory,
            ],
        });
    }

    protected addServiceTypeDeclaration(metadata: ServiceTypeMetadata, withFile: (file: SourceFile) => void): void {
        this.addFile({
            item: convertToModelItem(metadata),
            withFile,
        });
    }

    protected getReferenceToServiceType({
        metadata,
        importStrategy,
        referencedIn,
    }: BaseServiceTypeContext.getReferenceToServiceType.Args): ts.TypeReferenceNode {
        return this.getReferenceToModelItemType({
            item: convertToModelItem(metadata),
            importStrategy,
            referencedIn,
        });
    }

    protected getReferenceToServiceTypeUtils({
        metadata,
        referencedIn,
        importStrategy,
    }: BaseServiceTypeContext.getReferenceToServiceTypeUtils.Args): ts.Expression {
        return this.getReferenceToModelItemValue({
            item: convertToModelItem(metadata),
            referencedIn,
            importStrategy,
        });
    }
}

function convertToModelItem(metadata: ServiceTypeMetadata): ServiceTypeModelItem {
    return {
        typeName: metadata.typeName,
        fernFilepath: metadata.fernFilepath,
        metadata,
    };
}
