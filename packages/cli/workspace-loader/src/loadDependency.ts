import { dependenciesYml } from "@fern-api/configuration";
import { createFiddleService } from "@fern-api/core";
import { assertNever, noop, visitObject } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { parseVersion } from "@fern-api/semver-utils";
import { TaskContext } from "@fern-api/task-context";
import { RootApiFileSchema, YAML_SCHEMA_VERSION } from "@fern-api/yaml-schema";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import { createWriteStream } from "fs";
import { isEqual } from "lodash-es";
import path from "path";
import { pipeline } from "stream/promises";
import tar from "tar";
import tmp from "tmp-promise";
import { loadAPIWorkspace } from "./loadAPIWorkspace";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";
import { FernDefinition } from "./types/Workspace";
import { FernWorkspace, OSSWorkspace } from "./workspaces";

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
    settings
}: {
    dependencyName: string;
    dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
    context: TaskContext;
    rootApiFile: RootApiFileSchema;
    cliVersion: string;
    settings?: OSSWorkspace.Settings;
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
                            settings
                        });
                        return;
                    case "local":
                        definition = await validateLocalDependencyAndGetDefinition({
                            context: contextForDependency,
                            dependency,
                            cliVersion,
                            settings
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

async function validateLocalDependencyAndGetDefinition({
    dependency,
    context,
    cliVersion,
    settings
}: {
    dependency: dependenciesYml.LocalApiDependency;
    context: TaskContext;
    cliVersion: string;
    settings?: OSSWorkspace.Settings;
}): Promise<FernDefinition | undefined> {
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

    return await loadDependencyWorkspaceResult.workspace.getDefinition({ context }, settings);
}

async function validateVersionedDependencyAndGetDefinition({
    dependency,
    context,
    cliVersion,
    settings
}: {
    dependency: dependenciesYml.VersionedDependency;
    context: TaskContext;
    cliVersion: string;
    settings?: OSSWorkspace.Settings;
}): Promise<FernDefinition | undefined> {
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
    const pathToDependency = AbsoluteFilePath.of((await tmp.dir()).path);
    context.logger.debug("Remote URL: " + response.body.definitionS3DownloadUrl);
    try {
        await downloadDependency({
            s3PreSignedReadUrl: response.body.definitionS3DownloadUrl,
            absolutePathToLocalOutput: pathToDependency
        });
    } catch (error) {
        context.failWithoutThrowing("Failed to download API", error);
        return undefined;
    }

    // parse workspace
    context.logger.info("Parsing...");
    const loadDependencyWorkspaceResult = await loadAPIWorkspace({
        absolutePathToWorkspace: pathToDependency,
        context,
        cliVersion: response.body.cliVersion,
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
    await tar.extract({ file: outputTarPath, cwd: absolutePathToLocalOutput });
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
