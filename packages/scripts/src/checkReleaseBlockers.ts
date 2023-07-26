/* eslint-disable no-console */

import chalk from "chalk";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

export async function checkReleaseBlockers(releaseBlockersFilename: string): Promise<void> {
    const filepath = path.join(__dirname, "../../..", releaseBlockersFilename);

    let releaseBlockersFileContents: string;
    try {
        releaseBlockersFileContents = (await readFile(filepath)).toString();
    } catch {
        console.error(chalk.red(`Failed to read file ${filepath}`));
        process.exit(1);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let yamlContents: any;
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yamlContents = yaml.load(releaseBlockersFileContents) as any;
    } catch {
        console.error(chalk.red(`Failed to parse YAML in ${filepath}`));
        process.exit(1);
    }

    const releaseBlockers = yamlContents["release-blockers"];
    if (releaseBlockers == null) {
        console.error(chalk.red(`key 'release-blockers' is missing in ${filepath}`));
        process.exit(1);
    }

    if (!Array.isArray(releaseBlockers)) {
        console.error(chalk.red(`'release-blockers' is not an array in ${filepath}`));
        process.exit(1);
    }

    if (releaseBlockers.length > 0) {
        console.error(chalk.red(`Cannot release because there are blockers in ${filepath}`));
        process.exit(1);
    }
}
