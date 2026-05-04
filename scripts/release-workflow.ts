#!/usr/bin/env tsx
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback
import { spawnSync } from "child_process";
import { listConfiguredSoftware } from "./release-config.js";

function main(): void {
    const softwareArg = process.argv[2] ?? "all";
    const allSoftware = listConfiguredSoftware();

    let softwareList: string[];
    if (softwareArg === "all") {
        softwareList = allSoftware;
    } else {
        softwareList = softwareArg.split(",").map((s) => s.trim());
        for (const sw of softwareList) {
            if (!allSoftware.includes(sw)) {
                console.error(`Unknown software "${sw}". Available: ${allSoftware.join(", ")}`);
                process.exit(1);
            }
        }
    }

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
