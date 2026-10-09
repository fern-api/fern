import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
    APIS_DIRECTORY,
    getFernDirectory,
    PROJECT_CONFIG_FILENAME,
    SDK_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, cwd, doesPathExist } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import type { CliContext } from "../../cli-context/CliContext.js";
import { hasCliTarget, RENAMED_SDK_CONFIG } from "./retargetSdkConfig.js";
import { formatDiagnostic, formatReport, runRubicon } from "./runRubicon.js";

export interface SdkRubiconArgs {
    api?: string;
    config?: string;
    output?: string;
    generatorVersion?: string;
    force: boolean;
    dryRun: boolean;
    strict: boolean;
}

const DEFAULT_ORGANIZATION = "my-organization";

/**
 * `fern sdk rubicon`: translates the cli target of sdk-config.yml into a generators.yml for
 * fernapi/fern-cli-generator, then takes the target out of sdk-config.yml. A stopgap until Postman's
 * own CLI generator ships; see README.md in this folder.
 */
export async function sdkRubicon({
    cliContext,
    args
}: {
    cliContext: CliContext;
    args: SdkRubiconArgs;
}): Promise<void> {
    const fernDirectory = await getFernDirectory();
    const configPath = await resolveConfigPath(args, fernDirectory?.toString());
    const outDir = args.output != null ? resolve(cwd(), args.output) : dirname(configPath);
    const fernConfigPaths = [
        ...(fernDirectory != null ? [join(fernDirectory.toString(), PROJECT_CONFIG_FILENAME)] : []),
        join(outDir, PROJECT_CONFIG_FILENAME)
    ];
    const fernConfig = await readFernConfig(fernConfigPaths);

    const result = await cliContext.runTask((context) =>
        runRubicon({
            context,
            configPath,
            outDir,
            apiName: args.api ?? "api",
            organization: fernConfig.organization ?? DEFAULT_ORGANIZATION,
            createFernConfig: !fernConfig.exists,
            generatorVersion: args.generatorVersion,
            force: args.force,
            dryRun: args.dryRun,
            strict: args.strict
        })
    );

    cliContext.instrumentPostHogEvent({
        command: "fern sdk rubicon",
        properties: {
            outcome: result.written ? "written" : result.dryRun && result.changes != null ? "dry-run" : "stopped",
            diagnosticCodes: [...new Set(result.diagnostics.map((diagnostic) => diagnostic.code))]
        }
    });
    for (const diagnostic of result.diagnostics) {
        cliContext.stderr.warn(formatDiagnostic(diagnostic));
    }
    if (result.changes == null) {
        const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
        throw new CliError({
            message:
                errors > 0
                    ? `rubicon found ${errors} error(s); nothing was written.`
                    : "rubicon stopped on warnings (--strict); nothing was written.",
            code: CliError.Code.ValidationError
        });
    }
    for (const line of formatReport(result, { api: args.api })) {
        cliContext.stderr.info(line);
    }
}

async function resolveConfigPath(args: SdkRubiconArgs, fernDirectory: string | undefined): Promise<string> {
    if (args.config != null) {
        return resolve(cwd(), args.config);
    }
    if (fernDirectory == null) {
        throw configError(
            "No fern directory was found. Pass --config <path to sdk-config.yml>, or run from a project with a fern folder."
        );
    }
    const workspace = args.api != null ? join(fernDirectory, APIS_DIRECTORY, args.api) : fernDirectory;
    const configPath = await chooseConfigPath(workspace);
    if (configPath == null) {
        throw configError(
            args.api != null
                ? `No ${SDK_CONFIG_FILENAME} with a cli target for API '${args.api}' in ${workspace}.`
                : `No ${SDK_CONFIG_FILENAME} with a cli target in ${workspace}. For a multi-API project, pass --api <name>.`
        );
    }
    return configPath;
}

/**
 * sdk-config.yml when it has a cli target (a first run); otherwise sdk-config.rubicon.yml, the
 * cli-only file a previous run left (a rerun).
 */
export async function chooseConfigPath(workspace: string): Promise<string | undefined> {
    const primary = join(workspace, SDK_CONFIG_FILENAME);
    if ((await doesPathExist(AbsoluteFilePath.of(primary))) && hasCliTarget(await readFile(primary, "utf8"))) {
        return primary;
    }
    const rerun = join(workspace, RENAMED_SDK_CONFIG);
    return (await doesPathExist(AbsoluteFilePath.of(rerun))) ? rerun : undefined;
}

/** The first fern.config.json found, and its organization. Rubicon never overwrites an existing one. */
async function readFernConfig(paths: string[]): Promise<{ exists: boolean; organization: string | undefined }> {
    for (const path of paths) {
        let contents: string;
        try {
            contents = await readFile(path, "utf8");
        } catch (error) {
            if (isMissing(error)) {
                continue;
            }
            throw error;
        }
        const parsed: unknown = JSON.parse(contents);
        return {
            exists: true,
            organization: isRecord(parsed) && typeof parsed.organization === "string" ? parsed.organization : undefined
        };
    }
    return { exists: false, organization: undefined };
}

function configError(message: string): CliError {
    return new CliError({ message, code: CliError.Code.ConfigError });
}

function isMissing(error: unknown): boolean {
    return typeof error === "object" && error != null && "code" in error && error.code === "ENOENT";
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
