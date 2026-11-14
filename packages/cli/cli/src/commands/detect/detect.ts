import { detectRepository, summarizeDetection } from "@fern-api/wizard";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";

/** `fern detect`: what Fern finds in this repository (API specs, frameworks, docs tools, coding agents). */
export async function detect({ cliContext, json }: { cliContext: CliContext; json: boolean }): Promise<void> {
    const dir = process.cwd();
    const detection = await detectRepository(dir, { fernCliVersion: cliContext.environment.packageVersion });
    if (json) {
        cliContext.writeJsonToStdout(detection);
        return;
    }
    for (const [label, value] of summarizeDetection(dir, detection)) {
        cliContext.logger.info(`${chalk.bold(label)}: ${value}`);
    }
}
