import { SdkGeneratorCLI } from './SdkGeneratorCli'

void runCli()

export async function runCli(): Promise<void> {
    const cli = new SdkGeneratorCLI()
    await cli.run({
        // We disable notifications because the `java-v2` generator notifications
        // prevent the `java` generator from succeeding in remote code generation
        // environments.
        disableNotifications: true
    })
}
