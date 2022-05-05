import yargs from "yargs";

yargs
    .strict()
    .command(
        "$0 <path-to-config>",
        "fern-typescript",
        (yargs) =>
            yargs.positional("path-to-config", {
                type: "string",
                demandOption: true,
                describe: "path to the JSON file containing the Fern plugin config",
            }),
        (argv) => {
            console.log(argv.pathToConfig);
        }
    )
    .showHelpOnFail(true)
    .parse();
