import type { schemas } from "@fern-api/config";
import { ValidationIssue } from "@fern-api/yaml-loader";
import type { FernYmlSchemaLoader } from "../../../config/fern-yml/FernYmlSchemaLoader.js";
import type { DocsConfig } from "../DocsConfig.js";

const DOCS_YAML_PATH = "docs";

export namespace DocsConfigConverter {
    export type Result = Success | Failure;

    export interface Success {
        success: true;
        config: DocsConfig;
    }

    export interface Failure {
        success: false;
        issues: ValidationIssue[];
    }
}

export class DocsConfigConverter {
    private readonly issues: ValidationIssue[] = [];
    public convert({ fernYml }: { fernYml: FernYmlSchemaLoader.Success }): DocsConfigConverter.Result {
        const docs = fernYml.data.docs;
        if (docs == null) {
            return { success: false, issues: [] };
        }

        this.validateInstances({ docs, fernYml });

        if (this.issues.length > 0) {
            return { success: false, issues: this.issues };
        }

        // When docs is inlined via `$ref`, find the path mapping for the "docs" key
        // to determine the actual file the docs config came from. This ensures that
        // relative paths inside docs.yml (e.g. css, navigation pages) resolve from
        // the correct directory rather than relative to fern.yml.
        const docsPathMapping = fernYml.pathMappings.find(
            (m) => m.yamlPath.length === 1 && m.yamlPath[0] === DOCS_YAML_PATH
        );
        const absoluteFilePath =
            docsPathMapping != null ? docsPathMapping.document.absoluteFilePath : fernYml.absoluteFilePath;

        return {
            success: true,
            config: {
                raw: docs,
                absoluteFilePath
            }
        };
    }

    private validateInstances({
        docs,
        fernYml
    }: {
        docs: schemas.DocsSchema;
        fernYml: FernYmlSchemaLoader.Success;
    }): void {
        if (docs.instances.length === 0) {
            this.issues.push(
                new ValidationIssue({
                    message: "You must specify at least one docs instance",
                    location: fernYml.sourced.$loc
                })
            );
        }
    }
}
