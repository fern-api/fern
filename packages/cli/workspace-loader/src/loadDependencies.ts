import { entries, noop, visitObject } from "@fern-api/core-utils";
import { DependenciesConfiguration, Dependency } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DEPENDENCIES_CONFIGURATION_FILENAME, ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { createFiddleService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { PackageMarkerFileSchema, RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import { createWriteStream } from "fs";
import { isEqual } from "lodash-es";
import path from "path";
import { pipeline } from "stream/promises";
import tar from "tar";
import tmp from "tmp-promise";
import { loadWorkspace } from "./loadWorkspace";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";

const FIDDLE = createFiddleService();

export declare namespace loadDependencies {
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

export async function loadDependencies({
    dependenciesConfiguration,
    packageMarkers,
    context,
    rootApiFile,
    cliVersion,
}: {
    dependenciesConfiguration: DependenciesConfiguration;
    packageMarkers: Record<RelativeFilePath, PackageMarkerFileSchema>;
    context: TaskContext;
    rootApiFile: RootApiFileSchema;
    cliVersion: string;
}): Promise<loadDependencies.Return> {
    const newServiceFiles: Record<RelativeFilePath, ServiceFileSchema> = {};
    const failures: Record<RelativeFilePath, WorkspaceLoader.DependencyFailure> = {};

    await Promise.all(
        entries(packageMarkers).map(async ([relativeFilePathOfPackageMarker, { export: export_ }]) => {
            // look up dependency in dependencies configuration
            const dependency = dependenciesConfiguration.dependencies[export_];
            if (dependency == null) {
                context.logger.error(`Dependency ${export_} is not listed in ${DEPENDENCIES_CONFIGURATION_FILENAME}`);
                failures[relativeFilePathOfPackageMarker] = {
                    type: WorkspaceLoaderFailureType.DEPENDENCY,
                    cause: "dependencyNotListed",
                };
                return;
            }

            await context.runInteractiveTask(
                { name: stringifyDependency(dependency) },
                async (contextForDependency) => {
                    const serviceFileFromDependency = await validateDependencyAndGetServiceFiles({
                        context: contextForDependency,
                        rootApiFile,
                        dependency,
                        cliVersion,
                    });

                    if (serviceFileFromDependency == null) {
                        failures[relativeFilePathOfPackageMarker] = {
                            type: WorkspaceLoaderFailureType.DEPENDENCY,
                            cause: "failedToLoadDependency",
                        };
                    } else {
                        for (const [relativeFilePathOfDependencyServiceFile, serviceFile] of entries(
                            serviceFileFromDependency
                        )) {
                            newServiceFiles[
                                join(dirname(relativeFilePathOfPackageMarker), relativeFilePathOfDependencyServiceFile)
                            ] = serviceFile;
                        }
                    }
                }
            );
        })
    );

    if (Object.keys(failures).length > 0) {
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

async function validateDependencyAndGetServiceFiles({
    dependency,
    context,
    rootApiFile,
    cliVersion,
}: {
    dependency: Dependency;
    context: TaskContext;
    rootApiFile: RootApiFileSchema;
    cliVersion: string;
}): Promise<Record<RelativeFilePath, ServiceFileSchema> | undefined> {
    // load API
    context.logger.info("Downloading manifest...");
    const response = await FIDDLE.definitionRegistry.get(
        FernFiddle.OrganizationId(dependency.organization),
        FernFiddle.ApiId(dependency.apiName),
        dependency.version
    );
    if (!response.ok) {
        response.error._visit({
            orgDoesNotExistError: () => {
                context.failWithoutThrowing("Organization does not exist");
            },
            apiDoesNotExistError: () => {
                context.failWithoutThrowing("API does not exist");
            },
            versionDoesNotExistError: () => {
                context.failWithoutThrowing("Version does not exist");
            },
            _other: (error) => {
                context.failWithoutThrowing("Failed to download API manifest", error);
            },
        });
        return undefined;
    }

    // ensure CLI versions are identical
    if (response.body.cliVersion !== cliVersion) {
        context.failWithoutThrowing(
            `CLI version is ${response.body.cliVersion}. Expected ${cliVersion} (to match current workspace).`
        );
        return undefined;
    }

    // download API
    context.logger.info("Downloading...");
    const pathToDependency = AbsoluteFilePath.of((await tmp.dir()).path);
    context.logger.debug("Remote URL: " + response.body.definitionS3DownloadUrl);
    await downloadDependency({
        s3PreSignedReadUrl: response.body.definitionS3DownloadUrl,
        absolutePathToLocalOutput: pathToDependency,
    });

    // parse workspace
    context.logger.info("Parsing...");
    const workspaceOfDependency = await loadWorkspace({
        absolutePathToWorkspace: pathToDependency,
        context,
        cliVersion: response.body.cliVersion,
    });
    if (!workspaceOfDependency.didSucceed) {
        context.failWithoutThrowing("Failed to parse dependency after downloading", workspaceOfDependency.failures);
        return undefined;
    }

    // ensure root api files are equivalent
    let areRootApiFilesEquivalent = true as boolean;
    await visitObject(rootApiFile, {
        name: noop,
        imports: noop,
        "display-name": noop,
        auth: (auth) => {
            areRootApiFilesEquivalent &&= isEqual(auth, workspaceOfDependency.workspace.rootApiFile.auth);
        },
        "auth-schemes": (auth) => {
            areRootApiFilesEquivalent &&= isEqual(auth, workspaceOfDependency.workspace.rootApiFile["auth-schemes"]);
        },
        headers: noop,
        "default-environment": noop,
        environments: noop,
        "error-discrimination": (errorDiscrimination) => {
            areRootApiFilesEquivalent &&= isEqual(
                errorDiscrimination,
                workspaceOfDependency.workspace.rootApiFile["error-discrimination"]
            );
        },
        audiences: noop,
    });
    if (!areRootApiFilesEquivalent) {
        context.failWithoutThrowing(
            `Failed to incorporate dependency because ${ROOT_API_FILENAME} is meaningfully different`
        );
        return undefined;
    }

    return workspaceOfDependency.workspace.serviceFiles;
}

async function downloadDependency({
    s3PreSignedReadUrl,
    absolutePathToLocalOutput,
}: {
    s3PreSignedReadUrl: string;
    absolutePathToLocalOutput: AbsoluteFilePath;
}) {
    // initiate request
    const request = await axios.get(s3PreSignedReadUrl, {
        responseType: "stream",
    });

    // pipe to tgz
    const tmpDir = await tmp.dir();
    const outputTarPath = path.join(tmpDir.path, "api.tgz");
    await pipeline(request.data, createWriteStream(outputTarPath));

    // decompress to specified location
    await tar.extract({ file: outputTarPath, cwd: absolutePathToLocalOutput });
}

function stringifyDependency(dependency: Dependency): string {
    return `@${dependency.organization}/${dependency.apiName}`;
}
