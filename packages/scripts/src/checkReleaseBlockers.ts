/* eslint-disable no-console */

import chalk from "chalk";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { isArray } from "lodash-es";
import path from "path";

const FILENAME = "release-blockers.yml";
const FILEPATH = path.join(__dirname, "../../..", FILENAME);

export async function checkReleaseBlockers(): Promise<void> {
    let releaseBlockersFileContents: string;
    try {
        releaseBlockersFileContents = (await readFile(FILEPATH)).toString();
    } catch {
        console.error(chalk.red(`Failed to read file ${FILEPATH}`));
        process.exit(1);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let yamlContents: any;
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yamlContents = yaml.load(releaseBlockersFileContents) as any;
    } catch {
        console.error(chalk.red(`Failed to parse YAML in ${FILENAME}`));
        process.exit(1);
    }

    const releaseBlockers = yamlContents["release-blockers"];
    if (releaseBlockers == null) {
        console.error(chalk.red(`key 'release-blockers' is missing in ${FILENAME}`));
        process.exit(1);
    }

    if (!isArray(releaseBlockers)) {
        console.error(chalk.red(`'release-blockers' is not an array in ${FILENAME}`));
        process.exit(1);
    }

    if (releaseBlockers.length > 0) {
        console.error(chalk.red(`Cannot release because there are blockers in ${FILENAME}`));
        process.exit(1);
    }
}
