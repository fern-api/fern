import { Arguments, CommandBuilder } from "yargs";

type Options = {
    docker : string,
    config : string, //specify output filepath here? 
    fixture : string,
    recurse : boolean | undefined,
    local : boolean | undefined,
    "ir-filepath" : string | undefined,
    "ir-version" : string | undefined,
    update: boolean | undefined

}

export const command : string = "test";
export const desc : string = "Seed CLI"

export const builder : CommandBuilder<Options, Options> = (yargs) => 
{
    return yargs
        .options({
            docker : {type: 'string', demandOption: true},
            config : {type: 'string', demandOption: true},
            fixture : {type: 'string', demandOption: true},
            recurse : {type: "boolean", demandOption: false},
            local : {type: "boolean", demandOptions: false, default: false},
            "ir-filepath" : {type: "string", demandOption: false},
            "ir-version" : {type: "string", demandOption: false},
            update: {type: "boolean", demandOption: false}
        })
}

export const handler = (argv : Arguments<Options> ) : void => 
{
    const { docker, fixture, config, recurse } = argv
    process.stdout.write(`Docker Path: ${docker}\nConfig Path: ${config}\nFixture Path: ${fixture}\nRecurse: ${recurse}`)
    process.exit(0)
}