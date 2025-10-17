import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export function getPackageName(config: FernGeneratorExec.GeneratorConfig): string | undefined {
    const outputMode = config.output.mode;
    switch (outputMode.type) {
        case "publish": {
            const publishTarget = outputMode.publishTarget;
            if (publishTarget == null) {
                return undefined;
            }
            switch (publishTarget.type) {
                case "maven":
                    return publishTarget.coordinate;
                case "npm":
                    return publishTarget.packageName;
                case "pypi":
                    return publishTarget.packageName;
                case "rubygems":
                    return publishTarget.packageName;
                case "nuget":
                    return publishTarget.packageName;
                case "crates":
                    return publishTarget.packageName;
                case "postman":
                default:
                    return undefined;
            }
        }
        case "github": {
            const publishInfo = outputMode.publishInfo;
            if (publishInfo == null) {
                return undefined;
            }
            switch (publishInfo.type) {
                case "maven":
                    return publishInfo.coordinate;
                case "npm":
                    return publishInfo.packageName;
                case "pypi":
                    return publishInfo.packageName;
                case "rubygems":
                    return publishInfo.packageName;
                case "nuget":
                    return publishInfo.packageName;
                case "crates":
                    return publishInfo.packageName;
                case "postman":
                default:
                    return undefined;
            }
        }
        case "downloadFiles":
        default:
            return undefined;
    }
}
