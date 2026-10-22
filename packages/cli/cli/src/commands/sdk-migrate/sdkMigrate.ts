import { readFile } from "node:fs/promises";
import path from "node:path";
import {
    GENERATORS_CONFIGURATION_FILENAME,
    type generatorsYml,
    LEGACY_GENERATORS_CONFIGURATION_FILENAME,
    SDK_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { isEnoentError } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, dirname, doesPathExist, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import { type FernConfigMappingDiagnostic, FernConfigMappingError } from "@postman/sdk-config/sdk-config/v1";
import type { CliContext } from "../../cli-context/CliContext.js";
import { commitMigrationFiles, fileMode } from "./commitMigrationFiles.js";
import { editLegacyGeneratorsConfiguration } from "./editLegacyGeneratorsConfiguration.js";
import { loadCompatibleMigrationGroups } from "./loadCompatibleMigrationGroups.js";
import { type MappingResult, mapFernGroupToSdkConfig } from "./mapFernGroupToSdkConfig.js";
import { mergeSdkConfig } from "./mergeSdkConfig.js";
import { migrateDocsConfiguration } from "./migrateDocsConfiguration.js";
import {
    identifySourceDerivedApiFields,
    type ResolvedMigrationSourceSpec,
    resolveMigrationPathParameterStyle,
    resolveWorkspaceSourceSpecs,
    serializeMigrationSource
} from "./projectMigrationSource.js";
import { selectMigrationTarget } from "./selectMigrationTarget.js";

export interface SdkMigrateArgs {
    api?: string;
    dryRun: boolean;
    group?: string[];
    language?: string[];
    output?: string;
    strict: boolean;
}

export async function sdkMigrate({
    project,
    cliContext,
    args
}: {
    project: Project;
    cliContext: CliContext;
    args: SdkMigrateArgs;
}): Promise<void> {
    const { workspace, groups, selections } = await selectMigrationTarget({
        project,
        cliContext,
        args
    });
    const generatorsConfiguration = workspace.generatorsConfiguration;
    if (generatorsConfiguration == null) {
        throw new CliError({
            message: "No legacy generators configuration was found.",
            code: CliError.Code.ConfigError
        });
    }
    const sourceGeneratorsPath = generatorsConfiguration.absolutePathToConfiguration;
    const legacyGeneratorsPath = join(
        workspace.absoluteFilePath,
        RelativeFilePath.of(LEGACY_GENERATORS_CONFIGURATION_FILENAME)
    );
    const { fernWorkspace, group, sourceSpecs } = await loadCompatibleMigrationGroups({
        workspace,
        groups,
        cliContext
    });
    const outputPath = resolveOutputPath(args.output, workspace.absoluteFilePath);
    assertDistinctMigrationPaths(sourceGeneratorsPath, legacyGeneratorsPath, outputPath);
    if (sourceGeneratorsPath !== legacyGeneratorsPath && (await doesPathExist(legacyGeneratorsPath))) {
        throw new CliError({
            message: `Cannot rename ${sourceGeneratorsPath} because ${legacyGeneratorsPath} already exists.`,
            code: CliError.Code.ConfigError
        });
    }
    const sourceBaseDirectory = dirname(outputPath).toString();
    const apiName = fernWorkspace.definition.rootApiFile.contents.name;
    const sdkName = resolveMigrationSdkName({
        apiName,
        organization: project.config.organization
    });

    let mapped: MappingResult;
    try {
        mapped = mapFernGroupToSdkConfig({
            fernWorkspace,
            group,
            source: serializeMigrationSource({ specs: sourceSpecs, workingDirectory: sourceBaseDirectory }),
            replay: workspace.generatorsConfiguration?.replay,
            clientPathParameterStyle: resolveMigrationPathParameterStyle(sourceSpecs),
            sourceDerivedApiFields: identifySourceDerivedApiFields({
                workspace,
                groups,
                definition: fernWorkspace.definition
            }),
            sdkName
        });
    } catch (error) {
        if (error instanceof FernConfigMappingError) {
            printDiagnostics(cliContext, error.issues);
            throw new CliError({
                message: `Could not create SDK Config v1: ${error.message}`,
                code: CliError.Code.ValidationError
            });
        }
        throw error;
    }

    printDiagnostics(cliContext, mapped.diagnostics);
    if (args.strict && mapped.diagnostics.length > 0) {
        throw new CliError({
            message: "SDK Config migration produced diagnostics in strict mode",
            code: CliError.Code.ValidationError
        });
    }

    const [legacyContents, existingSdkConfig] = await Promise.all([
        readFile(sourceGeneratorsPath, "utf8"),
        readOptionalFile(outputPath)
    ]);
    const sdkConfigContents = mergeSdkConfig({
        existingContents: existingSdkConfig,
        legacyPlaceholderSdkName: sdkName === apiName ? undefined : apiName,
        mapped,
        outputPath
    });
    const sdkConfigCommentPath = displayPathFromWorkspace(workspace.absoluteFilePath, outputPath);
    const migratedLegacyContents = editLegacyGeneratorsConfiguration({
        contents: legacyContents,
        sdkConfigPath: sdkConfigCommentPath,
        selections
    });

    const docsMigration = await migrateDocsConfiguration({
        docsPath: project.docsWorkspaces?.absoluteFilepathToDocsConfig,
        workspaceName: workspace.workspaceName,
        isOnlyApiWorkspace: project.apiWorkspaces.length === 1,
        sourceSpecs: resolveDocsSourceSpecs({ cliContext, group, sourceSpecs, workspace })
    });

    if (args.dryRun) {
        printDryRun({
            cliContext,
            docsPaths: docsMigration.edits.map((edit) => edit.path),
            existingSdkConfig,
            legacyGeneratorsPath,
            outputPath,
            selections,
            sourceGeneratorsPath
        });
        printGeneratorVersionWarning(cliContext, group);
        return;
    }

    await commitMigrationFiles({
        files: [
            {
                contents: migratedLegacyContents,
                mode: await fileMode(sourceGeneratorsPath),
                path: legacyGeneratorsPath
            },
            {
                contents: sdkConfigContents,
                mode: await fileMode(outputPath),
                path: outputPath
            },
            ...(await Promise.all(
                docsMigration.edits.map(async (edit) => ({
                    contents: edit.contents,
                    mode: await fileMode(edit.path),
                    path: edit.path
                }))
            ))
        ],
        remove: sourceGeneratorsPath === legacyGeneratorsPath ? [] : [sourceGeneratorsPath]
    });

    cliContext.stderr.info(`${existingSdkConfig == null ? "Created" : "Updated"} SDK Config v1 at ${outputPath}`);
    if (sourceGeneratorsPath !== legacyGeneratorsPath) {
        cliContext.stderr.info(`Renamed ${sourceGeneratorsPath} to ${legacyGeneratorsPath}`);
    }
    if (docsMigration.updatedSections > 0) {
        cliContext.stderr.info(
            `Added specs to ${docsMigration.updatedSections} API reference section${docsMigration.updatedSections === 1 ? "" : "s"} in ${docsMigration.edits.map((edit) => edit.path).join(", ")}`
        );
    }
    printGeneratorVersionWarning(cliContext, group);
    printRollbackInstructions({
        docsPaths: docsMigration.edits.map((edit) => edit.path),
        cliContext,
        legacyGeneratorsPath,
        outputPath,
        rollbackGeneratorsPath: join(
            workspace.absoluteFilePath,
            RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
        ),
        selections
    });
}

/**
 * Docs show the API itself, so they take the API's own specs. A generator can override its specs for its SDK only;
 * those must never reach docs.yml.
 */
function resolveDocsSourceSpecs({
    cliContext,
    group,
    sourceSpecs,
    workspace
}: {
    cliContext: CliContext;
    group: generatorsYml.GeneratorGroup;
    sourceSpecs: ResolvedMigrationSourceSpec[];
    workspace: Project["apiWorkspaces"][number];
}): ResolvedMigrationSourceSpec[] {
    try {
        const workspaceSpecs = resolveWorkspaceSourceSpecs(workspace);
        if (workspaceSpecs != null) {
            return workspaceSpecs;
        }
    } catch (error) {
        if (!(error instanceof CliError)) {
            throw error;
        }
        cliContext.stderr.warn(`[warning] docs.yml was not updated: ${error.message}`);
        return [];
    }
    // The API lists no specs of its own, so the SDK specs are the only source, unless a generator overrides them.
    return group.generators.some((generator) => generator.apiOverride?.specs != null) ? [] : sourceSpecs;
}

function resolveMigrationSdkName({ apiName, organization }: { apiName: string; organization: string }): string {
    return apiName.trim().toLowerCase() === "api" ? organization : apiName;
}

function printGeneratorVersionWarning(cliContext: CliContext, group: generatorsYml.GeneratorGroup): void {
    const generators = group.generators.map((generator) => {
        const name = generator.language ?? generator.name;
        return `${name}@${generator.version}`;
    });
    cliContext.stderr.warn(
        `[warning] [FERN_GENERATOR_VERSION_NOT_PRESERVED] SDK Config migration does not preserve legacy generator versions (${generators.join(", ")}). Generated targets use the latest compatible generators unless generatorVersion is set, which can change generated public APIs. Review the generated SDK before replacing an existing release.`
    );
}

function resolveOutputPath(
    requestedOutput: string | undefined,
    workspaceDirectory: AbsoluteFilePath
): AbsoluteFilePath {
    if (requestedOutput === "-") {
        throw new CliError({
            message: "--output - is not supported for an applied migration. Use --dry-run to preview file operations.",
            code: CliError.Code.ConfigError
        });
    }
    if (requestedOutput == null) {
        return join(workspaceDirectory, RelativeFilePath.of(SDK_CONFIG_FILENAME));
    }
    return resolve(cwd(), requestedOutput);
}

function assertDistinctMigrationPaths(
    sourceGeneratorsPath: AbsoluteFilePath,
    legacyGeneratorsPath: AbsoluteFilePath,
    outputPath: AbsoluteFilePath
): void {
    if (outputPath === sourceGeneratorsPath || outputPath === legacyGeneratorsPath) {
        throw new CliError({
            message: "The SDK Config output path must be different from both legacy generators configuration paths.",
            code: CliError.Code.ConfigError
        });
    }
}

async function readOptionalFile(filePath: AbsoluteFilePath): Promise<string | undefined> {
    try {
        return await readFile(filePath, "utf8");
    } catch (error) {
        if (isEnoentError(error)) {
            return undefined;
        }
        throw error;
    }
}

function displayPathFromWorkspace(workspaceDirectory: AbsoluteFilePath, outputPath: AbsoluteFilePath): string {
    const relativePath = path.relative(workspaceDirectory, outputPath).split(path.sep).join("/");
    return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

function printDryRun({
    cliContext,
    docsPaths,
    existingSdkConfig,
    legacyGeneratorsPath,
    outputPath,
    selections,
    sourceGeneratorsPath
}: {
    cliContext: CliContext;
    docsPaths: AbsoluteFilePath[];
    existingSdkConfig: string | undefined;
    legacyGeneratorsPath: AbsoluteFilePath;
    outputPath: AbsoluteFilePath;
    selections: Array<{ generatorIndexes: number[]; groupName: string; isEntireGroup: boolean }>;
    sourceGeneratorsPath: AbsoluteFilePath;
}): void {
    cliContext.stderr.info("Dry run: no files were changed.");
    if (sourceGeneratorsPath !== legacyGeneratorsPath) {
        cliContext.stderr.info(`Would rename ${sourceGeneratorsPath} to ${legacyGeneratorsPath}.`);
    }
    cliContext.stderr.info(`${existingSdkConfig == null ? "Would create" : "Would update"} ${outputPath}.`);
    for (const docsPath of docsPaths) {
        cliContext.stderr.info(`Would add API specs to ${docsPath}.`);
    }
    for (const selection of selections) {
        cliContext.stderr.info(
            selection.isEntireGroup
                ? `Would comment group '${selection.groupName}' in ${legacyGeneratorsPath}.`
                : `Would comment ${selection.generatorIndexes.length} generator invocation(s) in group '${selection.groupName}' in ${legacyGeneratorsPath}.`
        );
    }
}

function printRollbackInstructions({
    cliContext,
    docsPaths,
    legacyGeneratorsPath,
    outputPath,
    rollbackGeneratorsPath,
    selections
}: {
    cliContext: CliContext;
    docsPaths: AbsoluteFilePath[];
    legacyGeneratorsPath: AbsoluteFilePath;
    outputPath: AbsoluteFilePath;
    rollbackGeneratorsPath: AbsoluteFilePath;
    selections: Array<{ generatorIndexes: number[]; groupName: string; isEntireGroup: boolean }>;
}): void {
    const migrated = selections
        .map((selection) =>
            selection.isEntireGroup
                ? `group '${selection.groupName}'`
                : `${selection.generatorIndexes.length} invocation(s) from group '${selection.groupName}'`
        )
        .join(", ");
    cliContext.stderr.info("Rollback instructions:");
    cliContext.stderr.info(
        `1. Remove the migrated targets (${migrated}) from ${outputPath}; delete the file if empty.`
    );
    cliContext.stderr.info(`2. Rename ${legacyGeneratorsPath} to ${rollbackGeneratorsPath}.`);
    cliContext.stderr.info(
        "3. Remove any active empty groups placeholder, then uncomment the preserved groups, generator invocations, default-group, and aliases."
    );
    if (docsPaths.length > 0) {
        cliContext.stderr.info(
            `4. Optional: remove the specs added to API reference sections in ${docsPaths.join(", ")}. Docs then read the API from generators.yml again.`
        );
    }
}

function printDiagnostics(cliContext: CliContext, diagnostics: readonly FernConfigMappingDiagnostic[]): void {
    for (const diagnostic of diagnostics) {
        const destination =
            diagnostic.sdkConfigPath == null ? "" : `; SDK Config: ${diagnostic.sdkConfigPath.join(".")}`;
        cliContext.stderr.warn(
            `[${diagnostic.severity}] [${diagnostic.code}] ${diagnostic.path.join(".")}: ${diagnostic.reason}${destination}; ${diagnostic.suggestedAction}`
        );
    }
}
