import { initialize } from "@fern-api/init";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { addPluginToWorkspaces } from "./commands/add-plugin/addPluginToWorkspaces";
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
        ["add <plugin> [workspaces...]"],
        "Add a plugin to .fernrc.yml",
        (yargs) =>
            yargs
                .positional("workspaces", {
                    array: true,
                    type: "string",
                    description:
                        "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
                })
                .positional("plugin", {
                    choices: ["typescript", "java", "postman"] as const,
                    demandOption: true,
                }),
        async (argv) => {
            await addPluginToWorkspaces(argv.workspaces ?? [], argv.plugin);
        }
    )
    .command(
        ["generate [workspaces...]", "gen"],
        "Generate typesafe servers and clients",
        (yargs) =>
            yargs.positional("workspaces", {
                array: true,
                type: "string",
                description:
                    "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
            }),
        (argv) => compileWorkspaces(argv.workspaces ?? [])
    )
    .command(
        ["convert <openapiPath> <fernDefinitionDir>"],
        "Converts Open API to Fern definition. This is incubating and not guaranteed to succeed.",
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
    .showHelpOnFail(true)
    .parse();
