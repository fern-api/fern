#!/usr/bin/env tsx
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback
import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import * as readline from "readline";
import {
    getChangelogFolder,
    getSoftwareDirectory,
    getUnreleasedDir,
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
    const changelogFolder = await question(`Changelog folder path (default: ${defaultChangelogFolder}): `);

    const defaultSoftwareDir = dirname(versionsFile);
    const softwareDirectory = await question(
        `Software directory to watch for changes (default: ${defaultSoftwareDir}): `
    );

    const config: SoftwareConfig = {
        name: displayName.trim() || softwareName,
        versionsFile: versionsFile.trim(),
        changelogFolder: changelogFolder.trim() || undefined,
        softwareDirectory: softwareDirectory.trim() || undefined
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
    const templateContent = `# Template for changelog entries
# Copy this file and rename it to describe your change (e.g., add-auth-feature.yml)
# yaml-language-server: $schema=../../../../../fern-changes-yml.schema.json

- summary: |
    Brief description of your change.
    You can use multiple lines for longer descriptions.
  type: feat  # Options: fix/chore (patch), feat/internal (minor), break (major)
`;
    writeFileSync(templatePath, templateContent);

    // Create .gitkeep to ensure directory is tracked
    const gitkeepPath = join(unreleasedDir, ".gitkeep");
    writeFileSync(gitkeepPath, "");

    console.log("   ✅ Changelog structure created");
}

function createBranch(softwareName: string): string {
    console.log("\n🌿 Creating git branch...");

    const branchName = `setup-release/${softwareName}-${Date.now()}`;

    try {
        // Check if there are uncommitted changes
        const status = execSync("git status --porcelain", { encoding: "utf-8" });
        if (status.trim()) {
            console.log("⚠️  Warning: You have uncommitted changes. Please commit or stash them first.");
            process.exit(1);
        }

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

    try {
        const prUrl = execSync(
            `gh pr create --title "chore: setup release configuration for ${softwareName}" --body "${prBody}" --base main --head ${branchName}`,
            { encoding: "utf-8" }
        );
        console.log(`   ✅ Pull request created: ${prUrl.trim()}`);
    } catch (error) {
        console.error("❌ Error creating pull request:", error);
        console.log("\n📝 You can create the PR manually with:");
        console.log(`   gh pr create --base main --head ${branchName}`);
    }
}

export async function setupSoftware(softwareName: string): Promise<void> {
    console.log(`\n🚀 Setting up release configuration for: ${softwareName}\n`);

    // Prompt for configuration
    const config = await promptForConfig(softwareName);
    rl.close();

    // Save configuration
    console.log("\n💾 Saving configuration...");
    setSoftwareConfig(softwareName, config);
    console.log("   ✅ Configuration saved to release-config.json");

    // Create changelog structure
    createChangelogStructure(config);

    // Create branch
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
    console.log("\n📝 Note: The unified CI workflow will automatically enforce changelog entries for this software.");
    console.log("\n🎉 Review and merge the PR to complete setup!");
}

// Run if called directly
if (require.main === module) {
    const softwareName = process.argv[2];

    if (!softwareName) {
        console.error("Usage: tsx scripts/release-setup.ts <software-name>");
        process.exit(1);
    }

    setupSoftware(softwareName).catch((error) => {
        console.error("Error during setup:", error);
        process.exit(1);
    });
}
