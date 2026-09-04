import { cwd, resolve } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import { type FernConfigMappingDiagnostic, FernConfigMappingError } from "@postman/sdk-config/sdk-config/v1";

import type { CliContext } from "../../cli-context/CliContext.js";
import { loadCompatibleMigrationGroups } from "./loadCompatibleMigrationGroups.js";
import { type MappingResult, mapFernGroupToSdkConfig } from "./mapFernGroupToSdkConfig.js";
import { serializeMigrationSource } from "./projectMigrationSource.js";
import { selectMigrationTarget } from "./selectMigrationTarget.js";
import { writeOutputFile } from "./writeOutputFile.js";

export interface SdkMigrateArgs {
    api?: string;
    force: boolean;
    group?: string[];
    output: string;
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

    let mapped: MappingResult;
    try {
        mapped = mapFernGroupToSdkConfig({
            fernWorkspace,
            group,
            source: serializeMigrationSource({ specs: sourceSpecs, workingDirectory: cwd().toString() })
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

    if (args.output === "-") {
        cliContext.writeJsonToStdout(mapped.sdkConfig);
        return;
    }

    const outputPath = resolve(cwd(), args.output);
    await writeOutputFile(outputPath, `${JSON.stringify(mapped.sdkConfig, null, 2)}\n`, args.force);
    cliContext.stderr.info(`Created SDK Config v1 at ${outputPath}`);
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
