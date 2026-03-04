#!/usr/bin/env tsx
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback
import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, relative } from "path";
import * as readline from "readline";
import {
    getChangelogFolder,
    getSoftwareDirectory,
    getUnreleasedDir,
    loadReleaseConfig,
    type SoftwareConfig,
    setSoftwareConfig
} from "./release-config.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function promptForConfig(softwareName: string): Promise<SoftwareConfig> {
    console.log(`\n📝 Setting up release configuration for: ${softwareName}\n`);

    const displayName = await question(`Software display name (default: ${softwareName}): `);
    const versionsFile = await question("Path to versions.yml (relative to repo root): ");

    if (!versionsFile.trim()) {
        console.error("❌ Error: versions.yml path is required");
        process.exit(1);
    }

    const defaultChangelogFolder = join(dirname(versionsFile), "changes");
    const changelogFolderInput = await question(`Changelog folder path (default: ${defaultChangelogFolder}): `);

    const defaultSoftwareDir = dirname(versionsFile);
    const softwareDirectoryInput = await question(
        `Software directory to watch for changes (default: ${defaultSoftwareDir}): `
    );

    const config: SoftwareConfig = {
        name: displayName.trim() || softwareName,
        versionsFile: versionsFile.trim(),
        changelogFolder: changelogFolderInput.trim() || defaultChangelogFolder,
        softwareDirectory: softwareDirectoryInput.trim() || defaultSoftwareDir
    };

    console.log("\n📋 Configuration summary:");
    console.log(`   Name: ${config.name}`);
    console.log(`   Versions file: ${config.versionsFile}`);
    console.log(`   Changelog folder: ${getChangelogFolder(config)}`);
    console.log(`   Software directory: ${getSoftwareDirectory(config)}`);
    console.log();

    const confirm = await question("Is this correct? (y/n): ");
    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
        console.log("❌ Setup cancelled");
        process.exit(0);
    }

    return config;
}

function createChangelogStructure(config: SoftwareConfig): void {
    const changelogFolder = getChangelogFolder(config);
    const unreleasedDir = getUnreleasedDir(config);

    console.log(`\n📂 Creating changelog structure at ${changelogFolder}...`);

    if (!existsSync(changelogFolder)) {
        mkdirSync(changelogFolder, { recursive: true });
    }

    if (!existsSync(unreleasedDir)) {
        mkdirSync(unreleasedDir, { recursive: true });
    }

    // Create template file
    const templatePath = join(unreleasedDir, ".template.yml");

    // Calculate relative path from unreleased dir to schema file at repo root
    const repoRoot = join(__dirname, "..");
    const schemaPath = join(repoRoot, "fern-changes-yml.schema.json");
    const relativeSchemaPath = relative(unreleasedDir, schemaPath);

    const templateContent = `# Template for changelog entries
# Copy this file and rename it to describe your change (e.g., add-auth-feature.yml)
# yaml-language-server: $schema=${relativeSchemaPath}

- summary: |
    Brief description of your change.
    You can use multiple lines for longer descriptions.
  type: feat  # Options: fix/chore (patch), feat/internal (minor), break (major)
`;
    writeFileSync(templatePath, templateContent);

    // Create .gitkeep to ensure directory is tracked
    const gitkeepPath = join(unreleasedDir, ".gitkeep");
    const gitkeepContent = `# This directory contains unreleased changelog entries
# Create files here following the format in fern-changes-yml.schema.json
`;
    writeFileSync(gitkeepPath, gitkeepContent);

    console.log("   ✅ Changelog structure created");
}

function updateReleasesWorkflowPaths(): void {
    const workflowPath = join(__dirname, "..", ".github/workflows/release-software.yml");

    if (!existsSync(workflowPath)) {
        console.log("   ⚠️  release-software.yml not found, skipping workflow update");
        return;
    }

    const config = loadReleaseConfig();
    const softwareKeys = Object.keys(config.software);

    const pathLines = Object.values(config.software)
        .map((s) => `      - "${getChangelogFolder(s)}/**"`)
        .join("\n");

    const optionLines = ["          - all", ...softwareKeys.map((k) => `          - ${k}`)].join("\n");

    let content = readFileSync(workflowPath, "utf-8");

    // Replace push paths between the sync comment and the next non-path line
    const pathsUpdated = content.replace(
        /( {6}# Auto-updated by scripts\/release-setup\.ts — do not edit manually\n)(?: {6}- "[^"]*"\n)*/,
        `$1${pathLines}\n`
    );

    // Replace workflow_dispatch options between the sync comment and the next non-option line
    const fullyUpdated = pathsUpdated.replace(
        /( {10}# Auto-updated by scripts\/release-setup\.ts — do not edit manually\n)(?: {10}- .+\n)*/,
        `$1${optionLines}\n`
    );

    if (fullyUpdated === content) {
        console.log("   ⚠️  Could not find markers in release-software.yml — update manually");
        return;
    }

    writeFileSync(workflowPath, fullyUpdated);
    console.log("   ✅ Updated .github/workflows/release-software.yml paths and options");
}

function ensureCleanWorkingTree(): void {
    try {
        const status = execSync("git status --porcelain", { encoding: "utf-8" });
        if (status.trim()) {
            console.error("⚠️  Warning: You have uncommitted changes. Please commit or stash them first.");
            process.exit(1);
        }
    } catch (error) {
        console.error("❌ Error checking git status:", error);
        process.exit(1);
    }
}

function createBranch(softwareName: string): string {
    console.log("\n🌿 Creating git branch...");

    const branchName = `setup-release/${softwareName}-${Date.now()}`;

    try {
        // Create and checkout new branch
        execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });
        console.log(`   ✅ Created branch: ${branchName}`);

        return branchName;
    } catch (error) {
        console.error("❌ Error creating branch:", error);
        process.exit(1);
    }
}

function commitAndPushChanges(softwareName: string, config: SoftwareConfig, branchName: string): void {
    console.log("\n💾 Committing changes...");

    try {
        execSync("git add release-config.json", { stdio: "inherit" });
        execSync("git add .github/workflows/release-software.yml", { stdio: "inherit" });
        execSync(`git add ${getChangelogFolder(config)}`, { stdio: "inherit" });

        execSync(`git commit -m "chore: setup release configuration for ${softwareName}"`, {
            stdio: "inherit"
        });

        console.log("   ✅ Changes committed");

        console.log("\n📤 Pushing to remote...");
        execSync(`git push origin ${branchName}`, { stdio: "inherit" });
        console.log("   ✅ Branch pushed");
    } catch (error) {
        console.error("❌ Error committing/pushing changes:", error);
        process.exit(1);
    }
}

function createPullRequest(softwareName: string, config: SoftwareConfig, branchName: string): void {
    console.log("\n🔨 Creating pull request...");

    const prBody = `## Setup Release Configuration for ${config.name}

This PR sets up the release configuration for **${config.name}**.

### Configuration
- **Name:** ${config.name}
- **Versions file:** ${config.versionsFile}
- **Changelog folder:** ${getChangelogFolder(config)}
- **Software directory:** ${getSoftwareDirectory(config)}

### Changes
- Added release configuration to \`release-config.json\`
- Created changelog structure in \`${getChangelogFolder(config)}/\`

### CI Validation
The unified \`.github/workflows/validate-changelogs.yml\` workflow automatically validates changelog entries for all configured software, including \`${getSoftwareDirectory(config)}/\`.

### What's Next
Once this PR is merged, you can use:
\`\`\`bash
pnpm release ${softwareName}
\`\`\`

to prepare releases for ${config.name}.

🤖 Generated by release setup script`;

    // Write body to a temp file to avoid shell escaping issues with
    // backticks, dollar signs, and other special characters.
    const bodyFile = join(tmpdir(), `pr-body-${Date.now()}.md`);
    try {
        writeFileSync(bodyFile, prBody);
        const prUrl = execSync(
            `gh pr create --title "chore: setup release configuration for ${softwareName}" --body-file ${bodyFile} --base main --head ${branchName}`,
            { encoding: "utf-8" }
        );
        console.log(`   ✅ Pull request created: ${prUrl.trim()}`);
    } catch (error) {
        console.error("❌ Error creating pull request:", error);
        console.log("\n📝 You can create the PR manually with:");
        console.log(`   gh pr create --base main --head ${branchName}`);
    } finally {
        try {
            unlinkSync(bodyFile);
        } catch {
            // Ignore cleanup errors
        }
    }
}

export async function setupSoftware(softwareName: string, createPr = false): Promise<void> {
    console.log(`\n🚀 Setting up release configuration for: ${softwareName}\n`);

    if (!createPr) {
        console.log("📝 Running in dry-run mode (local changes only)");
        console.log("   Use --create-pr flag to create a branch and pull request\n");
    } else {
        // Check for uncommitted changes BEFORE modifying any files,
        // so we don't leave a dirty working tree on failure.
        ensureCleanWorkingTree();
    }

    // Prompt for configuration
    const config = await promptForConfig(softwareName);
    rl.close();

    // Save configuration
    console.log("\n💾 Saving configuration...");
    setSoftwareConfig(softwareName, config);
    console.log("   ✅ Configuration saved to release-config.json");
    updateReleasesWorkflowPaths();

    // Create changelog structure
    createChangelogStructure(config);

    if (createPr) {
        // Create branch (working tree is already verified clean above)
        const branchName = createBranch(softwareName);

        // Commit and push changes
        commitAndPushChanges(softwareName, config, branchName);

        // Create pull request
        createPullRequest(softwareName, config, branchName);

        console.log("\n✨ Setup complete!");
        console.log("\n📋 Summary:");
        console.log(`   - Configuration saved for: ${config.name}`);
        console.log(`   - Branch created: ${branchName}`);
        console.log(`   - Changelog structure created`);
        console.log(
            "\n📝 Note: The unified CI workflow will automatically enforce changelog entries for this software."
        );
        console.log("\n🎉 Review and merge the PR to complete setup!");
    } else {
        console.log("\n✨ Setup complete (dry-run)!");
        console.log("\n📋 Summary:");
        console.log(`   - Configuration saved for: ${config.name}`);
        console.log(`   - Changelog structure created locally`);
        console.log("\n📝 Next steps:");
        console.log("   1. Review the changes in release-config.json and the changelog structure");
        console.log("   2. Commit the changes manually, or run with --create-pr to automate this");
        console.log(
            "\n📝 Note: The unified CI workflow will automatically enforce changelog entries for this software."
        );
    }
}

// Run if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const softwareName = args.find((arg) => !arg.startsWith("--"));
    const createPr = args.includes("--create-pr");

    if (!softwareName) {
        console.error("Usage: tsx scripts/release-setup.ts <software-name> [--create-pr]");
        console.error("\nOptions:");
        console.error("  --create-pr  Create a branch and pull request (default: dry-run with local changes only)");
        process.exit(1);
    }

    setupSoftware(softwareName, createPr).catch((error) => {
        console.error("Error during setup:", error);
        process.exit(1);
    });
}
