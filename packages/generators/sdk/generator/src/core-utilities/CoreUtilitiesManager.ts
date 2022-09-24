import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { CoreUtilities } from "@fern-typescript/sdk-declaration-handler";
import { cp } from "fs/promises";
import path from "path";
import { SourceFile } from "ts-morph";
import { ExportedDirectory } from "../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { CoreUtilitiesImpl } from "./CoreUtilitiesImpl";
import { CoreUtility } from "./CoreUtility";

const CORE_UTILITIES_FILEPATH: ExportedDirectory[] = [{ nameOnDisk: "core" }];

export declare namespace CoreUtilitiesManager {
    namespace getCoreUtilities {
        interface Args {
            sourceFile: SourceFile;
            addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        }
    }
}

export class CoreUtilitiesManager {
    private referencedCoreUtilities = new Set<CoreUtility.Manifest>();

    public getCoreUtilities({ sourceFile, addImport }: CoreUtilitiesManager.getCoreUtilities.Args): CoreUtilities {
        return new CoreUtilitiesImpl({
            sourceFile,
            addImport: (moduleSpecifier, importDeclaration, manifest) => {
                this.referencedCoreUtilities.add(manifest);
                addImport(moduleSpecifier, importDeclaration);
            },
            coreUtilitiesFilepath: CORE_UTILITIES_FILEPATH,
        });
    }

    public async copyCoreUtilities({ pathToPackage }: { pathToPackage: AbsoluteFilePath }): Promise<void> {
        await Promise.all(
            [...this.referencedCoreUtilities].map((utility) =>
                cp(
                    process.env.NODE_ENV === "test"
                        ? path.join(__dirname, "../../../../../..", utility.originalPathInRepo)
                        : utility.originalPathOnDocker,
                    join(
                        pathToPackage,
                        ...[...CORE_UTILITIES_FILEPATH, ...utility.pathInCoreUtilities].map((directory) =>
                            RelativeFilePath.of(directory.nameOnDisk)
                        )
                    ),
                    { recursive: true }
                )
            )
        );
    }
}
