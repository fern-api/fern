#!/usr/bin/env tsx
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback
import { spawnSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

interface SoftwareConfig {
    name: string;
    versionsFile: string;
    changelogFolder?: string;
    softwareDirectory?: string;
}

interface ReleaseConfig {
    software: Record<string, SoftwareConfig>;
}

function main(): void {
    const configPath = join(__dirname, "..", "release-config.json");
    const config: ReleaseConfig = JSON.parse(readFileSync(configPath, "utf-8"));
    const softwareList = Object.keys(config.software);

    console.log(`Software configured for release: ${softwareList.join(", ")}`);

    const failed: string[] = [];

    for (const software of softwareList) {
        console.log();
        console.log("==========================================");
        console.log(`Processing release for: ${software}`);
        console.log("==========================================");

        const result = spawnSync("pnpm", ["release", software], {
            input: "yes\n",
            stdio: ["pipe", "inherit", "inherit"],
            encoding: "utf-8"
        });

        if (result.status === 0) {
            console.log(`\u2705 Release for ${software} completed`);
        } else {
            console.log(`\u26a0\ufe0f  Release for ${software} exited with error`);
            failed.push(software);
        }
    }

    if (failed.length > 0) {
        console.log();
        console.log(`\u274c The following releases encountered errors: ${failed.join(", ")}`);
        process.exit(1);
    }

    console.log();
    console.log("\u2705 All releases processed successfully");
}

main();
