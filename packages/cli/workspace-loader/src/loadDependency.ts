import { noop, visitObject } from "@fern-api/core-utils";
import { DependenciesConfiguration, Dependency } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { parseVersion } from "@fern-api/semver-utils";
import { createFiddleService } from "@fern-api/services";
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
import { loadWorkspace } from "./loadWorkspace";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";
import { FernDefinition } from "./types/Workspace";

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
}: {
    dependencyName: string;
    dependenciesConfiguration: DependenciesConfiguration;
    context: TaskContext;
    rootApiFile: RootApiFileSchema;
    cliVersion: string;
}): Promise<loadDependency.Return> {
    let definition: FernDefinition | undefined;
    let failure: WorkspaceLoader.DependencyFailure = {
        type: WorkspaceLoaderFailureType.FAILED_TO_LOAD_DEPENDENCY,
        dependencyName,
    };

    // look up dependency in dependencies configuration
    const dependency = dependenciesConfiguration.dependencies[dependencyName];
    if (dependency == null) {
        failure = {
            type: WorkspaceLoaderFailureType.DEPENDENCY_NOT_LISTED,
            dependencyName,
        };
    } else {
        await context.runInteractiveTask({ name: stringifyDependency(dependency) }, async (contextForDependency) => {
            definition = await validateDependencyAndGetDefinition({
                context: contextForDependency,
                rootApiFile,
                dependency,
                cliVersion,
            });
        });
    }

    if (definition != null) {
        return { didSucceed: true, definition };
    } else {
        return { didSucceed: false, failure };
    }
}

async function validateDependencyAndGetDefinition({
    dependency,
    context,
    rootApiFile,
    cliVersion,
}: {
    dependency: Dependency;
    context: TaskContext;
    rootApiFile: RootApiFileSchema;
    cliVersion: string;
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
            },
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
            absolutePathToLocalOutput: pathToDependency,
        });
    } catch (error) {
        context.failWithoutThrowing("Failed to download API", error);
        return undefined;
    }

    // parse workspace
    context.logger.info("Parsing...");
    const loadDependencyWorkspaceResult = await loadWorkspace({
        absolutePathToWorkspace: pathToDependency,
        context,
        cliVersion: response.body.cliVersion,
    });
    if (!loadDependencyWorkspaceResult.didSucceed) {
        context.failWithoutThrowing(
            "Failed to parse dependency after downloading",
            loadDependencyWorkspaceResult.failures
        );
        return undefined;
    }

    const workspaceOfDependency = loadDependencyWorkspaceResult.workspace;
    if (workspaceOfDependency.type === "openapi") {
        context.failWithoutThrowing("Dependency must be a fern workspace.");
        return undefined;
    }

    // ensure root api files are equivalent
    let areRootApiFilesEquivalent = true as boolean;
    await visitObject(rootApiFile, {
        name: noop,
        imports: noop,
        "display-name": noop,
        auth: (auth) => {
            areRootApiFilesEquivalent &&= isEqual(auth, workspaceOfDependency.definition.rootApiFile.contents.auth);
        },
        "auth-schemes": (auth) => {
            areRootApiFilesEquivalent &&= isEqual(
                auth,
                workspaceOfDependency.definition.rootApiFile.contents["auth-schemes"]
            );
        },
        docs: noop,
        headers: noop,
        "default-environment": noop,
        environments: noop,
        "error-discrimination": (errorDiscrimination) => {
            areRootApiFilesEquivalent &&= isEqual(
                errorDiscrimination,
                workspaceOfDependency.definition.rootApiFile.contents["error-discrimination"]
            );
        },
        audiences: noop,
        errors: noop,
        "base-path": (basePath) => {
            areRootApiFilesEquivalent &&=
                basePath === workspaceOfDependency.definition.rootApiFile.contents["base-path"];
        },
        "path-parameters": noop,
        variables: noop,
    });
    if (!areRootApiFilesEquivalent) {
        context.failWithoutThrowing(
            `Failed to incorporate dependency because ${ROOT_API_FILENAME} is meaningfully different`
        );
        return undefined;
    }

    return workspaceOfDependency.definition;
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
