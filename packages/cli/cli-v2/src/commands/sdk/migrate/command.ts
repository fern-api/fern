import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import {
    type FernConfigMappingDiagnostic,
    FernConfigMappingError,
    type FernResolvedGeneratorGroupInput,
    type FernResolvedGeneratorInput,
    mapFernConfigToSdkConfigV1,
    parseSdkConfigV1,
    type SdkConfigV1ApiConfigInput,
    type SdkConfigV1OutputConfig,
    type SdkConfigV1PackageConfig,
    type SdkConfigV1PublishConfig
} from "@postman/sdk-config/sdk-config/v1";
import { randomUUID } from "crypto";
import { link, rename, unlink, writeFile } from "fs/promises";
import { basename, dirname, join } from "path";
import type { Argv } from "yargs";
import { LegacyFernWorkspaceAdapter } from "../../../api/adapter/LegacyFernWorkspaceAdapter.js";
import type { ApiDefinition } from "../../../api/config/ApiDefinition.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { LegacyGeneratorInvocationAdapter } from "../../../sdk/adapter/LegacyGeneratorInvocationAdapter.js";
import type { Target } from "../../../sdk/config/Target.js";
import { promptSelect } from "../../../ui/promptSelect.js";
import type { Workspace } from "../../../workspace/Workspace.js";
import { command } from "../../_internal/command.js";

export declare namespace MigrateCommand {
    export interface Args extends GlobalArgs {
        api?: string;
        force: boolean;
        group?: string;
        output: string;
        strict: boolean;
    }
}

interface Selection {
    apiName: string;
    groupName: string | undefined;
    targets: Target[];
}

interface MapperProjection {
    diagnostics: FernConfigMappingDiagnostic[];
    input: FernResolvedGeneratorGroupInput;
}

interface PublicationProjection {
    diagnostics: FernConfigMappingDiagnostic[];
    package?: SdkConfigV1PackageConfig;
    publish?: SdkConfigV1PublishConfig;
}

export class MigrateCommand {
    public async handle(context: Context, args: MigrateCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();
        const selection = await this.selectTargets(context, workspace, args);

        const projection = await this.buildMapperInput(context, workspace, selection);
        let mapped;
        try {
            mapped = mapFernConfigToSdkConfigV1(projection.input);
        } catch (error) {
            if (error instanceof FernConfigMappingError) {
                this.printDiagnostics(context, error.issues);
                throw new CliError({ message: "Could not create SDK Config v1", code: CliError.Code.ValidationError });
            }
            throw error;
        }

        const diagnostics = [...projection.diagnostics, ...mapped.unsupportedFields];
        this.printDiagnostics(context, diagnostics);
        if (args.strict && diagnostics.length > 0) {
            throw new CliError({
                message: "SDK Config migration produced diagnostics in strict mode",
                code: CliError.Code.ValidationError
            });
        }

        const sdkConfig = parseSdkConfigV1(mapped.sdkConfig);
        const contents = JSON.stringify(sdkConfig, null, 2);
        await this.writeOutput(context, args, `${contents}\n`);
    }

    private async selectTargets(
        context: Context,
        workspace: Workspace,
        args: Pick<MigrateCommand.Args, "api" | "group">
    ): Promise<Selection> {
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
                message: `SDK group '${groupName ?? "default"}' has no targets for API '${apiName}'`,
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
        return promptSelect({
            isTTY: context.isTTY,
            message: "Multiple SDK groups found. Select one:",
            choices: groups.map((group) => ({ name: group, value: group })),
            nonInteractiveError: `Multiple SDK groups found: ${groups.join(", ")}. Use --group to select one.`,
            flagHint: (group) => `--group ${group}`
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

    private async buildMapperInput(
        context: Context,
        workspace: Workspace,
        selection: Selection
    ): Promise<MapperProjection> {
        const apiDefinition = workspace.apis[selection.apiName];
        if (apiDefinition == null) {
            throw new CliError({ message: `API '${selection.apiName}' not found`, code: CliError.Code.ConfigError });
        }
        const fernWorkspace = await new LegacyFernWorkspaceAdapter({
            context,
            cliVersion: workspace.cliVersion
        }).adapt(apiDefinition);
        const invocationAdapter = new LegacyGeneratorInvocationAdapter({ context });
        const targetProjections = await Promise.all(
            selection.targets.map(async (target, index) => {
                const invocation = await invocationAdapter.adapt(target);
                const publication =
                    target.output.git == null ? this.projectPublication(target, index) : { diagnostics: [] };
                const packageConfig = { ...target.metadata, ...publication.package };
                const output: SdkConfigV1OutputConfig | undefined =
                    target.output.git != null
                        ? undefined
                        : target.output.path != null
                          ? {
                                delivery: "files",
                                path: target.output.path,
                                ...(publication.publish == null ? {} : { publish: publication.publish })
                            }
                          : publication.publish == null
                            ? undefined
                            : { delivery: "zip", publish: publication.publish };
                const generator: FernResolvedGeneratorInput = {
                    ...invocation,
                    sdkLanguage: target.lang,
                    readme: target.readme,
                    ...(Object.keys(packageConfig).length > 0 ? { package: packageConfig } : {}),
                    ...(output == null ? {} : { output })
                };
                return { diagnostics: publication.diagnostics, generator };
            })
        );
        const apiProjection = this.projectApi(apiDefinition);

        return {
            diagnostics: [...apiProjection.diagnostics, ...targetProjections.flatMap(({ diagnostics }) => diagnostics)],
            input: {
                apiName: fernWorkspace.definition.rootApiFile.contents.name,
                apiVersion: fernWorkspace.definition.specVersion,
                api: apiProjection.api,
                group: {
                    name: selection.groupName,
                    // fern.yml currently retains target group membership but not group audience selection.
                    audiences: { type: "all" },
                    generators: targetProjections.map(({ generator }) => generator)
                }
            }
        };
    }

    private projectApi(definition: ApiDefinition): {
        api: SdkConfigV1ApiConfigInput;
        diagnostics: FernConfigMappingDiagnostic[];
    } {
        const environments = Object.entries(definition.environments ?? {}).map(([name, environment]) => ({
            name,
            urls:
                typeof environment === "string"
                    ? [{ name: "default", url: environment }]
                    : "url" in environment
                      ? [{ name: "default", url: environment.url }]
                      : Object.entries(environment.urls).map(([serverName, url]) => ({ name: serverName, url })),
            ...(typeof environment === "string" || environment.docs == null ? {} : { description: environment.docs })
        }));
        const headers = Object.entries(definition.headers ?? {}).map(([headerName, header]) =>
            typeof header === "string"
                ? { name: headerName, value: header }
                : {
                      name: header.name ?? headerName,
                      ...(header.env == null ? {} : { environmentVariable: header.env }),
                      ...(header.docs == null ? {} : { description: header.docs })
                  }
        );
        const diagnostics: FernConfigMappingDiagnostic[] = [];
        if (definition.auth != null || definition.authSchemes != null) {
            diagnostics.push({
                code: "FERN_API_AUTH_REQUIRES_REVIEW",
                severity: "warning",
                path: ["api", "auth"],
                reason: "Fern API authentication cannot yet be represented safely by this migration command",
                sdkConfigPath: ["api", "auth"],
                suggestedAction: "Review the Fern auth schemes and configure api.auth manually in SDK Config v1."
            });
        }
        return {
            api: {
                ...(definition.defaultUrl == null ? {} : { baseUrl: definition.defaultUrl }),
                ...(definition.defaultEnvironment == null ? {} : { defaultEnvironment: definition.defaultEnvironment }),
                ...(environments.length === 0 ? {} : { environments }),
                ...(headers.length === 0 ? {} : { headers })
            },
            diagnostics
        };
    }

    private projectPublication(target: Target, index: number): PublicationProjection {
        const publish = target.publish;
        if (publish == null) {
            return { diagnostics: [] };
        }
        const prefix = ["group", "generators", index, "publish"] as (string | number)[];
        if (target.lang === "typescript" && publish.npm != null) {
            return {
                diagnostics: credentialDiagnostic(prefix, "npm", "token", publish.npm.token),
                package: { packageName: publish.npm.packageName },
                publish: { registry: "npm", ...(publish.npm.url == null ? {} : { url: publish.npm.url }) }
            };
        }
        if (target.lang === "python" && publish.pypi != null) {
            return {
                diagnostics: [
                    ...credentialDiagnostic(prefix, "pypi", "token", publish.pypi.token),
                    ...credentialDiagnostic(prefix, "pypi", "username", publish.pypi.username),
                    ...credentialDiagnostic(prefix, "pypi", "password", publish.pypi.password)
                ],
                package: {
                    packageName: publish.pypi.packageName,
                    ...(publish.pypi.metadata?.keywords == null ? {} : { keywords: publish.pypi.metadata.keywords }),
                    ...(publish.pypi.metadata?.documentationLink == null
                        ? {}
                        : { documentationUrl: publish.pypi.metadata.documentationLink }),
                    ...(publish.pypi.metadata?.homepageLink == null
                        ? {}
                        : { homepage: publish.pypi.metadata.homepageLink })
                },
                publish: { registry: "pypi", ...(publish.pypi.url == null ? {} : { url: publish.pypi.url }) }
            };
        }
        if (target.lang === "java" && publish.maven != null) {
            const [groupId, artifactId, extra] = publish.maven.coordinate.split(":");
            const coordinateIsValid = Boolean(groupId) && Boolean(artifactId) && extra == null;
            const diagnostics = [
                ...credentialDiagnostic(prefix, "maven", "username", publish.maven.username),
                ...credentialDiagnostic(prefix, "maven", "password", publish.maven.password),
                ...credentialDiagnostic(prefix, "maven", "signature", publish.maven.signature)
            ];
            if (!coordinateIsValid) {
                return {
                    diagnostics: [
                        ...diagnostics,
                        publicationDiagnostic(
                            prefix,
                            "maven.coordinate",
                            "Maven coordinates must use groupId:artifactId format"
                        )
                    ]
                };
            }
            return {
                diagnostics,
                package: { groupId, artifactId },
                publish: { registry: "maven", ...(publish.maven.url == null ? {} : { url: publish.maven.url }) }
            };
        }
        if (target.lang === "csharp" && publish.nuget != null) {
            return {
                diagnostics: credentialDiagnostic(prefix, "nuget", "apiKey", publish.nuget.apiKey),
                package: { packageName: publish.nuget.packageName },
                publish: { registry: "nuget", ...(publish.nuget.url == null ? {} : { url: publish.nuget.url }) }
            };
        }
        if (target.lang === "ruby" && publish.rubygems != null) {
            return {
                diagnostics: credentialDiagnostic(prefix, "rubygems", "apiKey", publish.rubygems.apiKey),
                package: { packageName: publish.rubygems.packageName },
                publish: {
                    registry: "rubygems",
                    ...(publish.rubygems.url == null ? {} : { url: publish.rubygems.url })
                }
            };
        }
        if (target.lang === "rust" && publish.crates != null) {
            return {
                diagnostics: credentialDiagnostic(prefix, "crates", "token", publish.crates.token),
                package: { packageName: publish.crates.packageName },
                publish: { registry: "crates", ...(publish.crates.url == null ? {} : { url: publish.crates.url }) }
            };
        }
        return {
            diagnostics: [
                publicationDiagnostic(
                    prefix,
                    target.lang,
                    `No matching publication configuration exists for ${target.lang}`
                )
            ]
        };
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
            context.stdout.info(data.trimEnd());
            return;
        }
        const outputPath = context.resolveOutputFilePath(args.output);
        if (outputPath == null) {
            throw new CliError({ message: "--output is required", code: CliError.Code.ConfigError });
        }
        await writeFileAtomically(outputPath, data, args.force);
        context.stderr.info(`Created SDK Config v1 at ${outputPath}`);
    }
}

function credentialDiagnostic(
    prefix: (string | number)[],
    registry: string,
    field: string,
    value: unknown
): FernConfigMappingDiagnostic[] {
    if (value == null) {
        return [];
    }
    return [
        {
            code: "FERN_OUTPUT_CREDENTIAL_UNSUPPORTED",
            severity: "warning",
            path: [...prefix, registry, field],
            reason: "Fern output credentials and signatures are not represented by SDK Config v1",
            suggestedAction: "Configure publication credentials and signing secrets outside SDK Config."
        }
    ];
}

function publicationDiagnostic(
    prefix: (string | number)[],
    field: string,
    reason: string
): FernConfigMappingDiagnostic {
    return {
        code: "FERN_PUBLICATION_UNSUPPORTED",
        severity: "warning",
        path: [...prefix, field],
        reason,
        suggestedAction: "Set target.output.publish and target.package manually in SDK Config v1."
    };
}

async function writeFileAtomically(outputPath: AbsoluteFilePath, data: string, force: boolean): Promise<void> {
    const output = outputPath.toString();
    const temporary = join(dirname(output), `.${basename(output)}.${randomUUID()}.tmp`);
    try {
        await writeFile(temporary, data, { flag: "wx" });
        if (force) {
            await rename(temporary, output);
        } else {
            await link(temporary, output);
        }
    } catch (error) {
        if (!force && isErrorWithCode(error, "EEXIST")) {
            throw new CliError({
                message: `Output file '${output}' already exists. Use --force to replace it.`,
                code: CliError.Code.ConfigError
            });
        }
        throw error;
    } finally {
        try {
            await unlink(temporary);
        } catch {
            // The temporary file was already moved, linked and removed, or never created.
        }
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
