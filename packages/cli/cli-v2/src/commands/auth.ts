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
        return yargs.demandCommand(1).fail((_msg, _err, yargs) => {
            yargs.showHelp();
            process.exit(1);
        });
    });
}
