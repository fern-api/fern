import axios from "axios";
import { createWriteStream } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { isEqual } from "lodash-es";
import { homedir } from "os";
import path from "path";
import { pipeline } from "stream/promises";
import { extract as extractTar } from "tar";
import tmp from "tmp-promise";

import { FernDefinition, FernWorkspace } from "@fern-api/api-workspace-commons";
import { dependenciesYml } from "@fern-api/configuration-loader";
import { createFiddleService } from "@fern-api/core";
import { assertNever, noop, visitObject } from "@fern-api/core-utils";
import { RootApiFileSchema, YAML_SCHEMA_VERSION } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { parseVersion } from "@fern-api/semver-utils";
import { TaskContext } from "@fern-api/task-context";

import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { OSSWorkspace } from "../OSSWorkspace";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./Result";
import { LoadAPIWorkspace } from "./loadAPIWorkspace";

const FIDDLE = createFiddleService();

export declare namespace loadDependency {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        definition: FernDefinition;
    }

    export interface FailedResult {
        didSucceed: false;
        failure: WorkspaceLoader.DependencyFailure;
    }
}

export async function loadDependency({
    dependencyName,
    dependenciesConfiguration,
    context,
    rootApiFile,
    cliVersion,
    settings,
    loadAPIWorkspace
}: {
    dependencyName: string;
    dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
    context: TaskContext;
    rootApiFile: RootApiFileSchema;
    cliVersion: string;
    settings?: OSSWorkspace.Settings;
    loadAPIWorkspace?: LoadAPIWorkspace;
}): Promise<loadDependency.Return> {
    let definition: FernDefinition | undefined;
    let failure: WorkspaceLoader.DependencyFailure = {
        type: WorkspaceLoaderFailureType.FAILED_TO_LOAD_DEPENDENCY,
        dependencyName
    };

    // look up dependency in dependencies configuration
    const dependency = dependenciesConfiguration.dependencies[dependencyName];
    if (dependency == null) {
        failure = {
            type: WorkspaceLoaderFailureType.DEPENDENCY_NOT_LISTED,
            dependencyName
        };
    } else {
        await context.runInteractiveTask(
            { name: `Download ${stringifyDependency(dependency)}` },
            async (contextForDependency) => {
                switch (dependency.type) {
                    case "version":
                        definition = await validateVersionedDependencyAndGetDefinition({
                            context: contextForDependency,
                            dependency,
                            cliVersion,
                            settings,
                            loadAPIWorkspace
                        });
                        return;
                    case "local":
                        definition = await validateLocalDependencyAndGetDefinition({
                            context: contextForDependency,
                            dependency,
                            cliVersion,
                            settings,
                            loadAPIWorkspace
                        });
                        return;
                    default:
                        assertNever(dependency);
                }
            }
        );
    }

    if (definition != null) {
        return { didSucceed: true, definition };
    } else {
        return { didSucceed: false, failure };
    }
}

const DEPENDENCIES_FOLDER_NAME = "dependencies";
const DEFINITION_FOLDER_NAME = "definition";
const METADATA_RESPONSE_FILENAME = "metadata.json";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

function getPathToLocalStorageDependency(dependency: dependenciesYml.VersionedDependency): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(DEPENDENCIES_FOLDER_NAME),
        RelativeFilePath.of(dependency.organization),
        RelativeFilePath.of(dependency.apiName),
        RelativeFilePath.of(dependency.version)
    );
}

async function validateLocalDependencyAndGetDefinition({
    dependency,
    context,
    cliVersion,
    settings,
    loadAPIWorkspace
}: {
    loadAPIWorkspace?: LoadAPIWorkspace;
    dependency: dependenciesYml.LocalApiDependency;
    context: TaskContext;
    cliVersion: string;
    settings?: OSSWorkspace.Settings;
}): Promise<FernDefinition | undefined> {
    if (loadAPIWorkspace == null) {
        context.failWithoutThrowing("Failed to load api definition");
        return undefined;
    }

    // parse workspace
    context.logger.info("Parsing...");
    const loadDependencyWorkspaceResult = await loadAPIWorkspace({
        absolutePathToWorkspace: dependency.absoluteFilepath,
        context,
        cliVersion,
        workspaceName: undefined
    });
    if (!loadDependencyWorkspaceResult.didSucceed) {
        context.failWithoutThrowing("Failed to load api definition", loadDependencyWorkspaceResult.failures);
        return undefined;
    }

    context.logger.info("Modifying source filepath ...");
    const definition = await loadDependencyWorkspaceResult.workspace.getDefinition(
        {
            context,
            relativePathToDependency: RelativeFilePath.of(dependency.path)
        },
        settings
    );
    context.logger.info("Loaded...");

    return definition;
}

async function validateVersionedDependencyAndGetDefinition({
    dependency,
    context,
    cliVersion,
    settings,
    loadAPIWorkspace
}: {
    dependency: dependenciesYml.VersionedDependency;
    context: TaskContext;
    cliVersion: string;
    settings?: OSSWorkspace.Settings;
    loadAPIWorkspace?: LoadAPIWorkspace;
}): Promise<FernDefinition | undefined> {
    const pathToDependency: AbsoluteFilePath = getPathToLocalStorageDependency(dependency);
    const pathToDefinition = join(pathToDependency, RelativeFilePath.of(DEPENDENCIES_FOLDER_NAME));
    const pathToMetadata = join(pathToDependency, RelativeFilePath.of(METADATA_RESPONSE_FILENAME));

    let metadata: FernFiddle.Api;
    if (!(await doesPathExist(pathToDefinition)) || !(await doesPathExist(pathToMetadata))) {
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
                }
            });
            return undefined;
        }

        const parsedYamlVersionOfDependency =
            response.body.yamlSchemaVersion != null ? parseInt(response.body.yamlSchemaVersion) : undefined;
        const parsedCliVersion = parseVersion(cliVersion);
        const parsedCliVersionOfDependency = parseVersion(response.body.cliVersion);

        // ensure dependency is on the same YAML_SCHEMA_VERSION
        if (parsedYamlVersionOfDependency != null) {
            if (parsedYamlVersionOfDependency > YAML_SCHEMA_VERSION) {
                context.failWithoutThrowing(
                    `${dependency.organization}/${dependency.apiName}@${dependency.version} on a higher version of fern. Upgrade this workspace to ${response.body.cliVersion}`
                );
                return undefined;
            } else if (parsedYamlVersionOfDependency < YAML_SCHEMA_VERSION) {
                context.failWithoutThrowing(
                    `${dependency.organization}/${dependency.apiName}@${dependency.version} on a lower version of fern. Upgrade it to ${cliVersion}`
                );
                return undefined;
            }
        }
        // otherwise, ensure CLI versions are on the same major + minor versions
        else if (
            parsedCliVersion.major !== parsedCliVersionOfDependency.major ||
            parsedCliVersion.minor !== parsedCliVersionOfDependency.minor
        ) {
            context.failWithoutThrowing(
                `CLI version is ${response.body.cliVersion}. Expected ${parsedCliVersion.major}.${parsedCliVersion.minor}.x (to match current workspace).`
            );
            return undefined;
        }

        // download API
        context.logger.info("Downloading...");
        context.logger.debug("Remote URL: " + response.body.definitionS3DownloadUrl);

        await mkdir(pathToDefinition, { recursive: true });

        try {
            await downloadDependency({
                s3PreSignedReadUrl: response.body.definitionS3DownloadUrl,
                absolutePathToLocalOutput: pathToDefinition
            });
        } catch (error) {
            context.failWithoutThrowing("Failed to download API", error);
            return undefined;
        }

        metadata = response.body;
        await writeFile(pathToMetadata, JSON.stringify(metadata));
    } else {
        metadata = JSON.parse((await readFile(pathToMetadata)).toString());
    }
    // parse workspace
    context.logger.info("Parsing...");
    if (loadAPIWorkspace == null) {
        context.failWithoutThrowing("Failed to load API");
        return undefined;
    }
    const loadDependencyWorkspaceResult = await loadAPIWorkspace({
        absolutePathToWorkspace: pathToDefinition,
        context,
        cliVersion: metadata.cliVersion,
        workspaceName: undefined
    });

    if (!loadDependencyWorkspaceResult.didSucceed) {
        context.failWithoutThrowing(
            "Failed to parse dependency after downloading",
            loadDependencyWorkspaceResult.failures
        );
        return undefined;
    }

    const workspaceOfDependency = loadDependencyWorkspaceResult.workspace;
    if (workspaceOfDependency.type === "oss") {
        context.failWithoutThrowing("Dependency must be a fern workspace.");
        return undefined;
    }

    return await loadDependencyWorkspaceResult.workspace.getDefinition({ context }, settings);
}

async function getAreRootApiFilesEquivalent(
    rootApiFile: RootApiFileSchema,
    workspaceOfDependency: FernWorkspace
): Promise<{ equal: boolean; differences: string[] }> {
    let areRootApiFilesEquivalent = true as boolean;
    const differences: string[] = [];
    await visitObject(rootApiFile, {
        version: noop,
        name: noop,
        imports: noop,
        "default-url": noop,
        "display-name": noop,
        auth: (auth) => {
            const isAuthEquals = isEqual(auth, workspaceOfDependency.definition.rootApiFile.contents.auth);
            if (!isAuthEquals) {
                differences.push("auth");
            }
            areRootApiFilesEquivalent &&= isAuthEquals;
        },
        "auth-schemes": (auth) => {
            const authSchemeEquals = isEqual(
                auth,
                removeUndefined(workspaceOfDependency.definition.rootApiFile.contents["auth-schemes"])
            );
            if (!authSchemeEquals) {
                differences.push("auth-schemes");
            }
            areRootApiFilesEquivalent &&= authSchemeEquals;
        },
        docs: noop,
        headers: noop,
        "idempotency-headers": noop,
        "default-environment": noop,
        environments: noop,
        "error-discrimination": (errorDiscrimination) => {
            const errorDiscriminationIsEqual = isEqual(
                errorDiscrimination,
                removeUndefined(workspaceOfDependency.definition.rootApiFile.contents["error-discrimination"])
            );
            if (!errorDiscriminationIsEqual) {
                differences.push("error-discrimination");
            }
            areRootApiFilesEquivalent &&= errorDiscriminationIsEqual;
        },
        audiences: noop,
        errors: noop,
        "base-path": (basePath) => {
            const basePathsAreEqual = basePath === workspaceOfDependency.definition.rootApiFile.contents["base-path"];
            if (!basePathsAreEqual) {
                differences.push("base-path");
            }
            areRootApiFilesEquivalent &&= basePathsAreEqual;
        },
        "path-parameters": noop,
        variables: noop,
        pagination: noop
    });
    return {
        equal: areRootApiFilesEquivalent,
        differences
    };
}

async function downloadDependency({
    s3PreSignedReadUrl,
    absolutePathToLocalOutput
}: {
    s3PreSignedReadUrl: string;
    absolutePathToLocalOutput: AbsoluteFilePath;
}) {
    // initiate request
    const request = await axios.get(s3PreSignedReadUrl, {
        responseType: "stream"
    });

    // pipe to tgz
    const tmpDir = await tmp.dir();
    const outputTarPath = path.join(tmpDir.path, "api.tgz");
    await pipeline(request.data, createWriteStream(outputTarPath));

    // decompress to specified location
    await extractTar({ file: outputTarPath, cwd: absolutePathToLocalOutput });
}

function stringifyDependency(dependency: dependenciesYml.Dependency): string {
    switch (dependency.type) {
        case "version":
            return `@${dependency.organization}/${dependency.apiName}`;
        case "local":
            return `${dependency.path}`;
        default:
            assertNever(dependency);
    }
}

function removeUndefined(val: unknown): unknown {
    if (val === undefined) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(val));
}
