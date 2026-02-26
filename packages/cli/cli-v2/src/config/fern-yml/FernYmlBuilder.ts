import type { schemas } from "@fern-api/config";
import yaml from "js-yaml";

import type { Language } from "../../sdk/config/Language";

const SCHEMA_COMMENT = "# yaml-language-server: $schema=https://schema.buildwithfern.dev/fern-yml.json";

export namespace FernYmlBuilder {
    export type SpecFormat = "openapi" | "asyncapi";

    export interface OutputConfig {
        type: "local" | "git";
        mode?: "pr" | "release" | "push";
        path?: string;
        repository?: string;
        group?: string;
    }

    export interface Options {
        organization: string;
        languages: Language[];
        outputs: Map<Language, OutputConfig>;
        specFormat: SpecFormat;
        apiPath: string;
        defaultGroup?: string;
    }
}

/**
 * Serializes a fern.yml configuration file.
 */
export class FernYmlBuilder {
    /**
     * Builds the full fern.yml content string from the given options.
     */
    public build(options: FernYmlBuilder.Options): string {
        const targets: Record<string, schemas.SdkTargetSchema> = {};
        for (const language of options.languages) {
            const output = options.outputs.get(language);
            if (output == null) {
                continue;
            }
            const target: schemas.SdkTargetSchema = {
                output: this.buildOutput(output),
                ...(output.group != null ? { group: [output.group] } : {})
            };
            targets[language] = target;
        }

        const doc: Record<string, unknown> = {
            org: options.organization,
            api: {
                specs: [this.buildSpec(options.specFormat, options.apiPath)]
            },
            sdks: {
                ...(options.defaultGroup != null ? { defaultGroup: options.defaultGroup } : {}),
                targets
            }
        };

        const yamlContent = yaml.dump(doc, {
            indent: 2,
            lineWidth: 120,
            noRefs: true,
            sortKeys: false,
            quotingType: '"',
            forceQuotes: false
        });

        return `${SCHEMA_COMMENT}\n${yamlContent}`;
    }

    private buildSpec(specFormat: FernYmlBuilder.SpecFormat, apiPath: string): schemas.ApiSpecSchema {
        if (specFormat === "asyncapi") {
            return { asyncapi: apiPath };
        }
        return { openapi: apiPath };
    }

    private buildOutput(output: FernYmlBuilder.OutputConfig): schemas.OutputSchema {
        if (output.type === "local") {
            return output.path ?? "./sdks";
        }
        return {
            git: {
                repository: output.repository ?? "",
                ...(output.mode != null ? { mode: output.mode } : {})
            }
        };
    }
}
