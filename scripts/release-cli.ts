#!/usr/bin/env tsx
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";

interface ChangelogEntry {
    summary: string;
    type: "fix" | "chore" | "feat" | "internal" | "break";
    severity: "major" | "minor" | "patch";
}

interface VersionEntry {
    version: string;
    changelogEntry: Array<{ summary: string; type: string }>;
    createdAt: string;
    irVersion: number;
}

interface UnreleasedChange {
    filename: string;
    entries: ChangelogEntry[];
}

function readUnreleasedChanges(unreleasedDir: string): UnreleasedChange[] {
    if (!existsSync(unreleasedDir)) {
        console.error(`❌ Error: Unreleased changes directory not found: ${unreleasedDir}`);
        process.exit(1);
    }

    const files = readdirSync(unreleasedDir).filter(
        (file) => (file.endsWith(".yml") || file.endsWith(".yaml")) && !file.startsWith(".") // Exclude hidden files like .template.yml and .gitkeep
    );

    if (files.length === 0) {
        console.log("ℹ️  No unreleased changes found. Nothing to release.");
        process.exit(0);
    }

    const changes: UnreleasedChange[] = [];

    for (const file of files) {
        const filePath = join(unreleasedDir, file);
        const content = readFileSync(filePath, "utf-8");
        const entries = parseYaml(content) as ChangelogEntry[];

        if (!Array.isArray(entries)) {
            console.error(`Error: Invalid format in ${file}. Expected an array of changelog entries.`);
            process.exit(1);
        }

        changes.push({ filename: file, entries });
    }

    return changes;
}

function determineNextVersion(currentVersion: string, changes: UnreleasedChange[]): string {
    let highestSeverity: "patch" | "minor" | "major" = "patch";

    for (const change of changes) {
        for (const entry of change.entries) {
            if (entry.severity === "major") {
                highestSeverity = "major";
            } else if (entry.severity === "minor" && highestSeverity !== "major") {
                highestSeverity = "minor";
            }
        }
    }

    const [major, minor, patch] = currentVersion.split(".").map(Number);

    if (major === undefined || minor === undefined || patch === undefined ||
        isNaN(major) || isNaN(minor) || isNaN(patch)) {
        console.error("Error: currentVersion is invalid");
        process.exit(1);
    }

    switch (highestSeverity) {
        case "major":
            return `${major + 1}.0.0`;
        case "minor":
            return `${major}.${minor + 1}.0`;
        case "patch":
            return `${major}.${minor}.${patch + 1}`;
    }
}

function getCurrentVersion(versionsFile: string): string {
    const content = readFileSync(versionsFile, "utf-8");
    const versions = parseYaml(content) as VersionEntry[];

    if (!Array.isArray(versions) || versions.length === 0) {
        console.error("Error: versions.yml is empty or invalid");
        process.exit(1);
    }

    if (!versions[0] || versions[0].version === undefined) {
        console.error("Error: versions.yml does not contain a valid version entry");
        process.exit(1);
    }

    return versions[0].version;
}

function getCurrentIrVersion(versionsFile: string): number {
    const content = readFileSync(versionsFile, "utf-8");
    const versions = parseYaml(content) as VersionEntry[];

    if (!Array.isArray(versions) || versions.length === 0) {
        console.error("Error: versions.yml is empty or invalid");
        process.exit(1);
    }

    if (!versions[0] || versions[0].irVersion === undefined) {
        console.error("Error: versions.yml does not contain a valid irVersion entry");
        process.exit(1);
    }

    return versions[0].irVersion;
}

function updateVersionsFile(
    versionsFile: string,
    newVersion: string,
    changes: UnreleasedChange[],
    irVersion: number
): void {
    const existingContent = readFileSync(versionsFile, "utf-8");

    // Build changelog entries
    const changelogEntries: string[] = [];
    for (const change of changes) {
        for (const entry of change.entries) {
            const summaryLines = entry.summary
                .trim()
                .split("\n")
                .map((line) => `        ${line}`)
                .join("\n");
            changelogEntries.push(`    - summary: |\n` + summaryLines + "\n" + `      type: ${entry.type}`);
        }
    }

    // Build new version entry
    const newEntry =
        `- version: ${newVersion}\n` +
        `  changelogEntry:\n` +
        changelogEntries.join("\n") +
        "\n" +
        `  createdAt: "${new Date().toISOString().split("T")[0]}"\n` +
        `  irVersion: ${irVersion}\n\n`;

    // Find where to insert (after the yaml-language-server comment if present)
    const lines = existingContent.split("\n");
    let insertIndex = 0;
    if (lines.length > 0 && lines[0] && lines[0].startsWith("# yaml-language-server")) {
        insertIndex = 1;
        // Prepend new entry after comment line
        const newContent = lines[0] + "\n" + newEntry + lines.slice(1).join("\n");
        writeFileSync(versionsFile, newContent);
    } else {
        // Prepend new entry at the beginning
        writeFileSync(versionsFile, newEntry + existingContent);
    }
}

function moveUnreleasedFiles(unreleasedDir: string, versionDir: string, changes: UnreleasedChange[]): void {
    if (!existsSync(versionDir)) {
        mkdirSync(versionDir, { recursive: true });
    }

    for (const change of changes) {
        const sourcePath = join(unreleasedDir, change.filename);
        const destPath = join(versionDir, change.filename);
        renameSync(sourcePath, destPath);
    }
}

function main(): void {
    const cliDir = join(__dirname, "..", "packages", "cli", "cli");
    const changesDir = join(cliDir, "changes");
    const unreleasedDir = join(changesDir, "unreleased");
    const versionsFile = join(cliDir, "versions.yml");

    console.log("🚀 Preparing CLI release...\n");

    // Read unreleased changes
    console.log("📂 Reading unreleased changes...");
    const changes = readUnreleasedChanges(unreleasedDir);
    console.log(`   Found ${changes.length} unreleased change file(s)\n`);

    // Get current version
    const currentVersion = getCurrentVersion(versionsFile);
    console.log(`📊 Current version: ${currentVersion}`);

    // Get current IR version
    const irVersion = getCurrentIrVersion(versionsFile);
    console.log(`📊 Current IR version: ${irVersion}`);

    // Determine next version
    const nextVersion = determineNextVersion(currentVersion, changes);
    console.log(`📈 Next version: ${nextVersion}\n`);

    // Update versions.yml
    console.log("📝 Updating versions.yml...");
    updateVersionsFile(versionsFile, nextVersion, changes, irVersion);
    console.log("   ✅ versions.yml updated\n");

    // Move unreleased files to versioned directory
    const versionDir = join(changesDir, nextVersion);
    console.log(`📦 Moving unreleased files to ${nextVersion}/...`);
    moveUnreleasedFiles(unreleasedDir, versionDir, changes);
    console.log(`   ✅ Files moved to changes/${nextVersion}/\n`);

    console.log(`🎉 Release ${nextVersion} prepared successfully!`);
    console.log(`\n📝 Summary:`);
    console.log(`   - Version: ${nextVersion}`);
    console.log(`   - Changes: ${changes.reduce((sum, c) => sum + c.entries.length, 0)} changelog entries`);
    console.log(`   - Files moved: ${changes.length}`);
}

main();
