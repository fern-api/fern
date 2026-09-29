import { readFile } from "node:fs/promises";
import path from "node:path";
import {
    GENERATORS_CONFIGURATION_FILENAME,
    LEGACY_GENERATORS_CONFIGURATION_FILENAME,
    SDK_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
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
import {
    identifySourceDerivedApiFields,
    resolveMigrationPathParameterStyle,
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
            })
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
        mapped,
        outputPath
    });
    const sdkConfigCommentPath = displayPathFromWorkspace(workspace.absoluteFilePath, outputPath);
    const migratedLegacyContents = editLegacyGeneratorsConfiguration({
        contents: legacyContents,
        sdkConfigPath: sdkConfigCommentPath,
        selections
    });

    if (args.dryRun) {
        printDryRun({
            cliContext,
            existingSdkConfig,
            legacyGeneratorsPath,
            outputPath,
            selections,
            sourceGeneratorsPath
        });
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
            }
        ],
        remove: sourceGeneratorsPath === legacyGeneratorsPath ? [] : [sourceGeneratorsPath]
    });

    cliContext.stderr.info(`${existingSdkConfig == null ? "Created" : "Updated"} SDK Config v1 at ${outputPath}`);
    if (sourceGeneratorsPath !== legacyGeneratorsPath) {
        cliContext.stderr.info(`Renamed ${sourceGeneratorsPath} to ${legacyGeneratorsPath}`);
    }
    printRollbackInstructions({
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
        if (typeof error === "object" && error != null && "code" in error && error.code === "ENOENT") {
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
    existingSdkConfig,
    legacyGeneratorsPath,
    outputPath,
    selections,
    sourceGeneratorsPath
}: {
    cliContext: CliContext;
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
    legacyGeneratorsPath,
    outputPath,
    rollbackGeneratorsPath,
    selections
}: {
    cliContext: CliContext;
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
