#!/usr/bin/env node 

import yargs from "yargs";
import { Argv } from "yargs";
import { hideBin } from 'yargs/helpers';

// interface Options {
//     docker : string,
//     config : string, //specify output filepath here? 
//     fixture : string,
//     recurse : boolean | undefined,
//     local : boolean | undefined,
//     "ir-filepath" : string | undefined,
//     "ir-version" : string | undefined,
//     update: boolean | undefined
// }


void tryRunCli()

export async function tryRunCli()
{
    const cli : Argv<{}> = yargs(hideBin(process.argv))
    
    addTestCommand(cli)

    await cli.parse();
    process.stdout.write("Finished")
}

function addTestCommand(cli : Argv<{}>) : void
{
    cli.command(
        "test",
        "Snapshot test generator",
        (yargs) => 
            yargs
                .option("irVersion", {
                    type: "string",
                    demandOption: false
                })
                .option("irLanguage", {
                    type: "string",
                    demandOption: false
                })
                .option("docker", {
                    type: "string",
                    demandOption: true
                }),
        (argv) =>
        {
            process.stdout.write(argv.docker+"\n")
        }
    )
}