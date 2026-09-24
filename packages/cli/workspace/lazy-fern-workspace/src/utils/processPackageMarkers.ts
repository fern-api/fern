import { FernDefinition, ParsedFernFile, type Spec } from "@fern-api/api-workspace-commons";
import { dependenciesYml } from "@fern-api/configuration-loader";
import { entries, keys } from "@fern-api/core-utils";
import { PackageMarkerFileSchema } from "@fern-api/fern-definition-schema";
import { dirname, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { size } from "lodash-es";

import { OSSWorkspace } from "../OSSWorkspace.js";
import { LoadAPIWorkspace } from "./loadAPIWorkspace.js";
import { loadDependency } from "./loadDependency.js";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./Result.js";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles.js";

export declare namespace processPackageMarkers {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
        importedDefinitions: Record<RelativeFilePath, ImportedDefinition>;
        specs: Spec[];
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
    const specsByNamespace: Record<RelativeFilePath, Spec[]> = {};
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
                            const namespace = dirname(pathOfPackageMarker);
                            importedDefinitions[namespace] = {
                                definition: loadDependencyResult.definition,
                                url:
                                    typeof packageMarker.contents.export === "object"
                                        ? packageMarker.contents.export.url
                                        : undefined
                            };
                            specsByNamespace[namespace] = loadDependencyResult.specs.map((spec) =>
                                withNamespace(spec, namespace)
                            );
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
            importedDefinitions,
            specs: flattenSpecsInNamespaceOrder(specsByNamespace)
        };
    }
}

function withNamespace(spec: Spec, namespace: string): Spec {
    return spec.type === "protobuf" ? spec : { ...spec, namespace };
}

function flattenSpecsInNamespaceOrder(specsByNamespace: Record<RelativeFilePath, Spec[]>): Spec[] {
    return keys(specsByNamespace)
        .sort()
        .flatMap((namespace) => specsByNamespace[namespace] ?? []);
}
