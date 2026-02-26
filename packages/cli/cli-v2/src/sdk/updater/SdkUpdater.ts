import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import { parseDocument } from "yaml";
import type { Context } from "../../context/Context.js";
import { Version } from "../../version.js";
import type { Target } from "../config/Target.js";

export namespace SdkUpdater {
    export interface Config {
        /** The CLI context. */
        context: Context;
    }

    /** A target entry eligible for update resolution. */
    export interface TargetEntry {
        /** Target name from fern.yml (e.g. "typescript", "python"). */
        name: string;
        /** Resolved Docker image reference. */
        image: string;
        /** Current pinned version. */
        currentVersion: string;
    }

    /** A target that has a newer version available. */
    export interface TargetUpdate {
        name: string;
        image: string;
        currentVersion: string;
        latestVersion: string;
    }

    /** A target that is already on the latest version. */
    export interface TargetUpToDate {
        name: string;
        version: string;
    }

    /** A target where a major version upgrade was skipped. */
    export interface SkippedMajorUpgrade {
        name: string;
        currentVersion: string;
        latestMajorVersion: string;
    }

    /** The result of resolving updates for all targets. */
    export interface UpdateResult {
        updates: TargetUpdate[];
        upToDate: TargetUpToDate[];
        skippedMajorUpgrades: SkippedMajorUpgrade[];
    }
}

/**
 * Resolves and applies SDK target version updates.
 *
 * The SdkUpdater is responsible for:
 *  - Collecting eligible targets from the workspace
 *  - Resolving the latest available version for each target
 *  - Writing updated versions back to fern.yml (preserving formatting)
 *
 * The CLI command layer handles orchestration, interactive prompts, and output formatting.
 */
export class SdkUpdater {
    private readonly context: Context;

    constructor(config: SdkUpdater.Config) {
        this.context = config.context;
    }

    /**
     * Collects target entries from workspace targets that are eligible for update.
     *
     * Targets without an explicit version (or set to "latest") are skipped.
     */
    public collectTargetEntries({
        targets,
        targetFilter
    }: {
        targets: Target[];
        targetFilter: string | undefined;
    }): SdkUpdater.TargetEntry[] {
        const entries: SdkUpdater.TargetEntry[] = [];
        for (const target of targets) {
            if (targetFilter != null && target.name !== targetFilter) {
                continue;
            }
            if (target.version === "latest" || target.version == null) {
                continue;
            }
            entries.push({
                name: target.name,
                image: target.image,
                currentVersion: target.version
            });
        }
        return entries;
    }

    /**
     * Resolves the latest version for each target entry.
     *
     * If any target fails to resolve, the entire operation is aborted
     * (partial failures are a no-op).
     */
    public async resolveUpdates({
        entries,
        includeMajor,
        prerelease
    }: {
        entries: SdkUpdater.TargetEntry[];
        includeMajor: boolean;
        prerelease: boolean;
    }): Promise<SdkUpdater.UpdateResult> {
        const channel: "GA" | "RC" | undefined = prerelease ? "RC" : undefined;
        const updates: SdkUpdater.TargetUpdate[] = [];
        const upToDate: SdkUpdater.TargetUpToDate[] = [];
        const skippedMajorUpgrades: SdkUpdater.SkippedMajorUpgrade[] = [];

        for (const entry of entries) {
            const latestVersion = await getLatestGeneratorVersion({
                generatorName: entry.image,
                cliVersion: Version,
                currentGeneratorVersion: entry.currentVersion,
                channel,
                includeMajor
            });

            if (latestVersion != null && latestVersion !== entry.currentVersion) {
                updates.push({
                    name: entry.name,
                    image: entry.image,
                    currentVersion: entry.currentVersion,
                    latestVersion
                });
            } else {
                upToDate.push({
                    name: entry.name,
                    version: entry.currentVersion
                });
            }

            // Check for skipped major upgrades when not including major.
            if (!includeMajor) {
                const latestMajorVersion = await getLatestGeneratorVersion({
                    generatorName: entry.image,
                    cliVersion: Version,
                    currentGeneratorVersion: latestVersion ?? entry.currentVersion,
                    channel,
                    includeMajor: true
                });

                if (latestMajorVersion != null) {
                    const currentMajor = this.parseMajorVersion(latestVersion ?? entry.currentVersion);
                    const latestMajor = this.parseMajorVersion(latestMajorVersion);

                    if (currentMajor != null && latestMajor != null && latestMajor > currentMajor) {
                        skippedMajorUpgrades.push({
                            name: entry.name,
                            currentVersion: latestVersion ?? entry.currentVersion,
                            latestMajorVersion
                        });
                    }
                }
            }
        }

        return { updates, upToDate, skippedMajorUpgrades };
    }

    /**
     * Applies the given updates to the YAML document and writes it back.
     *
     * The document is only written if all updates can be applied successfully.
     */
    public async applyUpdates({
        targetsFilePath,
        targetsPath,
        updates
    }: {
        targetsFilePath: AbsoluteFilePath;
        targetsPath: string[];
        updates: SdkUpdater.TargetUpdate[];
    }): Promise<void> {
        const content = await readFile(targetsFilePath, "utf-8");
        const document = parseDocument(content);

        for (const update of updates) {
            document.setIn([...targetsPath, update.name, "version"], update.latestVersion);
        }

        await writeFile(targetsFilePath, document.toString(), "utf-8");
    }

    /**
     * Resolves the file path and YAML path for the targets section.
     *
     * If the workspace's fern.yml uses a `$ref` for sdks, the targets
     * live in the referenced file at ["targets"]. Otherwise they are
     * at ["sdks", "targets"] in fern.yml itself.
     */
    public resolveTargetsPath({
        fernYmlPath,
        targetsFilePath
    }: {
        fernYmlPath: AbsoluteFilePath;
        targetsFilePath: AbsoluteFilePath;
    }): string[] {
        if (targetsFilePath !== fernYmlPath) {
            return ["targets"];
        }
        return ["sdks", "targets"];
    }

    private parseMajorVersion(version: string): number | undefined {
        const match = /^(\d+)\./.exec(version);
        if (match?.[1] == null) {
            return undefined;
        }
        return Number.parseInt(match[1], 10);
    }
}
