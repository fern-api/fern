import { AbsoluteFilePath, cwd, dirname, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import { type FernConfigMappingDiagnostic, FernConfigMappingError } from "@postman/sdk-config/sdk-config/v1";
import YAML from "yaml";

import type { CliContext } from "../../cli-context/CliContext.js";
import { loadCompatibleMigrationGroups } from "./loadCompatibleMigrationGroups.js";
import { type MappingResult, mapFernGroupToSdkConfig } from "./mapFernGroupToSdkConfig.js";
import { migrateDocsConfiguration } from "./migrateDocsConfiguration.js";
import {
    identifySourceDerivedApiFields,
    resolveMigrationPathParameterStyle,
    serializeMigrationSource
} from "./projectMigrationSource.js";
import { selectMigrationTarget } from "./selectMigrationTarget.js";
import { writeOutputFile } from "./writeOutputFile.js";

export interface SdkMigrateArgs {
    api?: string;
    force: boolean;
    group?: string[];
    output?: string;
    strict: boolean;
}

const DEFAULT_SDK_CONFIG_FILENAME = RelativeFilePath.of("sdk-config.yml");

export async function sdkMigrate({
    project,
    cliContext,
    args
}: {
    project: Project;
    cliContext: CliContext;
    args: SdkMigrateArgs;
}): Promise<void> {
    const { workspace, groups } = await selectMigrationTarget({
        project,
        cliContext,
        args
    });
    const { fernWorkspace, group, sourceSpecs } = await loadCompatibleMigrationGroups({
        workspace,
        groups,
        cliContext
    });
    const outputPath = resolveOutputPath(args.output, workspace.absoluteFilePath);
    const sourceBaseDirectory = outputPath == null ? cwd().toString() : dirname(outputPath).toString();

    let mapped: MappingResult;
    try {
        mapped = mapFernGroupToSdkConfig({
            fernWorkspace,
            group,
            source: serializeMigrationSource({ specs: sourceSpecs, workingDirectory: sourceBaseDirectory }),
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

    const serialized = YAML.stringify(mapped.sdkConfig, { lineWidth: 0 });
    const yaml = serialized.endsWith("\n") ? serialized : `${serialized}\n`;
    if (outputPath == null) {
        cliContext.writeTextToStdout(yaml);
    } else {
        await writeOutputFile(outputPath, yaml, args.force);
        cliContext.stderr.info(`Created SDK Config v1 at ${outputPath}`);
    }

    const updatedDocsSections = await migrateDocsConfiguration({
        docsPath: project.docsWorkspaces?.absoluteFilepathToDocsConfig,
        workspaceName: workspace.workspaceName,
        isOnlyApiWorkspace: project.apiWorkspaces.length === 1,
        sourceSpecs
    });
    if (updatedDocsSections > 0) {
        cliContext.stderr.info(
            `Updated ${updatedDocsSections} API reference section${updatedDocsSections === 1 ? "" : "s"} across the docs configuration rooted at ${project.docsWorkspaces?.absoluteFilepathToDocsConfig}`
        );
    }
    if (outputPath != null) {
        cliContext.stderr.info("Next: review the migrated file, then pass its path to fern generate --sdk-config.");
    }
}

function resolveOutputPath(
    requestedOutput: string | undefined,
    workspaceDirectory: AbsoluteFilePath
): AbsoluteFilePath | undefined {
    if (requestedOutput === "-") {
        return undefined;
    }
    if (requestedOutput == null) {
        return join(workspaceDirectory, DEFAULT_SDK_CONFIG_FILENAME);
    }
    return resolve(cwd(), requestedOutput);
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
