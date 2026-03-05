import { schemas } from "@fern-api/config";
import type { Logger } from "@fern-api/logger";
import { isNullish, type Sourced } from "@fern-api/source";
import { ValidationIssue } from "@fern-api/yaml-loader";
import { DEFAULT_API_NAME } from "../../../api/config/converter/ApiDefinitionConverter.js";
import { FernYmlSchemaLoader } from "../../../config/fern-yml/FernYmlSchemaLoader.js";
import { LANGUAGES, type Language } from "../Language.js";
import type { SdkConfig } from "../SdkConfig.js";
import type { Target } from "../Target.js";
import { getImageReferenceFromLanguage } from "./getImageReferenceFromLanguage.js";
import { getLanguageFromImage } from "./getLanguageFromImage.js";

export namespace SdkConfigConverter {
    export interface GeneratorInfo {
        lang: Language;
        image: string;
        version: string;
    }

    export type Result = Success | Failure;

    export interface Success {
        success: true;
        config: SdkConfig;
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
    public convert({ fernYml }: { fernYml: FernYmlSchemaLoader.Success }): SdkConfigConverter.Result {
        const sdks = fernYml.data.sdks;
        const sourced = fernYml.sourced.sdks;
        if (sdks == null || isNullish(sourced)) {
            return {
                success: false,
                issues: []
            };
        }
        const config: SdkConfig = {
            org: fernYml.data.org,
            defaultGroup: sdks.defaultGroup,
            defaultGroupLocation: sourced.defaultGroup?.$loc,
            targets: this.convertTargets({
                targetsConfig: sdks.targets,
                sourced: sourced.targets,
                globalReadme: sdks.readme
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
        sourced,
        globalReadme
    }: {
        targetsConfig: Record<string, schemas.SdkTargetSchema>;
        sourced: Sourced<Record<string, schemas.SdkTargetSchema>>;
        globalReadme: schemas.ReadmeSchema | undefined;
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
                sourced: sourcedTarget,
                globalReadme
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
        sourced,
        globalReadme
    }: {
        name: string;
        target: schemas.SdkTargetSchema;
        sourced: Sourced<schemas.SdkTargetSchema>;
        globalReadme: schemas.ReadmeSchema | undefined;
    }): Target | undefined {
        const generatorInfo = this.resolveGeneratorInfo({ name, target, sourced });
        if (generatorInfo == null) {
            return undefined;
        }
        const readme = this.mergeReadme({ globalReadme, targetReadme: target.readme });
        return {
            name,
            lang: generatorInfo.lang,
            image: generatorInfo.image,
            version: generatorInfo.version,
            api: this.resolveApi({ api: target.api }),
            sourceLocation: sourced.$loc,
            config: target.config != null ? this.convertConfig(target.config) : undefined,
            output: schemas.resolveOutputObjectSchema(target.output),
            publish: target.publish,
            groups: target.group ?? [],
            metadata: target.metadata,
            readme
        };
    }

    private mergeReadme({
        globalReadme,
        targetReadme
    }: {
        globalReadme: schemas.ReadmeSchema | undefined;
        targetReadme: schemas.ReadmeSchema | undefined;
    }): schemas.ReadmeSchema | undefined {
        if (globalReadme == null && targetReadme == null) {
            return undefined;
        }
        if (globalReadme == null) {
            return targetReadme;
        }
        if (targetReadme == null) {
            return globalReadme;
        }
        const merged: schemas.ReadmeSchema = { ...globalReadme, ...targetReadme };
        if (globalReadme.customSections != null || targetReadme.customSections != null) {
            merged.customSections = [...(globalReadme.customSections ?? []), ...(targetReadme.customSections ?? [])];
        }
        return merged;
    }

    private resolveApi({ api }: { api: string | undefined }): string {
        return api ?? DEFAULT_API_NAME;
    }

    private resolveGeneratorInfo({
        name,
        target,
        sourced
    }: {
        name: string;
        target: schemas.SdkTargetSchema;
        sourced: Sourced<schemas.SdkTargetSchema>;
    }): SdkConfigConverter.GeneratorInfo | undefined {
        const lang = this.resolveLanguage({ name, target, sourced });
        if (lang == null) {
            return undefined;
        }
        const resolvedDockerImage = getImageReferenceFromLanguage({ lang, version: target.version });
        return {
            lang,
            image: resolvedDockerImage.image,
            version: resolvedDockerImage.tag
        };
    }

    private convertConfig(config: Record<string, unknown>): Record<string, unknown> | undefined {
        // For now, we return the config as-is. In the future, we can validate a
        // specific generator's configuration before it's passed to the generator.
        return config;
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
        if (target.image != null) {
            return getLanguageFromImage({ image: target.image });
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
