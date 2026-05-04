#!/usr/bin/env tsx
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

export interface SoftwareConfig {
    name: string;
    versionsFile: string;
    changelogFolder?: string;
    softwareDirectory?: string;
}

export interface ReleaseConfig {
    software: Record<string, SoftwareConfig>;
}

const CONFIG_FILE = join(__dirname, "..", "release-config.json");

export function loadReleaseConfig(): ReleaseConfig {
    if (!existsSync(CONFIG_FILE)) {
        return { software: {} };
    }

    const content = readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content) as ReleaseConfig;
}

export function saveReleaseConfig(config: ReleaseConfig): void {
    const content = JSON.stringify(config, undefined, 2) + "\n";
    writeFileSync(CONFIG_FILE, content);
}

export function getSoftwareConfig(softwareName: string): SoftwareConfig | undefined {
    const config = loadReleaseConfig();
    return config.software[softwareName];
}

export function setSoftwareConfig(softwareName: string, softwareConfig: SoftwareConfig): void {
    const config = loadReleaseConfig();
    config.software[softwareName] = softwareConfig;
    saveReleaseConfig(config);
}

export function getChangelogFolder(softwareConfig: SoftwareConfig): string {
    return softwareConfig.changelogFolder ?? join(dirname(softwareConfig.versionsFile), "changes");
}

export function getSoftwareDirectory(softwareConfig: SoftwareConfig): string {
    return softwareConfig.softwareDirectory ?? dirname(softwareConfig.versionsFile);
}

export function getUnreleasedDir(softwareConfig: SoftwareConfig): string {
    return join(getChangelogFolder(softwareConfig), "unreleased");
}

export function listConfiguredSoftware(): string[] {
    const config = loadReleaseConfig();
    return Object.keys(config.software);
}
