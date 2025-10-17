import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export function getSdkVersion(config: FernGeneratorExec.GeneratorConfig): string | undefined {
    const outputMode = config.output.mode;
    switch (outputMode.type) {
        case "publish":
            return outputMode.version;
        case "github":
            return outputMode.version;
        case "downloadFiles":
        default:
            return undefined;
    }
}
