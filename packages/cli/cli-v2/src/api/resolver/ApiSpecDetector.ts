import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import yaml from "js-yaml";
import type { ApiSpecType } from "../config/ApiSpec.js";

/**
 * Supported spec types that can be auto-detected from a file.
 */
const DETECTABLE_SPEC_TYPES: readonly ApiSpecType[] = ["openapi", "asyncapi"];

export namespace ApiSpecDetector {
    export interface Args {
        /* The absolute file path to the file (i.e. downloaded from a URL or local file). */
        absoluteFilePath: AbsoluteFilePath;
        /* The original user-provided reference (path or URL), used in error messages. */
        reference: string;
        /* The content of the file. */
        content: string;
    }
}

/**
 * Detects the type of API specification from a file.
 */
export class ApiSpecDetector {
    public async detect({ absoluteFilePath, reference, content }: ApiSpecDetector.Args): Promise<ApiSpecType> {
        const parsed = this.parseOrThrow({ content, reference });
        if (typeof parsed !== "object" || parsed == null) {
            throw new CliError({
                message:
                    `Could not determine API type for "${reference}". ` +
                    `File must contain a top-level "openapi" or "asyncapi" key.`,
                code: CliError.Code.InternalError
            });
        }
        for (const specType of DETECTABLE_SPEC_TYPES) {
            if (specType in parsed) {
                return specType;
            }
        }
        throw new CliError({
            message:
                `Could not determine API type for "${reference}". ` +
                `File must contain a top-level "openapi" or "asyncapi" key.`,
            code: CliError.Code.InternalError
        });
    }

    private parseOrThrow({ content, reference }: { content: string; reference: string }): unknown {
        try {
            return yaml.load(content);
        } catch {
            throw new CliError({
                message: `Could not parse "${reference}" as YAML or JSON. Ensure the file is a valid OpenAPI or AsyncAPI specification.`,
                code: CliError.Code.ParseError
            });
        }
    }
}
