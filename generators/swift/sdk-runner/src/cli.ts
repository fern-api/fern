#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateSwiftSdk } from "./api";

yargs(hideBin(process.argv))
    .command(
        "generate",
        "Generate the Swift SDK for the API.",
        (y) =>
            y
                .option("api", {
                    type: "string",
                    description: "The API to generate.",
                    demandOption: false
                })
                .option("group", {
                    type: "string",
                    description: "The group to generate.",
                    demandOption: true
                })
                .option("version", {
                    type: "string",
                    description: "The version to use for the output.",
                    demandOption: false
                }),
        async (args) => {
            const { api, group, version } = args;

            await generateSwiftSdk({
                api,
                group,
                version
            });
        }
    )
    .demandCommand(1)
    .help()
    .parse();
