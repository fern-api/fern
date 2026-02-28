import type { schemas } from "@fern-api/config";
import {
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
    generatorsYml
} from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { convertApiSpecs } from "../converters/convertApiSpecs.js";
import { convertSdkTargetsFromRaw } from "../converters/convertSdkTargets.js";
import type { DetectResult, MigratorWarning } from "../types/index.js";

export declare namespace GeneratorsYmlMigrator {
    export interface Config {
        cwd: AbsoluteFilePath;
        apiName?: string;
    }

    export interface Result {
        success: boolean;
        api?: schemas.ApiDefinitionSchema;
        rawApi?: generatorsYml.ApiConfigurationSchema;
        sdks?: schemas.SdksSchema;
        warnings: MigratorWarning[];
        absoluteFilePath?: AbsoluteFilePath;
    }
}

export class GeneratorsYmlMigrator {
    private readonly cwd: AbsoluteFilePath;
    private readonly apiName?: string;

    constructor({ cwd, apiName }: GeneratorsYmlMigrator.Config) {
        this.cwd = cwd;
        this.apiName = apiName;
    }

    /**
     * Checks if generators.yml exists in the directory.
     */
    public async detect(): Promise<DetectResult> {
        const absoluteFilePath = await this.getAbsoluteFilePath();
        return { found: absoluteFilePath != null, absoluteFilePath };
    }

    /**
     * Migrates generators.yml to the new fern.yml format.
     */
    public async migrate(): Promise<GeneratorsYmlMigrator.Result> {
        const warnings: MigratorWarning[] = [];
        const absoluteFilePath = await this.getAbsoluteFilePath();

        if (absoluteFilePath == null) {
            return {
                success: false,
                warnings: [
                    {
                        type: "info",
                        message: "generators.yml not found"
                    }
                ]
            };
        }

        let content: string | undefined;
        try {
            content = await readFile(absoluteFilePath, "utf-8");
            const config = yaml.load(content) as generatorsYml.GeneratorsConfigurationSchema;

            if (config == null || typeof config !== "object") {
                return {
                    success: false,
                    warnings: [
                        {
                            type: "conflict",
                            message: "generators.yml is empty or invalid"
                        }
                    ]
                };
            }

            // Handle deprecated fields
            this.checkDeprecatedFields(config, warnings);

            // Convert API configuration (if present)
            let api: schemas.ApiDefinitionSchema | undefined;
            if (config.api != null) {
                const apiResult = convertApiSpecs(config.api);
                warnings.push(...apiResult.warnings);
                if (apiResult.specs.length > 0) {
                    api = { specs: apiResult.specs };
                }
            }

            // Convert SDK targets from config
            // Note: convertSdkTargetsFromRaw handles format variations in the output field
            const sdksResult = convertSdkTargetsFromRaw({
                groups: config.groups,
                defaultGroup: config["default-group"],
                autorelease: config.autorelease,
                readme: config.readme,
                apiName: this.apiName
            });
            warnings.push(...sdksResult.warnings);

            const sdks: schemas.SdksSchema | undefined =
                Object.keys(sdksResult.sdks.targets).length > 0 ? sdksResult.sdks : undefined;

            return {
                success: true,
                api,
                rawApi: config.api,
                sdks,
                warnings,
                absoluteFilePath
            };
        } catch (error) {
            let message = error instanceof Error ? error.message : String(error);

            // When the YAML error reason indicates a "bad indentation" or anchor issue and
            // the offending line contains a value starting with @, it is almost certainly an
            // unquoted scoped npm package name (e.g. @scope/package).  The @ character is a
            // reserved YAML anchor symbol, so the parser emits a confusing indentation error
            // instead of a clear "invalid character" message.
            if (
                error instanceof yaml.YAMLException &&
                error.mark != null &&
                content != null &&
                (error.reason === "bad indentation of a mapping entry" ||
                    error.reason === "unexpected end of the stream within a flow collection")
            ) {
                const lines = content.split("\n");
                const errorLine =
                    error.mark.line >= 0 && error.mark.line < lines.length ? lines[error.mark.line] : undefined;
                if (errorLine != null && /:\s+@/.test(errorLine)) {
                    message +=
                        '\n\nHint: Values starting with "@" (such as scoped npm packages) must be wrapped in quotes.' +
                        '\n  Example: package-name: "@scope/package"';
                }
            }

            return {
                success: false,
                warnings: [
                    {
                        type: "conflict",
                        message: `Failed to parse generators.yml: ${message}`
                    }
                ]
            };
        }
    }

    private checkDeprecatedFields(
        config: generatorsYml.GeneratorsConfigurationSchema,
        warnings: MigratorWarning[]
    ): void {
        if (config.openapi != null) {
            warnings.push({
                type: "deprecated",
                message: "The 'openapi' field is deprecated",
                suggestion: "Use 'api.specs' instead"
            });
        }

        if (config["openapi-overrides"] != null) {
            warnings.push({
                type: "deprecated",
                message: "The 'openapi-overrides' field is deprecated",
                suggestion: "Use 'api.specs.[].overrides' instead"
            });
        }

        if (config["spec-origin"] != null) {
            warnings.push({
                type: "deprecated",
                message: "The 'spec-origin' field is deprecated",
                suggestion: "Use 'api.specs.[].origin' instead"
            });
        }

        if (config["async-api"] != null) {
            warnings.push({
                type: "deprecated",
                message: "The 'async-api' field is deprecated",
                suggestion: "Use 'api.specs' with asyncapi instead"
            });
        }

        if (config["api-settings"] != null) {
            warnings.push({
                type: "deprecated",
                message: "The 'api-settings' field is deprecated",
                suggestion: "Use 'api.specs.[].settings' instead"
            });
        }

        if (config.whitelabel != null) {
            warnings.push({
                type: "unsupported",
                message: "Whitelabel configuration is not yet supported in fern.yml"
            });
        }

        if (config.metadata != null) {
            warnings.push({
                type: "unsupported",
                message: "Metadata configuration is not yet supported in fern.yml"
            });
        }

        if (config.reviewers != null) {
            warnings.push({
                type: "unsupported",
                message: "Reviewers configuration is not yet supported in fern.yml"
            });
        }

        if (config.aliases != null) {
            warnings.push({
                type: "unsupported",
                message: "Group aliases are not yet supported in fern.yml",
                suggestion: "Use multiple group names in target.group array instead"
            });
        }

        if (config["auth-schemes"] != null) {
            warnings.push({
                type: "info",
                message: "Auth schemes configuration detected but not yet migrated",
                suggestion: "Auth schemes will be supported in a future version"
            });
        }
    }

    private async getAbsoluteFilePath(): Promise<AbsoluteFilePath | undefined> {
        const ymlPath = join(this.cwd, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME));
        const yamlPath = join(this.cwd, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE));

        if (await doesPathExist(ymlPath, "file")) {
            return ymlPath;
        }
        if (await doesPathExist(yamlPath, "file")) {
            return yamlPath;
        }
        return undefined;
    }
}
