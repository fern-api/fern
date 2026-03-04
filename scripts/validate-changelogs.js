#!/usr/bin/env node
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function main() {
    const baseRef = process.env.BASE_REF;
    if (!baseRef) {
        console.error("❌ BASE_REF environment variable is required");
        process.exit(1);
    }

    const configPath = path.join(__dirname, "..", "release-config.json");
    if (!fs.existsSync(configPath)) {
        console.log("⚠️  release-config.json not found, skipping validation");
        process.exit(0);
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    const changedFilesOutput = execSync(`git diff --name-only origin/${baseRef}...HEAD`, {
        encoding: "utf-8"
    }).trim();

    if (!changedFilesOutput) {
        console.log("✅ No files changed");
        process.exit(0);
    }

    const changedFiles = changedFilesOutput.split("\n");

    console.log("📂 Changed files:");
    changedFiles.forEach((file) => console.log(`   ${file}`));
    console.log();

    let hasErrors = false;
    const errors = [];

    for (const [, softwareConfig] of Object.entries(config.software)) {
        const path = require("path");
        const softwareDir = softwareConfig.softwareDirectory ||
            (softwareConfig.versionsFile.includes("/") ? path.dirname(softwareConfig.versionsFile) : ".");
        const changelogFolder = softwareConfig.changelogFolder || softwareDir + "/changes";
        const unreleasedDir = changelogFolder + "/unreleased";

        const softwareChanges = changedFiles.filter(
            (file) => file.startsWith(softwareDir + "/") && !file.startsWith(changelogFolder + "/")
        );

        if (softwareChanges.length === 0) {
            continue;
        }

        console.log(`\n📝 ${softwareConfig.name} changes detected:`);
        softwareChanges.forEach((file) => console.log(`   - ${file}`));

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
            console.log("✅ Changelog entries found:");
            changelogChanges.forEach((file) => console.log(`   - ${file}`));
        }
    }

    if (hasErrors) {
        console.log("\n❌ Missing changelog entries:\n");
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

    console.log("\n✅ All required changelog entries are present");
}

main();
