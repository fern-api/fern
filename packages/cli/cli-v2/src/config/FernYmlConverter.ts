import type {
    CliConfig,
    FernYml,
    GitOutputConfig,
    NpmPublishConfig,
    OutputConfig,
    PublishConfig,
    ReadmeConfig,
    SdksConfig,
    SdkTarget,
    SdkTargetsConfig,
    schemas
} from "@fern-api/config";
import type { Sourced, SourcedNullish, SourcedObject } from "@fern-api/source";

export class FernYmlConverter {
    /**
     * Converts a sourced fern.yml schema to a FernYml configuration, performing
     * validation beyond what zod can provide (e.g. does the SDK version actually
     * exist, etc).
     *
     * Extracts plain values from the sourced schema while preserving
     * access to the original sourced data for error reporting.
     */
    public convert(sourced: Sourced<schemas.FernYmlSchema>): FernYml {
        return {
            source: sourced,
            edition: sourced.edition.value,
            org: sourced.org.value,
            cli: this.ifPresent(sourced.cli, (cli) => this.convertCli(cli)),
            sdks: this.ifPresent(sourced.sdks, (sdks) => this.convertSdks(sdks))
        };
    }

    private convertCli(cli: SourcedObject<schemas.CliSchema>): CliConfig {
        return {
            version: cli.version?.value
        };
    }

    private convertSdks(sourced: SourcedObject<schemas.SdksSchema>): SdksConfig {
        return {
            autorelease: sourced.autorelease?.value,
            defaultGroup: sourced.defaultGroup?.value,
            readme: this.ifPresent(sourced.readme, (readme) => this.convertReadme(readme)),
            targets: this.ifPresent(sourced.targets, (targets) => this.convertTargets(targets))
        };
    }

    private convertReadme(readme: SourcedObject<schemas.ReadmeSchema>): ReadmeConfig {
        return {
            defaultEndpoint: readme.defaultEndpoint?.value
        };
    }

    private convertTargets(sourced: SourcedObject<Record<string, schemas.SdkTargetSchema>>): SdkTargetsConfig {
        return Object.fromEntries(Object.entries(sourced).map(([name, target]) => [name, this.convertTarget(target)]));
    }

    private convertTarget(sourced: Sourced<schemas.SdkTargetSchema>): SdkTarget {
        return {
            lang: sourced.lang?.value,
            version: sourced.version?.value,
            config: sourced.config?.value,
            publish: this.ifPresent(sourced.publish, (publish) => this.convertPublish(publish)),
            output: this.ifPresent(sourced.output, (output) => this.convertOutput(output))
        };
    }

    private convertPublish(publish: SourcedObject<schemas.PublishSchema>): PublishConfig {
        return {
            npm: this.ifPresent(publish.npm, (npm) => this.convertNpm(npm))
        };
    }

    private convertNpm(npm: SourcedObject<schemas.NpmPublishSchema>): NpmPublishConfig {
        return {
            packageName: npm.packageName.value
        };
    }

    private convertOutput(output: SourcedObject<schemas.OutputSchema>): OutputConfig {
        return {
            path: output.path?.value,
            git: this.ifPresent(output.git, (git) => this.convertGit(git))
        };
    }

    private convertGit(git: SourcedObject<schemas.GitOutputSchema>): GitOutputConfig {
        return {
            repository: git.repository.value
        };
    }

    /**
     * Helper to handle optional sourced objects. The Sourced<T | undefined> type
     * creates a union of SourcedObject<T> | SourcedNullish<undefined>. At runtime,
     * missing properties return actual undefined (not SourcedNullish) due to proxy
     * behavior, but TypeScript can't know this. This helper narrows the type safely.
     */
    private ifPresent<T extends object, R>(
        value: SourcedObject<T> | SourcedNullish<undefined> | undefined,
        convert: (v: SourcedObject<T>) => R
    ): R | undefined {
        if (value == null || "value" in value) {
            return undefined;
        }
        return convert(value);
    }
}
