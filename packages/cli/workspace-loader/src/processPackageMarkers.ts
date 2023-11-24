import { entries, keys } from "@fern-api/core-utils";
import { DependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { dirname, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { PackageMarkerFileSchema } from "@fern-api/yaml-schema";
import { size } from "lodash-es";
import { loadDependency } from "./loadDependency";
import { ParsedFernFile } from "./types/FernFile";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";
import { FernDefinition } from "./types/Workspace";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

export declare namespace processPackageMarkers {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
        importedDefinitions: Record<RelativeFilePath, FernDefinition>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, WorkspaceLoader.DependencyFailure>;
    }
}

export async function processPackageMarkers({
    dependenciesConfiguration,
    structuralValidationResult,
    context,
    cliVersion
}: {
    dependenciesConfiguration: DependenciesConfiguration;
    structuralValidationResult: validateStructureOfYamlFiles.SuccessfulResult;
    context: TaskContext;
    cliVersion: string;
}): Promise<processPackageMarkers.Return> {
    const packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>> = {};
    const importedDefinitions: Record<RelativeFilePath, FernDefinition> = {};
    const failures: Record<RelativeFilePath, WorkspaceLoader.DependencyFailure> = {};

    await Promise.all(
        entries(structuralValidationResult.packageMarkers).map(async ([pathOfPackageMarker, packageMarker]) => {
            if (packageMarker.contents.export == null) {
                packageMarkers[pathOfPackageMarker] = packageMarker;
            } else {
                const { export: _, ...otherPackageMarkerKeys } = packageMarker.contents;
                if (size(otherPackageMarkerKeys) > 0) {
                    failures[pathOfPackageMarker] = {
                        type: WorkspaceLoaderFailureType.EXPORTING_PACKAGE_MARKER_OTHER_KEYS,
                        pathOfPackageMarker
                    };
                } else {
                    const pathToPackage = dirname(pathOfPackageMarker);
                    const areDefinitionsDefinedInPackage = keys(structuralValidationResult.namedDefinitionFiles).some(
                        (filepath) => filepath !== pathOfPackageMarker && filepath.startsWith(pathToPackage)
                    );
                    if (areDefinitionsDefinedInPackage) {
                        failures[pathOfPackageMarker] = {
                            type: WorkspaceLoaderFailureType.EXPORT_PACKAGE_HAS_DEFINITIONS,
                            pathToPackage
                        };
                    } else {
                        const loadDependencyResult = await loadDependency({
                            dependencyName: packageMarker.contents.export,
                            dependenciesConfiguration,
                            context,
                            rootApiFile: structuralValidationResult.rootApiFile.contents,
                            cliVersion
                        });
                        if (loadDependencyResult.didSucceed) {
                            importedDefinitions[dirname(pathOfPackageMarker)] = loadDependencyResult.definition;
                        } else {
                            failures[pathOfPackageMarker] = loadDependencyResult.failure;
                        }
                    }
                }
            }
        })
    );

    if (size(failures) > 0) {
        return {
            didSucceed: false,
            failures
        };
    } else {
        return {
            didSucceed: true,
            packageMarkers,
            importedDefinitions
        };
    }
}
