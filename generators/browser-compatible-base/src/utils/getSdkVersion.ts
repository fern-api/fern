import { FernGeneratorExec } from '@fern-fern/generator-exec-sdk'

export function getSdkVersion(config: FernGeneratorExec.GeneratorConfig): string | undefined {
    return config.output.mode._visit<string | undefined>({
        publish: (gpc: FernGeneratorExec.GeneratorPublishConfig) => gpc.version,
        downloadFiles: () => undefined,
        github: (gom: FernGeneratorExec.GithubOutputMode) => gom.version,
        _other: () => {
            throw new Error('Unrecognized output mode.')
        }
    })
}
