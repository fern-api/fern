#!/usr/bin/env tsx
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback
import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { join } from "path";
import * as readline from "readline";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import {
    getChangelogFolder,
    getSoftwareConfig,
    getUnreleasedDir,
    listConfiguredSoftware,
    type SoftwareConfig
} from "./release-config.js";
import { setupSoftware } from "./release-setup.js";

interface ChangelogEntry {
    summary: string;
    type: "fix" | "chore" | "feat" | "internal" | "break";
    "pre-release"?: string;
}

const VALID_CHANGELOG_TYPES = new Set(["fix", "chore", "feat", "internal", "break"]);
const VALID_PRE_RELEASE_TAGS = new Set(["alpha", "beta", "rc"]);

type Severity = "major" | "minor" | "patch";

function getSeverityFromType(type: ChangelogEntry["type"]): Severity {
    switch (type) {
        case "fix":
        case "chore":
            return "patch";
        case "feat":
        case "internal":
            return "minor";
        case "break":
            return "major";
        default: {
            const _exhaustive: never = type;
            throw new Error(`Unknown changelog type: ${_exhaustive}`);
        }
    }
}

/**
 * Validates a parsed changelog entry against the expected schema
 * (mirrors fern-changes-yml.schema.json).
 */
function validateChangelogEntry(entry: unknown, filename: string, index: number): asserts entry is ChangelogEntry {
    if (typeof entry !== "object" || entry === null) {
        console.error(`Error in ${filename}, entry ${index + 1}: Expected an object, got ${typeof entry}`);
        process.exit(1);
    }

    const obj = entry as Record<string, unknown>;

    if (typeof obj.summary !== "string" || obj.summary.trim() === "") {
        console.error(
            `Error in ${filename}, entry ${index + 1}: Missing or empty "summary" field. ` +
                `Expected a non-empty string.`
        );
        process.exit(1);
    }

    if (typeof obj.type !== "string" || !VALID_CHANGELOG_TYPES.has(obj.type)) {
        console.error(
            `Error in ${filename}, entry ${index + 1}: Invalid "type" field: ${JSON.stringify(obj.type)}. ` +
                `Expected one of: ${[...VALID_CHANGELOG_TYPES].join(", ")}`
        );
        process.exit(1);
    }

    if (obj["pre-release"] !== undefined) {
        if (typeof obj["pre-release"] !== "string" || !VALID_PRE_RELEASE_TAGS.has(obj["pre-release"])) {
            console.error(
                `Error in ${filename}, entry ${index + 1}: Invalid "pre-release" field: ${JSON.stringify(obj["pre-release"])}. ` +
                    `Expected one of: ${[...VALID_PRE_RELEASE_TAGS].join(", ")}`
            );
            process.exit(1);
        }
    }

    const allowedKeys = new Set(["summary", "type", "pre-release"]);
    for (const key of Object.keys(obj)) {
        if (!allowedKeys.has(key)) {
            console.error(
                `Error in ${filename}, entry ${index + 1}: Unknown field "${key}". ` +
                    `Only "summary", "type", and "pre-release" are allowed.`
            );
            process.exit(1);
        }
    }
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

        // Validate each entry against the changelog schema
        for (let i = 0; i < entries.length; i++) {
            validateChangelogEntry(entries[i], file, i);
        }

        changes.push({ filename: file, entries });
    }

    return changes;
}

function getPreReleaseTag(changes: UnreleasedChange[]): string | undefined {
    for (const change of changes) {
        for (const entry of change.entries) {
            if (entry["pre-release"]) {
                return entry["pre-release"];
            }
        }
    }
    return undefined;
}

/**
 * Parses the pre-release counter from a version string.
 * E.g., "4.2.0-rc.1" with tag "rc" returns 1; "4.2.0-rc0" with tag "rc" returns 0.
 * Returns undefined if the current version doesn't use the same pre-release tag.
 */
function getPreReleaseCounter(currentVersion: string, tag: string): number | undefined {
    // Match formats like "-rc.1" or "-rc1"
    const dotMatch = currentVersion.match(new RegExp(`-${tag}\\.(\\d+)$`));
    if (dotMatch?.[1] !== undefined) {
        return Number(dotMatch[1]);
    }
    const noDotMatch = currentVersion.match(new RegExp(`-${tag}(\\d+)$`));
    if (noDotMatch?.[1] !== undefined) {
        return Number(noDotMatch[1]);
    }
    return undefined;
}

function determineNextVersion(currentVersion: string, changes: UnreleasedChange[]): string {
    let highestSeverity: Severity = "patch";

    for (const change of changes) {
        for (const entry of change.entries) {
            const severity = getSeverityFromType(entry.type);
            if (severity === "major") {
                highestSeverity = "major";
            } else if (severity === "minor" && highestSeverity !== "major") {
                highestSeverity = "minor";
            }
        }
    }

    const preReleaseTag = getPreReleaseTag(changes);

    // Strip pre-release suffix (e.g., "4.2.0-rc.1" -> "4.2.0")
    const isCurrentPreRelease = currentVersion.includes("-");
    const baseVersion = currentVersion.replace(/-.*$/, "");
    const [major, minor, patch] = baseVersion.split(".").map(Number);

    if (
        major === undefined ||
        minor === undefined ||
        patch === undefined ||
        isNaN(major) ||
        isNaN(minor) ||
        isNaN(patch)
    ) {
        console.error("Error: currentVersion is invalid");
        process.exit(1);
    }

    // Compute the base next version from severity
    let nextBase: string;
    switch (highestSeverity) {
        case "major":
            nextBase = `${major + 1}.0.0`;
            break;
        case "minor":
            nextBase = `${major}.${minor + 1}.0`;
            break;
        case "patch":
            nextBase = isCurrentPreRelease ? `${major}.${minor}.${patch}` : `${major}.${minor}.${patch + 1}`;
            break;
    }

    // If no pre-release tag requested, return the stable version
    if (!preReleaseTag) {
        return nextBase;
    }

    // If the current version is already a pre-release with the same tag and same
    // base version, increment the pre-release counter instead of resetting to 0.
    if (isCurrentPreRelease) {
        const counter = getPreReleaseCounter(currentVersion, preReleaseTag);
        if (counter !== undefined && baseVersion === nextBase) {
            return `${nextBase}-${preReleaseTag}.${counter + 1}`;
        }
    }

    return `${nextBase}-${preReleaseTag}.0`;
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

    // Build changelog entries from all changes
    const changelogEntry: Array<{ summary: string; type: string }> = [];
    for (const change of changes) {
        for (const entry of change.entries) {
            changelogEntry.push({
                summary: entry.summary,
                type: entry.type
            });
        }
    }

    // Create new version entry object
    const newVersionEntry: VersionEntry = {
        version: newVersion,
        changelogEntry,
        createdAt: new Date().toISOString().split("T")[0] ?? "",
        irVersion
    };

    // Use yaml.stringify() for the new entry with literal block style (|) for multi-line summaries.
    // Without blockQuote: "literal", the yaml library defaults to folded style (>) which
    // re-wraps lines and inserts blank lines, breaking the formatting of versions.yml.
    const rawYaml = stringifyYaml([newVersionEntry], { blockQuote: "literal", lineWidth: 120 });

    // Quote the createdAt date string to match existing versions.yml style (e.g., "2026-04-13")
    const newEntryYaml = rawYaml.replace(/createdAt: (\d{4}-\d{2}-\d{2})/, 'createdAt: "$1"');

    // Find where to insert (after the yaml-language-server comment if present)
    const lines = existingContent.split("\n");
    if (lines.length > 0 && lines[0] && lines[0].startsWith("# yaml-language-server")) {
        // Prepend new entry after comment line
        const newContent = lines[0] + "\n" + newEntryYaml + lines.slice(1).join("\n");
        writeFileSync(versionsFile, newContent);
    } else {
        // Prepend new entry at the beginning
        writeFileSync(versionsFile, newEntryYaml + existingContent);
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

function prepareRelease(softwareName: string, config: SoftwareConfig): void {
    const versionsFile = join(__dirname, "..", config.versionsFile);
    const changelogFolder = join(__dirname, "..", getChangelogFolder(config));
    const unreleasedDir = getUnreleasedDir(config);
    const fullUnreleasedDir = join(__dirname, "..", unreleasedDir);

    console.log(`🚀 Preparing ${config.name} release...\n`);

    // Stash any uncommitted changes
    console.log("💾 Stashing uncommitted changes...");
    try {
        const status = execSync("git status --porcelain", { encoding: "utf-8" });
        if (status.trim()) {
            execSync("git stash push -m 'Auto-stash before release'", { stdio: "inherit" });
            console.log("   ✅ Changes stashed\n");
        } else {
            console.log("   ℹ️  No changes to stash\n");
        }
    } catch (error) {
        console.error("❌ Error stashing changes:", error);
        process.exit(1);
    }

    // Detect and pull latest for the current branch (caller controls which branch to release from)
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
    console.log(`🔄 Pulling latest for branch "${currentBranch}"...`);
    try {
        execSync(`git pull origin ${currentBranch}`, { stdio: "inherit" });
        console.log(`   ✅ Up to date on ${currentBranch}\n`);
    } catch (error) {
        console.error(`❌ Error pulling latest for ${currentBranch}:`, error);
        process.exit(1);
    }

    // Get commit hash before changes
    const beforeCommit = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();

    // Read unreleased changes
    console.log("📂 Reading unreleased changes...");
    const changes = readUnreleasedChanges(fullUnreleasedDir);
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
    const versionDir = join(changelogFolder, nextVersion);
    console.log(`📦 Moving unreleased files to ${nextVersion}/...`);
    moveUnreleasedFiles(fullUnreleasedDir, versionDir, changes);
    console.log(`   ✅ Files moved to ${getChangelogFolder(config)}/${nextVersion}/\n`);

    // Commit changes
    console.log("💾 Committing changes...");
    try {
        execSync(`git add ${config.versionsFile}`, { stdio: "inherit" });
        execSync(`git add ${getChangelogFolder(config)}`, { stdio: "inherit" });
        execSync(`git commit -m "chore(${softwareName}): release ${nextVersion}"`, { stdio: "inherit" });
        console.log("   ✅ Changes committed\n");
    } catch (error) {
        console.error("❌ Error committing changes:", error);
        process.exit(1);
    }

    // Pull again to check for conflicts
    console.log("🔄 Checking for remote changes...");
    try {
        execSync(`git pull origin ${currentBranch}`, { stdio: "inherit" });
        const afterCommit = execSync("git rev-parse HEAD~1", { encoding: "utf-8" }).trim();

        if (beforeCommit !== afterCommit) {
            console.error(`\n❌ Error: Someone else committed to ${currentBranch} while preparing this release.`);
            console.error("   Rolling back changes...");
            execSync("git reset --hard HEAD~1", { stdio: "inherit" });
            console.error("   ✅ Changes rolled back. Please try again.");
            process.exit(1);
        }
        console.log("   ✅ No conflicts detected\n");
    } catch (error) {
        console.error(`❌ Error pulling from ${currentBranch}:`, error);
        console.error("   Rolling back changes...");
        try {
            execSync("git reset --hard HEAD~1", { stdio: "inherit" });
        } catch {
            // Ignore errors during rollback
        }
        process.exit(1);
    }

    // Human verification
    console.log("📋 Release Summary:");
    console.log(`   - Software: ${config.name}`);
    console.log(`   - Version: ${nextVersion}`);
    console.log(`   - Changes: ${changes.reduce((sum, c) => sum + c.entries.length, 0)} changelog entries`);
    console.log(`   - Files moved: ${changes.length}`);
    console.log("\n📝 Changed files:");
    console.log(`   - ${config.versionsFile}`);
    console.log(`   - ${getChangelogFolder(config)}/${nextVersion}/`);
    console.log(`\n⚠️  This will push directly to ${currentBranch}!`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`\n❓ Do you want to push these changes to ${currentBranch}? (yes/no): `, (answer: string) => {
        rl.close();

        if (answer.toLowerCase() !== "yes") {
            console.log("\n❌ Push cancelled. Rolling back changes...");
            try {
                execSync("git reset --hard HEAD~1", { stdio: "inherit" });
                console.log("   ✅ Changes rolled back");
            } catch (error) {
                console.error("   ⚠️  Error rolling back:", error);
            }
            process.exit(0);
        }

        console.log(`\n📤 Pushing to ${currentBranch}...`);
        try {
            execSync(`git push origin ${currentBranch}`, { stdio: "inherit" });
            console.log(`   ✅ Successfully pushed to ${currentBranch}\n`);
            console.log(`🎉 Release ${nextVersion} completed successfully!`);
        } catch (error) {
            console.error(`❌ Error pushing to ${currentBranch}:`, error);
            console.error(`\n⚠️  The commit is still on your local ${currentBranch} branch.`);
            console.error(`   You can manually push with: git push origin ${currentBranch}`);
            process.exit(1);
        }
    });
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const softwareName = args.find((arg) => !arg.startsWith("--"));
    const createPr = args.includes("--create-pr");

    if (!softwareName) {
        console.log("Usage: pnpm release <software> [--create-pr]\n");
        console.log("Options:");
        console.log("  --create-pr  When setting up new software, create a branch and pull request");
        console.log("               (default: dry-run with local changes only)\n");
        console.log("Available software:");

        const configured = listConfiguredSoftware();
        if (configured.length === 0) {
            console.log("  (none configured yet)\n");
            console.log("To setup a new software, run: pnpm release <software-name>");
        } else {
            for (const name of configured) {
                console.log(`  - ${name}`);
            }
        }

        process.exit(1);
    }

    const config = getSoftwareConfig(softwareName);

    if (!config) {
        console.log(`⚠️  Software "${softwareName}" is not configured for releases.\n`);
        console.log("Would you like to set it up now?\n");

        // Run the setup flow
        await setupSoftware(softwareName, createPr);
    } else {
        // Run the release preparation flow
        prepareRelease(softwareName, config);
    }
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
