#!/usr/bin/env tsx
// biome-ignore-all lint/suspicious/noConsole: CLI script requires console output for user feedback
import { spawnSync } from "child_process";
import { listConfiguredSoftware, loadReleaseConfig } from "./release-config.js";

/**
 * Topologically sorts the software list so that sources with `propagatesTo`
 * are processed before their dependents. This guarantees a source's release
 * commit (which includes a propagated changelog entry for the dependent) is
 * pushed to main before the dependent's release runs and pulls it.
 */
function topologicalSort(softwareList: string[]): string[] {
    const config = loadReleaseConfig();
    const setList = new Set(softwareList);

    // Build in-degree map (target → number of sources that propagate to it)
    const inDegree = new Map<string, number>();
    const edges = new Map<string, string[]>();
    for (const sw of softwareList) {
        inDegree.set(sw, inDegree.get(sw) ?? 0);
        const targets = config.software[sw]?.propagatesTo ?? [];
        for (const target of targets) {
            if (setList.has(target)) {
                inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
                const existing = edges.get(sw) ?? [];
                existing.push(target);
                edges.set(sw, existing);
            }
        }
    }

    // Kahn's algorithm
    const queue = softwareList.filter((sw) => (inDegree.get(sw) ?? 0) === 0);
    const sorted: string[] = [];

    while (queue.length > 0) {
        const sw = queue.shift();
        if (sw === undefined) {
            break;
        }
        sorted.push(sw);
        for (const target of edges.get(sw) ?? []) {
            const newDegree = (inDegree.get(target) ?? 1) - 1;
            inDegree.set(target, newDegree);
            if (newDegree === 0) {
                queue.push(target);
            }
        }
    }

    if (sorted.length !== softwareList.length) {
        console.error("❌ Circular dependency detected in propagatesTo configuration");
        process.exit(1);
    }

    return sorted;
}

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

    // Ensure sources are released before their dependents
    softwareList = topologicalSort(softwareList);

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
