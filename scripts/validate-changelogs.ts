#!/usr/bin/env tsx
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";

interface SoftwareConfig {
    name: string;
    versionsFile: string;
    changelogFolder?: string;
    softwareDirectory?: string;
}

interface ReleaseConfig {
    software: Record<string, SoftwareConfig>;
}

interface ValidationError {
    software: string;
    softwareDir: string;
    unreleasedDir: string;
    changesCount: number;
}

function main(): void {
    const baseRef = process.env.BASE_REF;
    if (!baseRef) {
        console.error("\u274c BASE_REF environment variable is required");
        process.exit(1);
    }

    const configPath = join(__dirname, "..", "release-config.json");
    if (!existsSync(configPath)) {
        console.log("\u26a0\ufe0f  release-config.json not found, skipping validation");
        process.exit(0);
    }

    const config: ReleaseConfig = JSON.parse(readFileSync(configPath, "utf-8"));

    const changedFilesOutput = execSync(`git diff --name-only origin/${baseRef}...HEAD`, {
        encoding: "utf-8"
    }).trim();

    if (!changedFilesOutput) {
        console.log("\u2705 No files changed");
        process.exit(0);
    }

    const changedFiles = changedFilesOutput.split("\n");

    console.log("\ud83d\udcc2 Changed files:");
    for (const file of changedFiles) {
        console.log(`   ${file}`);
    }
    console.log();

    let hasErrors = false;
    const errors: ValidationError[] = [];

    for (const [, softwareConfig] of Object.entries(config.software)) {
        const softwareDir =
            softwareConfig.softwareDirectory ||
            (softwareConfig.versionsFile.includes("/") ? dirname(softwareConfig.versionsFile) : ".");
        const changelogFolder = softwareConfig.changelogFolder || softwareDir + "/changes";
        const unreleasedDir = changelogFolder + "/unreleased";

        const softwareChanges = changedFiles.filter(
            (file) => file.startsWith(softwareDir + "/") && !file.startsWith(changelogFolder + "/")
        );

        if (softwareChanges.length === 0) {
            continue;
        }

        console.log(`\n\ud83d\udcdd ${softwareConfig.name} changes detected:`);
        for (const file of softwareChanges) {
            console.log(`   - ${file}`);
        }

        const changelogChanges = changedFiles.filter(
            (file) =>
                file.startsWith(unreleasedDir + "/") &&
                (file.endsWith(".yml") || file.endsWith(".yaml")) &&
                !file.includes("/.template.") &&
                !file.includes("/.gitkeep")
        );

        if (changelogChanges.length === 0) {
            hasErrors = true;
            errors.push({
                software: softwareConfig.name,
                softwareDir,
                unreleasedDir,
                changesCount: softwareChanges.length
            });
        } else {
            console.log("\u2705 Changelog entries found:");
            for (const file of changelogChanges) {
                console.log(`   - ${file}`);
            }
        }
    }

    if (hasErrors) {
        console.log("\n\u274c Missing changelog entries:\n");
        for (const error of errors) {
            console.log(`Software: ${error.software}`);
            console.log(`  - ${error.changesCount} file(s) changed in ${error.softwareDir}/`);
            console.log(`  - No changelog entry found in ${error.unreleasedDir}/`);
            console.log();
            console.log(`  Please create a changelog entry in ${error.unreleasedDir}/ with this format:`);
            console.log();
            console.log("  # yaml-language-server: $schema=../path/to/fern-changes-yml.schema.json");
            console.log();
            console.log("  - summary: |");
            console.log("      Your change description here");
            console.log("    type: fix|chore|feat|internal|break");
            console.log("    # Severity is auto-determined: fix/chore=patch, feat/internal=minor, break=major");
            console.log();
        }
        process.exit(1);
    }

    console.log("\n\u2705 All required changelog entries are present");
}

main();
