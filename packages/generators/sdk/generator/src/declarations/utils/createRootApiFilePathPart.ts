import { ExportedDirectory } from "../../exports-manager/ExportedFilePath";

const ROOT_API_DIRECTORY = "api";

export function createRootApiFilePathPart(apiName: string): ExportedDirectory {
    return {
        nameOnDisk: ROOT_API_DIRECTORY,
        exportDeclaration: { namespaceExport: apiName },
    };
}
