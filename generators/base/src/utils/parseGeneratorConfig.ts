import { readFile } from "fs/promises"

import { FernGeneratorExec, GeneratorExecParsing } from "@fern-api/browser-compatible-base-generator"

export async function parseGeneratorConfig(pathToConfig: string): Promise<FernGeneratorExec.GeneratorConfig> {
    const configStr = await readFile(pathToConfig)
    // biome-ignore lint/suspicious/noConsole: allow console
    console.log(`Parsed ${pathToConfig}`)
    const rawConfig = JSON.parse(configStr.toString())
    const parsedConfig = await GeneratorExecParsing.GeneratorConfig.parse(rawConfig, {
        unrecognizedObjectKeys: "passthrough"
    })

    if (!parsedConfig.ok) {
        // biome-ignore lint/suspicious/noConsole: allow console
        console.log(`Failed to parse ${pathToConfig}`)
        throw new Error("Failed to parse the generator configuration")
    }

    return parsedConfig.value
}
