import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { type FernConfigMappingDiagnostic, FernConfigMappingError } from "@postman/sdk-config/sdk-config/v1";
import { randomUUID } from "crypto";
import { rename, unlink, writeFile } from "fs/promises";
import { basename, dirname, join } from "path";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import type { Target } from "../../../sdk/config/Target.js";
import { promptSelect } from "../../../ui/promptSelect.js";
import type { Workspace } from "../../../workspace/Workspace.js";
import { command } from "../../_internal/command.js";
import { SdkConfigMapper } from "./mapper/SdkConfigMapper.js";

export declare namespace MigrateCommand {
    export interface Args extends GlobalArgs {
        api?: string;
        force: boolean;
        group?: string;
        output: string;
        strict: boolean;
    }
}

export class MigrateCommand {
    public async handle(context: Context, args: MigrateCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();
        const selection = await this.selectTargets(context, workspace, args);

        const mapper = new SdkConfigMapper({ context });
        let mapped;
        try {
            mapped = await mapper.map({ workspace, selection });
        } catch (error) {
            if (error instanceof FernConfigMappingError) {
                this.printDiagnostics(context, error.issues);
                throw new CliError({
                    message: `Could not create SDK Config v1: ${error.message}`,
                    code: CliError.Code.ValidationError
                });
            }
            throw error;
        }

        const diagnostics = mapped.diagnostics;
        this.printDiagnostics(context, diagnostics);
        if (args.strict && diagnostics.length > 0) {
            throw new CliError({
                message: "SDK Config migration produced diagnostics in strict mode",
                code: CliError.Code.ValidationError
            });
        }

        const contents = JSON.stringify(mapped.sdkConfig, null, 2);
        await this.writeOutput(context, args, `${contents}\n`);
    }

    private async selectTargets(
        context: Context,
        workspace: Workspace,
        args: Pick<MigrateCommand.Args, "api" | "group">
    ): Promise<SdkConfigMapper.Selection> {
        const sdkConfig = workspace.sdks;
        if (sdkConfig == null || sdkConfig.targets.length === 0) {
            throw new CliError({ message: "No SDK targets configured in fern.yml", code: CliError.Code.ConfigError });
        }

        const requestedGroup = args.group ?? sdkConfig.defaultGroup;
        const groupName = requestedGroup ?? (await this.selectGroup(context, sdkConfig.targets));
        const groupTargets =
            groupName == null
                ? sdkConfig.targets
                : sdkConfig.targets.filter((target) => target.groups?.includes(groupName));
        if (groupTargets.length === 0) {
            throw new CliError({
                message: `SDK group '${groupName}' not found`,
                code: CliError.Code.ConfigError
            });
        }

        const apiName = args.api ?? (await this.selectApi(context, groupTargets));
        if (workspace.apis[apiName] == null) {
            throw new CliError({
                message: `API '${apiName}' not found. Available APIs: ${Object.keys(workspace.apis).sort().join(", ")}`,
                code: CliError.Code.ConfigError
            });
        }
        const targets = groupTargets.filter((target) => target.api === apiName);
        if (targets.length === 0) {
            throw new CliError({
                message:
                    groupName == null
                        ? `No SDK targets found for API '${apiName}'`
                        : `SDK group '${groupName}' has no targets for API '${apiName}'`,
                code: CliError.Code.ConfigError
            });
        }
        return { apiName, groupName, targets };
    }

    private async selectGroup(context: Context, targets: Target[]): Promise<string | undefined> {
        const groups = [...new Set(targets.flatMap((target) => target.groups ?? []))].sort();
        const hasUngroupedTargets = targets.some((target) => target.groups == null || target.groups.length === 0);
        if (groups.length === 0) {
            return undefined;
        }
        if (groups.length === 1 && !hasUngroupedTargets) {
            return groups[0];
        }
        return promptSelect<string | undefined>({
            isTTY: context.isTTY,
            message: "Multiple SDK groups found. Select one:",
            choices: [
                { name: `all (${targets.length} targets)`, value: undefined },
                ...groups.map((group) => ({ name: group, value: group }))
            ],
            nonInteractiveError: `Multiple SDK groups found: ${groups.join(", ")}. Use --group to select one.`,
            flagHint: (group) => (group == null ? undefined : `--group ${group}`)
        });
    }

    private async selectApi(context: Context, targets: Target[]): Promise<string> {
        const apiNames = [...new Set(targets.map((target) => target.api))].sort();
        const onlyApi = apiNames[0];
        if (apiNames.length === 1 && onlyApi != null) {
            return onlyApi;
        }
        return promptSelect({
            isTTY: context.isTTY,
            message: "Multiple APIs found in the SDK group. Select one:",
            choices: apiNames.map((apiName) => ({ name: apiName, value: apiName })),
            nonInteractiveError: `Multiple APIs found in the SDK group: ${apiNames.join(", ")}. Use --api to select one.`,
            flagHint: (apiName) => `--api ${apiName}`
        });
    }

    private printDiagnostics(context: Context, diagnostics: readonly FernConfigMappingDiagnostic[]): void {
        for (const diagnostic of diagnostics) {
            const destination =
                diagnostic.sdkConfigPath == null ? "" : `; SDK Config: ${diagnostic.sdkConfigPath.join(".")}`;
            context.stderr.warn(
                `[${diagnostic.code}] ${diagnostic.path.join(".")}: ${diagnostic.reason}${destination}; ${diagnostic.suggestedAction}`
            );
        }
    }

    private async writeOutput(
        context: Context,
        args: Pick<MigrateCommand.Args, "force" | "output">,
        data: string
    ): Promise<void> {
        if (args.output === "-") {
            context.ttyAwareLogger.write(data);
            return;
        }
        const outputPath = context.resolveOutputFilePath(args.output);
        if (outputPath == null) {
            throw new CliError({
                message: `Could not resolve output path '${args.output}'`,
                code: CliError.Code.ConfigError
            });
        }
        await writeFileAtomically(outputPath, data, args.force);
        context.stderr.info(`Created SDK Config v1 at ${outputPath}`);
    }
}

async function writeFileAtomically(outputPath: AbsoluteFilePath, data: string, force: boolean): Promise<void> {
    const output = outputPath.toString();
    if (!force) {
        try {
            await writeFile(output, data, { flag: "wx" });
            return;
        } catch (error) {
            if (isErrorWithCode(error, "EEXIST")) {
                throw new CliError({
                    message: `Output file '${output}' already exists. Use --force to replace it.`,
                    code: CliError.Code.ConfigError
                });
            }
            throw error;
        }
    }

    const temporary = join(dirname(output), `.${basename(output)}.${randomUUID()}.tmp`);
    try {
        await writeFile(temporary, data, { flag: "wx" });
        await rename(temporary, output);
    } catch (error) {
        await removeTemporaryFile(temporary, error);
        throw error;
    }
}

async function removeTemporaryFile(temporary: string, originalError?: unknown): Promise<void> {
    try {
        await unlink(temporary);
    } catch (cleanupError) {
        if (isErrorWithCode(cleanupError, "ENOENT")) {
            return;
        }
        if (originalError != null) {
            throw new AggregateError(
                [originalError, cleanupError],
                `Could not complete the output write or remove '${temporary}'`
            );
        }
        throw cleanupError;
    }
}

function isErrorWithCode(error: unknown, code: string): error is NodeJS.ErrnoException {
    return error instanceof Error && "code" in error && error.code === code;
}

export function addMigrateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new MigrateCommand();
    command(
        cli,
        "migrate",
        "Create a Postman SDK Config v1 file from a resolved Fern SDK group",
        (context, args) => cmd.handle(context, args as MigrateCommand.Args),
        (yargs) =>
            yargs
                .option("group", {
                    type: "string",
                    description: "The SDK group to migrate"
                })
                .option("api", {
                    type: "string",
                    description: "The API to migrate when the SDK group references multiple APIs"
                })
                .option("output", {
                    type: "string",
                    alias: "o",
                    demandOption: true,
                    nargs: 1,
                    description: 'Path to write SDK Config v1, or "-" for stdout'
                })
                .option("force", {
                    type: "boolean",
                    default: false,
                    description: "Replace an existing output file"
                })
                .option("strict", {
                    type: "boolean",
                    default: false,
                    description: "Treat mapping diagnostics as errors"
                })
    );
}
