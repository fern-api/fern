import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { Version } from "../../version.js";
import { DOCKER_IMAGE_TO_CHANGELOG_URL } from "../config/converter/constants.js";
import type { Target } from "../config/Target.js";

export namespace SdkUpdater {
    /** A target that has a newer version available. */
    export interface TargetUpdate {
        name: string;
        image: string;
        currentVersion: string;
        latestVersion: string;
        changelogUrl: string | undefined;
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
        changelogUrl: string | undefined;
    }

    /** The result of resolving updates for all targets. */
    export interface UpdateResult {
        updates: TargetUpdate[];
        upToDate: TargetUpToDate[];
        skippedMajorUpgrades: SkippedMajorUpgrade[];
    }
}

/**
 * Resolves the latest available version for each eligible target and
 * categorizes them into updates, up-to-date, and skipped major upgrades.
 */
export class SdkUpdater {
    /**
     * Resolves latest versions for the given targets.
     *
     * Targets without an explicit version (or set to "latest") are skipped.
     */
    public async resolve({
        targets,
        targetFilter,
        includeMajor,
        prerelease
    }: {
        targets: Target[];
        targetFilter: string | undefined;
        includeMajor: boolean;
        prerelease: boolean;
    }): Promise<SdkUpdater.UpdateResult> {
        const channel: "GA" | "RC" | undefined = prerelease ? "RC" : undefined;
        const updates: SdkUpdater.TargetUpdate[] = [];
        const upToDate: SdkUpdater.TargetUpToDate[] = [];
        const skippedMajorUpgrades: SdkUpdater.SkippedMajorUpgrade[] = [];

        for (const target of targets) {
            if (targetFilter != null && target.name !== targetFilter) {
                continue;
            }

            if (target.version === "latest" || target.version == null) {
                continue;
            }

            const latestVersion = await getLatestGeneratorVersion({
                generatorName: target.image,
                cliVersion: Version,
                currentGeneratorVersion: target.version,
                channel,
                includeMajor
            });

            if (latestVersion != null && latestVersion !== target.version) {
                updates.push({
                    name: target.name,
                    image: target.image,
                    currentVersion: target.version,
                    latestVersion,
                    changelogUrl: DOCKER_IMAGE_TO_CHANGELOG_URL[target.image]
                });
            } else {
                upToDate.push({
                    name: target.name,
                    version: target.version
                });
            }

            // Check for skipped major upgrades when not including major.
            if (!includeMajor) {
                const effectiveVersion = latestVersion ?? target.version;
                const latestMajorVersion = await getLatestGeneratorVersion({
                    generatorName: target.image,
                    cliVersion: Version,
                    currentGeneratorVersion: effectiveVersion,
                    channel,
                    includeMajor: true
                });

                if (latestMajorVersion != null) {
                    const currentMajor = parseMajorVersion(effectiveVersion);
                    const latestMajor = parseMajorVersion(latestMajorVersion);

                    if (currentMajor != null && latestMajor != null && latestMajor > currentMajor) {
                        skippedMajorUpgrades.push({
                            name: target.name,
                            currentVersion: effectiveVersion,
                            latestMajorVersion,
                            changelogUrl: DOCKER_IMAGE_TO_CHANGELOG_URL[target.image]
                        });
                    }
                }
            }
        }

        return { updates, upToDate, skippedMajorUpgrades };
    }
}

function parseMajorVersion(version: string): number | undefined {
    const match = /^(\d+)\./.exec(version);
    if (match?.[1] == null) {
        return undefined;
    }
    return Number.parseInt(match[1], 10);
}
