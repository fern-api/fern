import {
    addDefaultDockerOrgIfNotPresent,
    getLatestGeneratorVersion,
    getPathToGeneratorsConfiguration,
    loadRawGeneratorsConfiguration,
    normalizeGeneratorName
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { isFernSdkGenApiEnabled, isPostCutoverGeneratorVersion } from "@fern-api/remote-workspace-runner";
import { CliError, TaskContext } from "@fern-api/task-context";
import { FernRegistry } from "@fern-fern/generators-sdk";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import semver from "semver";
import YAML from "yaml";

import { CliContext } from "../../cli-context/CliContext.js";
import { getChangelogUrl } from "../../utils/getChangelogUrl.js";
import {
    compareGeneratorVersions,
    createSdkGenApiTokenProvider,
    GetSdkGenApiToken,
    getSdkGenApiGeneratorVersions
} from "./getSdkGenApiGeneratorVersions.js";
import { loadAndRunMigrations } from "./migrations/index.js";

interface SkippedMajorUpgrade {
    generatorName: string;
    currentVersion: string;
    latestMajorVersion: string;
}

interface AppliedUpgrade {
    generatorName: string;
    groupName: string;
    previousVersion: string;
    newVersion: string;
    migrationsApplied?: number;
    migrationVersions?: string[];
}

interface AlreadyUpToDate {
    generatorName: string;
    groupName: string;
    version: string;
}

interface StaleCandidate {
    generatorName: string;
    groupName: string;
    currentVersion: string;
    candidateVersion: string;
    backend: "SDK Gen API" | "FDR";
}

interface SkippedAutoreleaseDisabled {
    generatorName: string;
    groupName: string;
    version: string;
}

export interface SdkConfigMigrationRequired {
    generatorName: string;
    groupName: string;
    currentVersion: string;
    sdkConfigVersion: string;
}

/**
 * Whether moving from `currentVersion` to `candidateVersion` crosses the generator's SDK Config cutover.
 * Post-cutover versions are configured from sdk-config.yml, so they cannot be written into generators.yml.
 */
function crossesSdkConfigCutover({
    generatorId,
    currentVersion,
    candidateVersion
}: {
    generatorId: string;
    currentVersion: string;
    candidateVersion: string;
}): boolean {
    return (
        isPostCutoverGeneratorVersion({ generatorName: generatorId, version: candidateVersion }) &&
        !isPostCutoverGeneratorVersion({ generatorName: generatorId, version: currentVersion })
    );
}

export async function loadAndUpdateGenerators({
    absolutePathToWorkspace,
    context,
    generatorFilter,
    groupFilter,
    includeMajor,
    skipAutoreleaseDisabled,
    channel,
    cliVersion,
    organization,
    getSdkGenApiToken
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    generatorFilter: string | undefined;
    groupFilter: string | undefined;
    includeMajor: boolean;
    skipAutoreleaseDisabled: boolean;
    channel: FernRegistry.generators.ReleaseType | undefined;
    cliVersion: string;
    organization: string;
    getSdkGenApiToken?: GetSdkGenApiToken;
}): Promise<{
    updatedConfiguration: string | undefined;
    skippedMajorUpgrades: SkippedMajorUpgrade[];
    appliedUpgrades: AppliedUpgrade[];
    alreadyUpToDate: AlreadyUpToDate[];
    staleCandidates: StaleCandidate[];
    skippedAutoreleaseDisabled: SkippedAutoreleaseDisabled[];
    sdkConfigMigrationRequired: SdkConfigMigrationRequired[];
}> {
    const filepath = await getPathToGeneratorsConfiguration({ absolutePathToWorkspace });

    if (filepath == null || !(await doesPathExist(filepath))) {
        context.logger.debug("Generators configuration file was not found, no generators to upgrade.");
        return {
            updatedConfiguration: undefined,
            skippedMajorUpgrades: [],
            appliedUpgrades: [],
            alreadyUpToDate: [],
            staleCandidates: [],
            skippedAutoreleaseDisabled: [],
            sdkConfigMigrationRequired: []
        };
    }
    const contents = await readFile(filepath);
    context.logger.debug(`Found generators: ${contents.toString()}`);

    const parsedDocument = YAML.parseDocument(contents.toString());
    // We cannot use zod to parse the schema since then it loses order
    // is there a better, type-safe way to do this???
    const generatorGroups = parsedDocument.get("groups");
    if (generatorGroups == null) {
        context.logger.debug("No groups were found within the generators configuration, no generators to upgrade.");
        return {
            updatedConfiguration: undefined,
            skippedMajorUpgrades: [],
            appliedUpgrades: [],
            alreadyUpToDate: [],
            staleCandidates: [],
            skippedAutoreleaseDisabled: [],
            sdkConfigMigrationRequired: []
        };
    }
    if (!YAML.isMap(generatorGroups)) {
        context.failAndThrow(`Expected 'groups' to be a map in ${path.relative(process.cwd(), filepath)}`, undefined, {
            code: CliError.Code.ParseError
        });
        return {
            updatedConfiguration: undefined,
            skippedMajorUpgrades: [],
            appliedUpgrades: [],
            alreadyUpToDate: [],
            staleCandidates: [],
            skippedAutoreleaseDisabled: [],
            sdkConfigMigrationRequired: []
        };
    }
    context.logger.debug(`Groups found: ${generatorGroups.toString()}`);

    const skippedMajorUpgrades: SkippedMajorUpgrade[] = [];
    const appliedUpgrades: AppliedUpgrade[] = [];
    const alreadyUpToDate: AlreadyUpToDate[] = [];
    const staleCandidates: StaleCandidate[] = [];
    const skippedAutoreleaseDisabled: SkippedAutoreleaseDisabled[] = [];
    const sdkConfigMigrationRequired: SdkConfigMigrationRequired[] = [];

    for (const groupBlock of generatorGroups.items) {
        // The typing appears to be off in this lib, but BLOCK.key.value is meant to always be available
        // https://eemeli.org/yaml/#creating-nodes
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        const groupName = (groupBlock.key as any).value as string;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
        const group = groupBlock.value as YAML.YAMLMap<string, YAML.YAMLSeq<YAML.YAMLMap<unknown, unknown>>>;
        if (!YAML.isMap(group)) {
            context.failAndThrow(
                `Expected group ${groupName} to be a map in ${path.relative(process.cwd(), filepath)}`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
            continue;
        }

        if (groupFilter != null && groupFilter !== groupName) {
            context.logger.debug(`Skipping group ${groupName} as it does not match the filter: ${groupFilter}`);
            continue;
        }

        const generators = group.get("generators");

        if (!YAML.isSeq(generators)) {
            context.failAndThrow(
                `Expected group ${groupName} to have a 'generators' key in ${path.relative(process.cwd(), filepath)}`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
            continue;
        }
        context.logger.debug(`Generators found: ${generators.toString()}`);
        for (const generator of generators.items) {
            if (!YAML.isMap(generator)) {
                context.failAndThrow(
                    `Expected generator in group ${groupName} to be a map in ${path.relative(process.cwd(), filepath)}`,
                    undefined,
                    { code: CliError.Code.VersionError }
                );
            }
            // Custom image generators (using `image` instead of `name`) are user-managed
            // and cannot be auto-upgraded. Skip them with a warning.
            if (generator.get("image") != null) {
                const imageNode = generator.get("image");
                const imageName = YAML.isMap(imageNode) ? (imageNode.get("name") as string) : "unknown";
                context.logger.warn(
                    `Skipping custom image generator "${imageName}" in group ${groupName}: ` +
                        `generators using a custom image cannot be auto-upgraded.`
                );
                continue;
            }
            const generatorName = generator.get("name") as string;
            // Normalize the generator name to add default Docker org prefix if not present
            // This is needed because the YAML may contain shorthand names like "fern-csharp-sdk"
            const normalizedGeneratorName = normalizeGeneratorName(generatorName);
            if (normalizedGeneratorName == null) {
                context.logger.warn(
                    `Skipping unrecognized generator: ${generatorName}. The generator will not be upgraded.`
                );
                continue;
            }

            // Normalize the generator filter to add default Docker org prefix if not present
            const normalizedGeneratorFilter =
                generatorFilter != null ? addDefaultDockerOrgIfNotPresent(generatorFilter) : undefined;
            // Compare normalized names so both shorthand and full names work
            if (normalizedGeneratorFilter != null && normalizedGeneratorName !== normalizedGeneratorFilter) {
                context.logger.debug(
                    `Skipping generator ${generatorName} as it does not match the filter: ${generatorFilter}`
                );
                continue;
            }

            if (skipAutoreleaseDisabled && generator.get("autorelease") === false) {
                const currentVersion = generator.get("version") as string;
                context.logger.debug(
                    `Skipping generator ${generatorName} (autorelease disabled, version ${currentVersion})`
                );
                skippedAutoreleaseDisabled.push({
                    generatorName,
                    groupName,
                    version: currentVersion
                });
                continue;
            }

            const currentGeneratorVersion = generator.get("version") as string;
            const tracksLatest = currentGeneratorVersion === "latest";
            // `latest` never looks up versions, so it needs no flag request.
            const useSdkGenApi =
                !tracksLatest &&
                (await isFernSdkGenApiEnabled({
                    organization,
                    generatorName: addDefaultDockerOrgIfNotPresent(generatorName)
                }));
            if (useSdkGenApi && getSdkGenApiToken == null) {
                throw new Error("SDK Gen API generator version discovery requires authentication");
            }
            // SDK Gen API preserves legacy generator identities that FDR normalizes to a shared generator.
            const generatorId = addDefaultDockerOrgIfNotPresent(generatorName);
            const resolveCandidateVersion = async (
                allowMajor: boolean
            ): Promise<{
                version: string | undefined;
                sdkGenApiVersions?: Awaited<ReturnType<typeof getSdkGenApiGeneratorVersions>>;
            }> => {
                if (tracksLatest) {
                    return { version: currentGeneratorVersion };
                }
                if (useSdkGenApi && getSdkGenApiToken != null) {
                    const sdkGenApiVersions = await getSdkGenApiGeneratorVersions({
                        generatorId,
                        currentVersion: currentGeneratorVersion,
                        includeMajor: allowMajor,
                        channel,
                        organization,
                        getToken: getSdkGenApiToken,
                        context
                    });
                    return { version: sdkGenApiVersions.compatibleVersion, sdkGenApiVersions };
                }
                return {
                    version: await getLatestGeneratorVersion({
                        generatorName: normalizedGeneratorName,
                        cliVersion,
                        currentGeneratorVersion,
                        channel,
                        includeMajor: allowMajor,
                        context
                    })
                };
            };
            const { version: candidateVersion, sdkGenApiVersions } = await resolveCandidateVersion(includeMajor);
            let latestVersion = candidateVersion;
            const crossingCandidate =
                candidateVersion != null &&
                crossesSdkConfigCutover({
                    generatorId,
                    currentVersion: currentGeneratorVersion,
                    candidateVersion
                })
                    ? candidateVersion
                    : undefined;
            let migrationEntry: SdkConfigMigrationRequired | undefined;
            if (crossingCandidate != null) {
                // A post-cutover version is configured from sdk-config.yml, so writing it into
                // generators.yml would leave a configuration that `fern generate` rejects.
                migrationEntry = {
                    generatorName,
                    groupName,
                    currentVersion: currentGeneratorVersion,
                    sdkConfigVersion: crossingCandidate
                };
                sdkConfigMigrationRequired.push(migrationEntry);
                const fallbackVersion = includeMajor ? (await resolveCandidateVersion(false)).version : undefined;
                latestVersion =
                    fallbackVersion != null &&
                    !crossesSdkConfigCutover({
                        generatorId,
                        currentVersion: currentGeneratorVersion,
                        candidateVersion: fallbackVersion
                    })
                        ? fallbackVersion
                        : undefined;
            }

            const versionComparison =
                latestVersion == null
                    ? undefined
                    : compareGeneratorVersions({
                          generatorId: normalizedGeneratorName,
                          candidateVersion: latestVersion,
                          currentVersion: currentGeneratorVersion
                      });
            const upgradeAvailable = versionComparison === 1;
            const candidateIsOlder = versionComparison === -1;
            const versionToUse = upgradeAvailable && latestVersion != null ? latestVersion : currentGeneratorVersion;
            if (migrationEntry != null) {
                // Report the version left in generators.yml after any same-major fallback.
                migrationEntry.currentVersion = versionToUse;
            }

            if (latestVersion != null) {
                if (upgradeAvailable) {
                    context.logger.debug(
                        chalk.green(`Upgrading ${generatorName} from ${currentGeneratorVersion} to ${latestVersion}`)
                    );

                    // Update the version in YAML
                    generator.set("version", latestVersion);

                    // Run migrations if available
                    let migrationsApplied = 0;
                    let migrationVersions: string[] = [];

                    // Convert YAML map to plain object for migration
                    // toJSON() returns a plain object with all the YAML properties
                    const currentConfig = generator.toJSON();

                    const migrationResult = await loadAndRunMigrations({
                        generatorName: normalizedGeneratorName,
                        from: currentGeneratorVersion,
                        to: latestVersion,
                        config: currentConfig,
                        logger: context.logger
                    });

                    if (migrationResult != null) {
                        migrationsApplied = migrationResult.migrationsApplied;
                        migrationVersions = migrationResult.appliedVersions;

                        // Apply migrated config back to YAML, preserving formatting and comments
                        // Get the original and migrated keys to detect what changed
                        const originalKeys = new Set(Object.keys(currentConfig));
                        const migratedKeys = new Set(Object.keys(migrationResult.config));

                        // Remove keys that are in original but not in migration result
                        for (const key of originalKeys) {
                            if (!migratedKeys.has(key)) {
                                generator.delete(key);
                            }
                        }

                        // Add or update keys from migration result
                        for (const [key, value] of Object.entries(migrationResult.config)) {
                            generator.set(key, value);
                        }

                        context.logger.debug(
                            chalk.dim(`Applied ${migrationsApplied} migration(s): ${migrationVersions.join(", ")}`)
                        );
                    }

                    appliedUpgrades.push({
                        generatorName,
                        groupName,
                        previousVersion: currentGeneratorVersion,
                        newVersion: latestVersion,
                        migrationsApplied: migrationsApplied > 0 ? migrationsApplied : undefined,
                        migrationVersions: migrationVersions.length > 0 ? migrationVersions : undefined
                    });
                } else if (candidateIsOlder) {
                    const backend = useSdkGenApi ? "SDK Gen API" : "FDR";
                    staleCandidates.push({
                        generatorName,
                        groupName,
                        currentVersion: currentGeneratorVersion,
                        candidateVersion: latestVersion,
                        backend
                    });
                    context.logger.warn(
                        `Ignoring stale ${backend} candidate ${latestVersion} for ${generatorName}; ` +
                            `the configured version ${currentGeneratorVersion} is newer.`
                    );
                } else {
                    // Generator is already on the latest version
                    context.logger.debug(
                        chalk.gray(`${generatorName} is already on the latest version: ${currentGeneratorVersion}`)
                    );
                    alreadyUpToDate.push({
                        generatorName,
                        groupName,
                        version: currentGeneratorVersion
                    });
                }
            }

            if (!includeMajor && !tracksLatest) {
                const latestMajorVersion = useSdkGenApi
                    ? sdkGenApiVersions?.withheldMajorVersion
                    : await getLatestGeneratorVersion({
                          generatorName: normalizedGeneratorName,
                          cliVersion,
                          currentGeneratorVersion: versionToUse,
                          channel,
                          includeMajor: true,
                          context
                      });

                if (latestMajorVersion != null) {
                    const currentParsed = semver.parse(versionToUse);
                    const latestParsed = semver.parse(latestMajorVersion);

                    if (currentParsed != null && latestParsed != null && latestParsed.major > currentParsed.major) {
                        if (
                            !crossesSdkConfigCutover({
                                generatorId,
                                currentVersion: versionToUse,
                                candidateVersion: latestMajorVersion
                            })
                        ) {
                            skippedMajorUpgrades.push({
                                generatorName,
                                currentVersion: versionToUse,
                                latestMajorVersion
                            });
                        } else if (migrationEntry == null) {
                            // `--include-major` would cross the cutover, so point at migration instead.
                            sdkConfigMigrationRequired.push({
                                generatorName,
                                groupName,
                                currentVersion: versionToUse,
                                sdkConfigVersion: latestMajorVersion
                            });
                        } else if (semver.gt(latestMajorVersion, migrationEntry.sdkConfigVersion)) {
                            // Report the newest post-cutover version, not the first one discovered.
                            migrationEntry.sdkConfigVersion = latestMajorVersion;
                        }
                    }
                }
            }
        }
    }

    return {
        updatedConfiguration: parsedDocument.toString(),
        skippedMajorUpgrades,
        appliedUpgrades,
        alreadyUpToDate,
        staleCandidates,
        skippedAutoreleaseDisabled,
        sdkConfigMigrationRequired
    };
}

export async function upgradeGenerator({
    cliContext,
    generator,
    group,
    project,
    includeMajor,
    skipAutoreleaseDisabled,
    channel
}: {
    cliContext: CliContext;
    generator: string | undefined;
    group: string | undefined;
    project: Project;
    includeMajor: boolean;
    skipAutoreleaseDisabled: boolean;
    channel: FernRegistry.generators.ReleaseType | undefined;
}): Promise<void> {
    const { apiWorkspaces } = project;
    // Lazy: only generators the `use-sdk-gen-api` flag routes through sdk-gen-api trigger a login.
    const getSdkGenApiToken = createSdkGenApiTokenProvider(cliContext);
    const allSkippedMajorUpgrades: SkippedMajorUpgrade[] = [];
    const allAppliedUpgrades: Array<{ workspace: string | undefined; upgrades: AppliedUpgrade[] }> = [];
    const allAlreadyUpToDate: Array<{ workspace: string | undefined; upToDate: AlreadyUpToDate[] }> = [];
    const allStaleCandidates: Array<{ workspace: string | undefined; stale: StaleCandidate[] }> = [];
    const allSkippedAutoreleaseDisabled: Array<{
        workspace: string | undefined;
        skipped: SkippedAutoreleaseDisabled[];
    }> = [];
    const allSdkConfigMigrationRequired: Array<{
        workspace: string | undefined;
        required: SdkConfigMigrationRequired[];
    }> = [];

    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const generatorsConfiguration =
                    (await loadRawGeneratorsConfiguration({
                        absolutePathToWorkspace: workspace.absoluteFilePath,
                        context
                    })) ?? {};
                if (generatorsConfiguration == null || generatorsConfiguration.groups == null) {
                    context.logger.debug(
                        "No groups were found within the generators configuration, no generators to upgrade."
                    );
                    return;
                }

                if (workspace.workspaceName == null) {
                    context.logger.info("Upgrading generators.");
                } else {
                    context.logger.info(`Upgrading generators in workspace: ${workspace.workspaceName}.`);
                }

                const result = await loadAndUpdateGenerators({
                    absolutePathToWorkspace: workspace.absoluteFilePath,
                    context,
                    generatorFilter: generator,
                    groupFilter: group,
                    includeMajor,
                    skipAutoreleaseDisabled,
                    channel,
                    cliVersion: cliContext.environment.packageVersion,
                    organization: project.config.organization,
                    getSdkGenApiToken
                });

                const absolutePathToGeneratorsConfiguration = await getPathToGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilePath
                });

                if (absolutePathToGeneratorsConfiguration != null && result.updatedConfiguration != null) {
                    await writeFile(absolutePathToGeneratorsConfiguration, result.updatedConfiguration);
                }

                allSkippedMajorUpgrades.push(...result.skippedMajorUpgrades);
                if (result.appliedUpgrades.length > 0) {
                    allAppliedUpgrades.push({
                        workspace: workspace.workspaceName,
                        upgrades: result.appliedUpgrades
                    });
                }
                if (result.alreadyUpToDate.length > 0) {
                    allAlreadyUpToDate.push({
                        workspace: workspace.workspaceName,
                        upToDate: result.alreadyUpToDate
                    });
                }
                if (result.staleCandidates.length > 0) {
                    allStaleCandidates.push({
                        workspace: workspace.workspaceName,
                        stale: result.staleCandidates
                    });
                }
                if (result.skippedAutoreleaseDisabled.length > 0) {
                    allSkippedAutoreleaseDisabled.push({
                        workspace: workspace.workspaceName,
                        skipped: result.skippedAutoreleaseDisabled
                    });
                }
                if (result.sdkConfigMigrationRequired.length > 0) {
                    allSdkConfigMigrationRequired.push({
                        workspace: workspace.workspaceName,
                        required: result.sdkConfigMigrationRequired
                    });
                }
            });
        })
    );

    if (allAppliedUpgrades.length > 0) {
        cliContext.logger.info("");
        cliContext.logger.info(chalk.green("Successfully upgraded generators:"));

        for (const { workspace, upgrades } of allAppliedUpgrades) {
            const upgradesByGroup = new Map<string, AppliedUpgrade[]>();
            for (const upgrade of upgrades) {
                const existing = upgradesByGroup.get(upgrade.groupName) ?? [];
                existing.push(upgrade);
                upgradesByGroup.set(upgrade.groupName, existing);
            }

            for (const [groupName, groupUpgrades] of upgradesByGroup) {
                const workspacePrefix = workspace != null ? `[${workspace}] ` : "";
                cliContext.logger.info(chalk.green(`${workspacePrefix}Group ${groupName}:`));

                for (const upgrade of groupUpgrades) {
                    cliContext.logger.info(
                        chalk.green(
                            `  - ${upgrade.generatorName}: ${chalk.dim(upgrade.previousVersion)} → ${upgrade.newVersion}`
                        )
                    );
                    // Show migration info if migrations were applied
                    if (upgrade.migrationsApplied != null && upgrade.migrationsApplied > 0) {
                        cliContext.logger.info(
                            chalk.dim(
                                `    Applied ${upgrade.migrationsApplied} migration(s): ${upgrade.migrationVersions?.join(", ") ?? ""}`
                            )
                        );
                    }
                    // Use normalized name for changelog lookup since the map uses fernapi/... keys
                    const changelogUrl = getChangelogUrl(addDefaultDockerOrgIfNotPresent(upgrade.generatorName));
                    if (changelogUrl != null) {
                        cliContext.logger.info(chalk.dim(`    Changelog: ${changelogUrl}`));
                    }
                }
            }
        }
    }

    if (allAlreadyUpToDate.length > 0) {
        cliContext.logger.info("");
        cliContext.logger.info(chalk.dim("Generators already on latest version:"));

        for (const { workspace, upToDate } of allAlreadyUpToDate) {
            const upToDateByGroup = new Map<string, AlreadyUpToDate[]>();
            for (const item of upToDate) {
                const existing = upToDateByGroup.get(item.groupName) ?? [];
                existing.push(item);
                upToDateByGroup.set(item.groupName, existing);
            }

            for (const [groupName, groupItems] of upToDateByGroup) {
                const workspacePrefix = workspace != null ? `[${workspace}] ` : "";
                cliContext.logger.info(chalk.dim(`${workspacePrefix}Group ${groupName}:`));

                for (const item of groupItems) {
                    cliContext.logger.info(chalk.dim(`  - ${item.generatorName}: ${item.version} (latest)`));
                }
            }
        }
    }

    if (allStaleCandidates.length > 0) {
        cliContext.logger.info("");
        cliContext.logger.info(chalk.yellow("Ignored stale generator candidates:"));
        for (const { workspace, stale } of allStaleCandidates) {
            const workspacePrefix = workspace != null ? `[${workspace}] ` : "";
            for (const item of stale) {
                cliContext.logger.info(
                    chalk.yellow(
                        `  - ${workspacePrefix}${item.generatorName}: ${item.candidateVersion} from ${item.backend} ` +
                            `(configured: ${item.currentVersion})`
                    )
                );
            }
        }
    }

    if (
        allAppliedUpgrades.length === 0 &&
        allAlreadyUpToDate.length === 0 &&
        allStaleCandidates.length === 0 &&
        allSdkConfigMigrationRequired.length === 0
    ) {
        const filterMessage =
            group != null ? ` for group ${group}` : generator != null ? ` for generator ${generator}` : "";
        cliContext.logger.info("");
        cliContext.logger.info(chalk.gray(`No generators found${filterMessage}.`));
    }

    if (allSkippedAutoreleaseDisabled.length > 0) {
        cliContext.logger.info("");
        cliContext.logger.info(chalk.dim("Skipped generators with autorelease disabled:"));

        for (const { workspace, skipped } of allSkippedAutoreleaseDisabled) {
            const skippedByGroup = new Map<string, SkippedAutoreleaseDisabled[]>();
            for (const item of skipped) {
                const existing = skippedByGroup.get(item.groupName) ?? [];
                existing.push(item);
                skippedByGroup.set(item.groupName, existing);
            }

            for (const [groupName, groupItems] of skippedByGroup) {
                const workspacePrefix = workspace != null ? `[${workspace}] ` : "";
                cliContext.logger.info(chalk.dim(`${workspacePrefix}Group ${groupName}:`));

                for (const item of groupItems) {
                    cliContext.logger.info(
                        chalk.dim(`  - ${item.generatorName}: ${item.version} (autorelease disabled)`)
                    );
                }
            }
        }
    }

    if (allSkippedMajorUpgrades.length > 0) {
        cliContext.logger.info("");
        cliContext.logger.info(chalk.yellow("Major version upgrades available:"));
        for (const upgrade of allSkippedMajorUpgrades) {
            cliContext.logger.info(
                chalk.yellow(`  - ${upgrade.generatorName}: ${upgrade.currentVersion} → ${upgrade.latestMajorVersion}`)
            );
            const upgradeCommand =
                generator != null
                    ? `fern generator upgrade --generator ${upgrade.generatorName} --include-major`
                    : `fern generator upgrade --include-major`;
            cliContext.logger.info(chalk.yellow(`    Run: ${upgradeCommand}`));
            // Use normalized name for changelog lookup since the map uses fernapi/... keys
            const changelogUrl = getChangelogUrl(addDefaultDockerOrgIfNotPresent(upgrade.generatorName));
            if (changelogUrl != null) {
                cliContext.logger.info(chalk.yellow(`    Changelog: ${changelogUrl}`));
            }
        }
    }

    if (allSdkConfigMigrationRequired.length > 0) {
        cliContext.logger.info("");
        cliContext.logger.info(chalk.yellow("SDK Config migration required:"));
        for (const { workspace, required } of allSdkConfigMigrationRequired) {
            const workspacePrefix = workspace != null ? `[${workspace}] ` : "";
            for (const item of required) {
                cliContext.logger.info(
                    chalk.yellow(
                        `  - ${workspacePrefix}${item.generatorName}: ${item.currentVersion} → ${item.sdkConfigVersion} ` +
                            "requires SDK Config, so generators.yml was not moved past the cutover"
                    )
                );
            }
        }
        cliContext.logger.info(chalk.yellow("    Run: fern sdk migrate"));
    }
}
