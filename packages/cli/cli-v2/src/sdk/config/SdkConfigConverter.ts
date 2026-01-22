import { schemas } from "@fern-api/config";
import type { Logger } from "@fern-api/logger";
import { isNullish, type Sourced } from "@fern-api/source";
import { ValidationIssue } from "@fern-api/yaml-loader";
import { FernYmlSchemaLoader } from "../../config/fern-yml/FernYmlSchemaLoader";
import type { DockerImageReference } from "./DockerImageReference";
import type { GenerationConfig } from "./GenerationConfig";
import type { GitOutputConfig } from "./GitOutputConfig";
import { getDockerImageReference } from "./getDockerImageReference";
import { LANGUAGES, type Language } from "./Language";
import type { NpmPublishConfig } from "./NpmPublishConfig";
import type { OutputConfig } from "./OutputConfig";
import type { PublishConfig } from "./PublishConfig";
import type { Target } from "./Target";

export namespace SdkConfigConverter {
    export type Result = Success | Failure;

    export interface Success {
        success: true;
        config: GenerationConfig;
    }

    export interface Failure {
        success: false;
        issues: ValidationIssue[];
    }
}

/**
 * Converts a sourced fern.yml schema to SDK-specific generation configuration.
 *
 * Performs domain-specific validation beyond what Zod schema validation provides,
 * such as ensuring target versions exist.
 */
export class SdkConfigConverter {
    private readonly logger: Logger;
    private readonly issues: ValidationIssue[] = [];

    constructor({ logger }: { logger: Logger }) {
        this.logger = logger;
    }

    /**
     * Converts a sourced fern.yml schema to SDK generation configuration.
     *
     * @param sourced - The sourced fern.yml schema with source location tracking.
     * @returns Result with either the converted config or validation issues.
     */
    public convert({ fernYml }: { fernYml: FernYmlSchemaLoader.Result }): SdkConfigConverter.Result {
        if (!fernYml.success) {
            return {
                success: false,
                issues: fernYml.issues
            };
        }
        const sdks = fernYml.data.sdks;
        const sourced = fernYml.sourced.sdks;
        if (sdks == null || isNullish(sourced)) {
            return {
                success: false,
                issues: []
            };
        }
        const config: GenerationConfig = {
            org: fernYml.data.org,
            defaultGroup: sdks.defaultGroup,
            targets: this.convertTargets({
                targetsConfig: sdks.targets,
                sourced: sourced.targets
            })
        };
        if (this.issues.length > 0) {
            return {
                success: false,
                issues: this.issues
            };
        }
        return {
            success: true,
            config
        };
    }

    private convertTargets({
        targetsConfig,
        sourced
    }: {
        targetsConfig: Record<string, schemas.SdkTargetSchema>;
        sourced: Sourced<Record<string, schemas.SdkTargetSchema>>;
    }): Target[] {
        const targets: Target[] = [];
        for (const [name, target] of Object.entries(targetsConfig)) {
            const sourcedTarget = sourced[name];
            if (sourcedTarget == null) {
                continue;
            }
            const converted = this.convertTarget({
                name,
                target,
                sourced: sourcedTarget
            });
            if (converted != null) {
                targets.push(converted);
            }
        }
        return targets;
    }

    private convertTarget({
        name,
        target,
        sourced
    }: {
        name: string;
        target: schemas.SdkTargetSchema;
        sourced: Sourced<schemas.SdkTargetSchema>;
    }): Target | undefined {
        const lang = this.resolveLanguage({ name, target, sourced });
        if (lang == null) {
            return undefined;
        }
        const resolvedDockerImage = this.resolveDockerImage({ name, lang, version: target.version });
        return {
            name,
            lang,
            image: resolvedDockerImage.image,
            version: target.version ?? resolvedDockerImage.tag,
            config: target.config != null ? this.convertConfig(target.config) : undefined,
            output: this.convertOutput({ output: target.output, sourced: sourced.output }),
            publish:
                target.publish != null && !isNullish(sourced.publish)
                    ? this.convertPublish({ publish: target.publish, sourced: sourced.publish })
                    : undefined,
            groups: target.group ?? []
        };
    }

    private resolveDockerImage({
        name,
        lang,
        version
    }: {
        name: string;
        lang: Language;
        version: string | undefined;
    }): DockerImageReference {
        const dockerImage = getDockerImageReference({ lang, version });
        if (version == null) {
            this.logger.debug(`Target "${name}" has no version specified, using ${dockerImage}`);
        }
        return dockerImage;
    }

    private convertConfig(config: Record<string, unknown>): Record<string, unknown> | undefined {
        // For now, we return the config as-is. In the future, we can validate a
        // specific generator's configuration before it's passed to the generator.
        return config;
    }

    private convertOutput({
        output,
        sourced
    }: {
        output: schemas.OutputSchema;
        sourced: Sourced<schemas.OutputSchema>;
    }): OutputConfig {
        return {
            path: output.path,
            git:
                output.git != null && !isNullish(sourced.git)
                    ? this.convertGit({ git: output.git, sourced: sourced.git })
                    : undefined
        };
    }

    private convertGit({
        git,
        sourced: _sourced
    }: {
        git: schemas.GitOutputSchema;
        sourced: Sourced<schemas.GitOutputSchema>;
    }): GitOutputConfig {
        return {
            repository: git.repository
        };
    }

    private convertPublish({
        publish,
        sourced
    }: {
        publish: schemas.PublishSchema;
        sourced: Sourced<schemas.PublishSchema>;
    }): PublishConfig {
        return {
            npm:
                publish.npm != null && !isNullish(sourced.npm)
                    ? this.convertNpm({ npm: publish.npm, sourced: sourced.npm })
                    : undefined
        };
    }

    private convertNpm({
        npm,
        sourced: _sourced
    }: {
        npm: schemas.NpmPublishSchema;
        sourced: Sourced<schemas.NpmPublishSchema>;
    }): NpmPublishConfig {
        return {
            packageName: npm.packageName
        };
    }

    private resolveLanguage({
        name,
        target,
        sourced
    }: {
        name: string;
        target: schemas.SdkTargetSchema;
        sourced: Sourced<schemas.SdkTargetSchema>;
    }): Language | undefined {
        if (target.lang != null) {
            return target.lang;
        }
        const lang: Language = name as Language;
        if (LANGUAGES.includes(lang)) {
            // If the name of the target matches a known language, the
            // explicit 'lang' setting is optional.
            return lang;
        }
        this.issues.push(
            new ValidationIssue({
                message: `target "${name}" is not a recognized language; please specify the "lang" property`,
                location: sourced.$loc
            })
        );
        return undefined;
    }
}
