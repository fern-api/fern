import type { Argv } from "yargs";
import type { GlobalArgs } from "../context/GlobalArgs";
import { addLoginCommand } from "./auth/login";
import { addLogoutCommand } from "./auth/logout";
import { addTokenCommand } from "./auth/token";

export function addAuthCommand(cli: Argv<GlobalArgs>): void {
    cli.command("auth", "Authenticate fern", (yargs) => {
        addLoginCommand(yargs);
        addLogoutCommand(yargs);
        addTokenCommand(yargs);
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
