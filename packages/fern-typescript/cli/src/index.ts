import yargs from "yargs";
import { clientCommand } from "./commands/client";
import { modelCommand } from "./commands/modelCommand";
import { serverCommand } from "./commands/server";

yargs
    .strict()
    .command(
        "model <path_to_ir> <output_dir>",
        "convert the model portion of fern API intermediate representation to typescript types",
        (yargs) =>
            yargs
                .positional("path_to_ir", {
                    type: "string",
                    demandOption: true,
                    describe: "the file containing the IR",
                })
                .positional("output_dir", {
                    type: "string",
                    demandOption: true,
                    describe: "the directory to emit the generated code",
                }),
        (argv) => {
            modelCommand({
                pathToIr: argv["path_to_ir"],
                outputDir: argv["output_dir"],
            });
        }
    )
    .command(
        "server <path_to_ir> <output_dir>",
        "convert fern API intermediate representation to a typescript server",
        (yargs) =>
            yargs
                .positional("path_to_ir", {
                    type: "string",
                    demandOption: true,
                    describe: "the file containing the IR",
                })
                .positional("output_dir", {
                    type: "string",
                    demandOption: true,
                    describe: "the directory to emit the generated code",
                }),
        (argv) => {
            serverCommand({
                pathToIr: argv["path_to_ir"],
                outputDir: argv["output_dir"],
            });
        }
    )
    .command(
        "client <path_to_ir> <output_dir>",
        "convert fern API intermediate representation to a typescript client",
        (yargs) =>
            yargs
                .positional("path_to_ir", {
                    type: "string",
                    demandOption: true,
                    describe: "the file containing the IR",
                })
                .positional("output_dir", {
                    type: "string",
                    demandOption: true,
                    describe: "the directory to emit the generated code",
                }),
        (argv) => {
            clientCommand({
                pathToIr: argv["path_to_ir"],
                outputDir: argv["output_dir"],
            });
        }
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
