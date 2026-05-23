import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration-loader";
import { extractErrorMessage, sanitizeNullValues, validateAgainstJsonSchema } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";

import { readFile } from "fs/promises";
import yaml from "js-yaml";

import * as DocsYmlJsonSchema from "./docs-yml.schema.json";
import { DocsWorkspace } from "./types/Workspace.js";

function formatNavigationConfigError({
    error,
    value,
    defaultMessage = "Unknown error"
}: {
    error: validateAgainstJsonSchema.JsonSchemaError | undefined;
    value: unknown;
    defaultMessage?: string;
}): string {
    const message = error?.message ?? defaultMessage;
    const breadcrumb = error?.instancePath != null ? getNavigationBreadcrumb(value, error.instancePath) : undefined;
    return `${message}${breadcrumb != null ? ` (${breadcrumb})` : ""}`;
}

function getNavigationBreadcrumb(value: unknown, instancePath: string): string | undefined {
    const segments = instancePath
        .split("/")
        .filter((part) => part.length > 0)
        .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));

    const navigationIndex = segments.indexOf("navigation");
    if (navigationIndex === -1) {
        return undefined;
    }

    const breadcrumb: string[] = [];
    let current: unknown = value;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (segment == null) {
            continue;
        }
        if (isRecord(current) && i > navigationIndex && /^\d+$/.test(segments[i - 1] ?? "")) {
            const label = getNavigationLabel(current);
            if (label != null) {
                breadcrumb.push(label);
            }
        }
        current = getChild(current, segment);
    }

    if (isRecord(current)) {
        const label = getNavigationLabel(current);
        if (label != null) {
            breadcrumb.push(label);
        }
    }

    return breadcrumb.length > 0 ? `/${breadcrumb.join("/")}/` : undefined;
}

function getChild(value: unknown, segment: string): unknown {
    if (Array.isArray(value) && /^\d+$/.test(segment)) {
        return value[Number(segment)];
    }
    if (isRecord(value)) {
        return value[segment];
    }
    return undefined;
}

function getNavigationLabel(value: Record<string, unknown>): string | undefined {
    for (const key of ["tab", "section", "page", "title", "api", "changelog", "link"]) {
        const label = value[key];
        if (typeof label === "string" && label.length > 0) {
            return label;
        }
    }
    return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

export async function loadDocsWorkspace({
    fernDirectory,
    context
}: {
    fernDirectory: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsWorkspace | undefined> {
    const docsConfigurationFile = join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    if (!(await doesPathExist(docsConfigurationFile))) {
        return undefined;
    }

    const docsConfiguration = await loadDocsConfiguration({
        absolutePathToDocsDefinition: fernDirectory,
        context
    });
    if (docsConfiguration != null) {
        return {
            type: "docs",
            absoluteFilePath: fernDirectory,
            config: docsConfiguration,
            workspaceName: undefined,
            absoluteFilepathToDocsConfig: join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME))
        };
    }
    return undefined;
}

export async function loadDocsConfiguration({
    absolutePathToDocsDefinition,
    context
}: {
    absolutePathToDocsDefinition: AbsoluteFilePath;
    context: TaskContext;
}): Promise<docsYml.RawSchemas.DocsConfiguration | undefined> {
    if (!(await doesPathExist(absolutePathToDocsDefinition))) {
        return undefined;
    }
    const absolutePathOfConfiguration = join(
        absolutePathToDocsDefinition,
        RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
    );
    return await loadRawDocsConfiguration({
        absolutePathOfConfiguration,
        context
    });
}

export async function loadRawDocsConfiguration({
    absolutePathOfConfiguration,
    context
}: {
    absolutePathOfConfiguration: AbsoluteFilePath;
    context: TaskContext;
}): Promise<docsYml.RawSchemas.DocsConfiguration> {
    const contentsStr = await readFile(absolutePathOfConfiguration);
    let contentsJson: unknown;
    try {
        contentsJson = yaml.load(contentsStr.toString());
    } catch (error) {
        if (!(error instanceof yaml.YAMLException)) {
            throw error;
        }
        throw new CliError({
            message: `Failed to parse ${absolutePathOfConfiguration}: ${extractErrorMessage(error)}`,
            code: CliError.Code.ParseError
        });
    }
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    const result = validateAgainstJsonSchema(contentsJson, DocsYmlJsonSchema as any, {
        filePath: absolutePathOfConfiguration
    });
    if (result.success) {
        // Proactively sanitize null/undefined values before parsing
        const removedPaths: string[][] = [];
        context.logger.debug(`About to sanitize docs configuration JSON structure`);
        const sanitizedJson = sanitizeNullValues(contentsJson, [], removedPaths);

        if (removedPaths.length > 0) {
            context.logger.warn(
                `docs.yml contained null/undefined sections that were ignored: ${removedPaths.map((p) => p.join(".")).join(", ")}`
            );
        } else {
            context.logger.debug(`No null/undefined values found during sanitization`);
        }

        try {
            context.logger.debug(`Attempting to parse sanitized docs configuration`);
            return docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(sanitizedJson);
        } catch (err) {
            context.logger.error(`Parsing failed even after sanitization: ${extractErrorMessage(err)}`);
            // Log the JSON structure to debug
            context.logger.debug(`Sanitized JSON structure: ${JSON.stringify(sanitizedJson, null, 2)}`);
            throw new CliError({
                message: `Failed to parse ${absolutePathOfConfiguration}: ${extractErrorMessage(err)}`,
                code: CliError.Code.ParseError
            });
        }
    } else {
        throw new CliError({
            message: `Failed to parse docs.yml:\n${formatNavigationConfigError({
                error: result.error,
                value: contentsJson
            })}`,
            code: CliError.Code.ParseError
        });
    }
}
