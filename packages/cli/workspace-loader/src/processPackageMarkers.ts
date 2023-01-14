import { entries, keys } from "@fern-api/core-utils";
import { DependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { dirname, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { size } from "lodash-es";
import { loadDependency } from "./loadDependency";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

export declare namespace processPackageMarkers {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        newServiceFiles: Record<RelativeFilePath, ServiceFileSchema>;
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
    cliVersion,
}: {
    dependenciesConfiguration: DependenciesConfiguration;
    structuralValidationResult: validateStructureOfYamlFiles.SuccessfulResult;
    context: TaskContext;
    cliVersion: string;
}): Promise<processPackageMarkers.Return> {
    const newServiceFiles: Record<RelativeFilePath, ServiceFileSchema> = {};
    const failures: Record<RelativeFilePath, WorkspaceLoader.DependencyFailure> = {};

    await Promise.all(
        entries(structuralValidationResult.packageMarkers).map(
            async ([pathOfPackageMarker, { export: export_, ...serviceFile }]) => {
                if (export_ == null) {
                    newServiceFiles[pathOfPackageMarker] = serviceFile;
                } else {
                    const { types = {}, errors = {}, services: { http = {} } = {} } = serviceFile;
                    const pathToPackage = dirname(pathOfPackageMarker);
                    const areDefinitionsDefinedInPackage =
                        size(types) > 0 ||
                        size(errors) > 0 ||
                        size(http) ||
                        keys(structuralValidationResult.serviceFiles).some(
                            (filepath) => filepath !== pathOfPackageMarker && filepath.startsWith(pathToPackage)
                        );
                    if (areDefinitionsDefinedInPackage) {
                        failures[pathOfPackageMarker] = {
                            type: WorkspaceLoaderFailureType.EXPORT_PACKAGE_HAS_DEFINITIONS,
                            pathToPackage,
                        };
                    } else {
                        const loadDependencyResult = await loadDependency({
                            dependencyName: export_,
                            dependenciesConfiguration,
                            pathOfPackageMarker,
                            context,
                            rootApiFile: structuralValidationResult.rootApiFile,
                            cliVersion,
                        });
                        if (loadDependencyResult.didSucceed) {
                            Object.assign(newServiceFiles, loadDependencyResult.newServiceFiles);
                        } else {
                            failures[pathOfPackageMarker] = loadDependencyResult.failure;
                        }
                    }
                }
            }
        )
    );

    if (size(failures) > 0) {
        return {
            didSucceed: false,
            failures,
        };
    } else {
        return {
            didSucceed: true,
            newServiceFiles,
        };
    }
}
