import { SdkCustomConfig, SdkGeneratorCli } from '@fern-typescript/sdk-generator-cli'

import { TypescriptCustomConfigSchema } from '@fern-api/typescript-ast'

import { ServerGeneratorCLI } from './ServerGeneratorCli'

// Overrides for the SDK generator - will always take precedence
const sdkConfigOverrides: Partial<SdkCustomConfig> = {
    inlineFileProperties: true,
    noSerdeLayer: true
}

// Overrides for the server generator - will always take precedence
const serverConfigOverrides: Partial<TypescriptCustomConfigSchema> = {
    inlineFileProperties: true,
    noSerdeLayer: true
}

void runCli()

export async function runCli(): Promise<void> {
    const sdkCli = new SdkGeneratorCli({ configOverrides: sdkConfigOverrides })
    await sdkCli.runCli({ disableNotifications: true, outputSubDirectory: 'sdk', unzipOutput: true })
    const serverCli = new ServerGeneratorCLI({ configOverrides: serverConfigOverrides })
    await serverCli.run({ disableNotifications: true })
}
