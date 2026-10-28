import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

/**
 * Reads the package name from the generator config's output mode.
 *
 * Switches on `type` rather than calling `_visit` so that it also works with a
 * plain JSON config (e.g. the docs platform passes `JSON.parse`d configs, which have no `_visit`).
 */
export function getPackageName(config: FernGeneratorExec.GeneratorConfig): string | undefined {
    const mode = config.output.mode;
    switch (mode.type) {
        case "publish":
            return getPublishTargetPackageName(mode.publishTarget);
        case "github":
            return getGithubPublishInfoPackageName(mode.publishInfo);
        case "downloadFiles":
            return undefined;
        default:
            throw new Error("Unrecognized output mode.");
    }
}

function getPublishTargetPackageName(
    publishTarget: FernGeneratorExec.GeneratorPublishTarget | undefined
): string | undefined {
    switch (publishTarget?.type) {
        case "maven":
            return publishTarget.coordinate;
        case "npm":
        case "pypi":
        case "rubygems":
        case "nuget":
        case "crates":
            return publishTarget.packageName;
        default:
            return undefined;
    }
}

function getGithubPublishInfoPackageName(
    publishInfo: FernGeneratorExec.GithubPublishInfo | undefined
): string | undefined {
    switch (publishInfo?.type) {
        case "maven":
            return publishInfo.coordinate;
        case "npm":
        case "pypi":
        case "rubygems":
        case "nuget":
        case "crates":
            return publishInfo.packageName;
        default:
            return undefined;
    }
}
