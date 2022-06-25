import { initialize } from "@fern-api/init";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { compileWorkspaces } from "./commands/compile/compileWorkspaces";
import { convertOpenApiToFernApiDefinition } from "./commands/convert-openapi/convertOpenApi";

void yargs(hideBin(process.argv))
    .scriptName("fern")
    .strict()
    .command({
        command: "init",
        describe: "Initializes an example Fern API",
        handler: initialize,
    })
    .command(
        ["add <generator> [workspaces...]"],
        "Add a generator to .fernrc.yml",
        (yargs) =>
            yargs
                .positional("workspaces", {
                    array: true,
                    type: "string",
                    description:
                        "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
                })
                .positional("generator", {
                    choices: ["typescript", "java", "postman"] as const,
                    demandOption: true,
                }),
        async (argv) => {
            await addGeneratorToWorkspaces(argv.workspaces ?? [], argv.generator);
        }
    )
    .command(
        ["generate [workspaces...]", "gen"],
        "Generate typesafe servers and clients",
        (yargs) =>
            yargs
                .option("local", {
                    boolean: true,
                    default: false,
                    description: "If true, code is generated using Docker on this machine.",
                })
                .positional("workspaces", {
                    array: true,
                    type: "string",
                    description:
                        "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
                }),
        async (argv) => {
            await compileWorkspaces({
                commandLineWorkspaces: argv.workspaces ?? [],
                runLocal: argv.local,
            });
        }
    )
    .command(
        ["convert <openapiPath> <fernDefinitionDir>"],
        "Converts Open API to Fern definition.",
        (yargs) =>
            yargs
                .positional("openapiPath", {
                    type: "string",
                    demandOption: true,
                    description: "Path to your Open API definition",
                })
                .positional("fernDefinitionDir", {
                    type: "string",
                    demandOption: true,
                    description: "Output directory for your Fern API definition",
                }),
        (argv) => convertOpenApiToFernApiDefinition(argv.openapiPath, argv.fernDefinitionDir)
    )
    .demandCommand()
    .showHelpOnFail(false)
    .parse();
