import { size } from "lodash-es";

import { FernDefinition, ParsedFernFile } from "@fern-api/api-workspace-commons";
import { dependenciesYml } from "@fern-api/configuration-loader";
import { entries, keys } from "@fern-api/core-utils";
import { PackageMarkerFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath, dirname } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { OSSWorkspace } from "../OSSWorkspace";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./Result";
import { LoadAPIWorkspace } from "./loadAPIWorkspace";
import { loadDependency } from "./loadDependency";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

export declare namespace processPackageMarkers {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
        importedDefinitions: Record<RelativeFilePath, ImportedDefinition>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, WorkspaceLoader.DependencyFailure>;
    }

    export interface ImportedDefinition {
        url: string | undefined;
        definition: FernDefinition;
    }
}

export async function processPackageMarkers({
    dependenciesConfiguration,
    structuralValidationResult,
    context,
    cliVersion,
    settings,
    loadAPIWorkspace
}: {
    dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
    structuralValidationResult: validateStructureOfYamlFiles.SuccessfulResult;
    context: TaskContext;
    cliVersion: string;
    settings?: OSSWorkspace.Settings;
    loadAPIWorkspace?: LoadAPIWorkspace;
}): Promise<processPackageMarkers.Return> {
    const packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>> = {};
    const importedDefinitions: Record<RelativeFilePath, processPackageMarkers.ImportedDefinition> = {};
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
                            dependencyName:
                                typeof packageMarker.contents.export === "string"
                                    ? packageMarker.contents.export
                                    : packageMarker.contents.export.dependency,
                            dependenciesConfiguration,
                            context,
                            rootApiFile: structuralValidationResult.rootApiFile.contents,
                            cliVersion,
                            settings,
                            loadAPIWorkspace
                        });
                        if (loadDependencyResult.didSucceed) {
                            importedDefinitions[dirname(pathOfPackageMarker)] = {
                                definition: loadDependencyResult.definition,
                                url:
                                    typeof packageMarker.contents.export === "object"
                                        ? packageMarker.contents.export.url
                                        : undefined
                            };
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
