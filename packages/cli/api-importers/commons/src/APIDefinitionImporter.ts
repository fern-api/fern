import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";

export declare namespace APIDefinitionImporter {

    interface Return {
        rootApiFile: RootApiFileSchema;
        packageMarkerFile: PackageMarkerFileSchema;
        definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
    }
}

export abstract class APIDefinitionImporter<T> {

    public abstract import(input: T): APIDefinitionImporter.Return;

}