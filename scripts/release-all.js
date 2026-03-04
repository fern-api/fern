#!/usr/bin/env node
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function main() {
    const configPath = path.join(__dirname, "..", "release-config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const softwareList = Object.keys(config.software);

    console.log(`Software configured for release: ${softwareList.join(", ")}`);

    const failed = [];

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
            console.log(`✅ Release for ${software} completed`);
        } else {
            console.log(`⚠️  Release for ${software} exited with error`);
            failed.push(software);
        }
    }

    if (failed.length > 0) {
        console.log();
        console.log(`❌ The following releases encountered errors: ${failed.join(", ")}`);
        process.exit(1);
    }

    console.log();
    console.log("✅ All releases processed successfully");
}

main();
