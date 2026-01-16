import type { Argv } from "yargs";
import type { GlobalArgs } from "../context/GlobalArgs";
import { addGenerateCommand } from "./sdk/generate";

export function addSdkCommand(cli: Argv<GlobalArgs>): void {
    cli.command("sdk", "Configure and generate SDKs", (yargs) => {
        addGenerateCommand(yargs);
        return yargs.demandCommand(1).fail((msg, err, yargs) => {
            if (err != null) {
                process.stderr.write(`${err.message}\n`);
                process.exit(1);
            }
            if (msg != null) {
                process.stderr.write(`Error: ${msg}\n\n`);
            }
            yargs.showHelp();
            process.exit(1);
        });
    });
}
