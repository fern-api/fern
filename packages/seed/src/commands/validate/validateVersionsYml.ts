import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import chalk from "chalk";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { validateAngleBracketEscaping } from "./angleBracketValidator";
import { assertValidSemVerChangeOrThrow, assertValidSemVerOrThrow } from "./semVerUtils";

export interface ValidateVersionsYmlOptions {
    absolutePathToChangelog: AbsoluteFilePath;
    context: TaskContext;
    /**
     * Optional parser function to validate schema-specific requirements.
     * If provided, will be called for each entry after basic validation.
     * Should throw if entry doesn't match schema.
     */
    schemaParser?: (entry: any) => void;
}

interface VersionEntry {
    version: string;
    changelogEntry?: Array<{
        summary?: string;
        type?: string;
    }>;
}

/**
 * Extracts the JSON Schema path from a yaml-language-server comment in the file content.
 * Example: # yaml-language-server: $schema=../../generator-cli-versions-yml.schema.json
 * Returns the relative path to the schema file, or null if not found.
 */
function extractSchemaPath(fileContent: string): string | null {
    const lines = fileContent.split("\n");
    const firstLine = lines[0]?.trim() ?? "";

    // Match: # yaml-language-server: $schema=<path>
    const match = firstLine.match(/^#\s*yaml-language-server:\s*\$schema=(.+)$/);
    if (match && match[1]) {
        return match[1].trim();
    }

    return null;
}

/**
 * Loads a JSON Schema from the given path relative to the changelog file.
 * Returns the parsed schema object or null if loading fails.
 */
async function loadJsonSchema(
    schemaPath: string,
    changelogPath: AbsoluteFilePath,
    context: TaskContext
): Promise<any | null> {
    try {
        // Resolve schema path relative to the changelog file
        const changelogDir = path.dirname(changelogPath);
        const absoluteSchemaPath = path.resolve(changelogDir, schemaPath);

        context.logger.debug(`Loading JSON Schema from: ${absoluteSchemaPath}`);

        const schemaContent = await readFile(absoluteSchemaPath, "utf-8");
        return JSON.parse(schemaContent);
    } catch (e) {
        context.logger.warn(`Failed to load JSON Schema from ${schemaPath}: ${(e as Error)?.message}`);
        return null;
    }
}

/**
 * Validates an arbitrary versions.yml (changelog) file without requiring workspace configuration.
 * This performs validation including:
 * - Valid semver version strings
 * - Proper semver progression between versions
 * - Proper angle bracket escaping in summaries
 * - JSON Schema validation (if schema is specified in file header)
 *
 * Optionally accepts a schema parser to validate schema-specific requirements.
 */
export async function validateVersionsYml({
    absolutePathToChangelog,
    context,
    schemaParser
}: ValidateVersionsYmlOptions): Promise<void> {
    // Check if file exists
    if (!(await doesPathExist(absolutePathToChangelog))) {
        context.logger.error(`Changelog does not exist at path ${absolutePathToChangelog}`);
        context.failAndThrow();
        return;
    }

    const fileContent = await readFile(absolutePathToChangelog, "utf-8");

    // Extract and load JSON Schema if specified
    const schemaPath = extractSchemaPath(fileContent);
    let jsonSchemaValidator: ValidateFunction | null = null;

    if (schemaPath != null) {
        context.logger.debug(`Found JSON Schema reference: ${schemaPath}`);
        const jsonSchema = await loadJsonSchema(schemaPath, absolutePathToChangelog, context);

        if (jsonSchema != null) {
            const ajv = new Ajv({
                allErrors: true,
                strict: false
            });
            addFormats(ajv);

            try {
                jsonSchemaValidator = ajv.compile(jsonSchema);
                context.logger.debug(chalk.green("JSON Schema loaded and compiled successfully"));
            } catch (e) {
                context.logger.warn(`Failed to compile JSON Schema: ${(e as Error)?.message}`);
            }
        }
    } else {
        context.logger.debug("No JSON Schema reference found in file header");
    }

    // Parse YAML content
    let changelogs: unknown;
    try {
        changelogs = yaml.load(fileContent);
    } catch (e) {
        context.logger.error(`Failed to parse YAML file: ${(e as Error)?.message}`);
        context.failAndThrow();
        return;
    }

    if (!Array.isArray(changelogs)) {
        context.logger.error("Changelog file must contain an array of entries");
        context.failAndThrow();
        return;
    }

    let hasErrors = false;

    // Validate against JSON Schema if available
    if (jsonSchemaValidator != null) {
        context.logger.debug("Validating against JSON Schema...");
        const isValid = jsonSchemaValidator(changelogs);

        if (!isValid && jsonSchemaValidator.errors) {
            hasErrors = true;
            context.logger.error(chalk.red("JSON Schema validation failed:"));
            for (const error of jsonSchemaValidator.errors) {
                const errorPath = error.instancePath || "root";
                const message = error.message || "validation error";
                context.logger.error(
                    chalk.red(`  ${errorPath}: ${message}${error.params ? ` (${JSON.stringify(error.params)})` : ""}`)
                );
            }
        } else {
            context.logger.debug(chalk.green("JSON Schema validation passed"));
            // After successful schema validation, we can safely type assert
            // This provides type safety for the rest of the validation
            context.logger.debug("Data conforms to schema - using strongly typed validation");
        }
    }

    // Validate each entry
    for (const entry of changelogs) {
        const typedEntry = entry as VersionEntry;

        // Check if version field exists
        if (!typedEntry.version) {
            context.logger.error(`Entry missing required 'version' field: ${yaml.dump(entry)}`);
            hasErrors = true;
            continue;
        }

        // Validate angle bracket escaping
        const angleBracketErrors = validateAngleBracketEscaping(entry);
        context.logger.debug(
            `Checking version ${typedEntry.version}: Found ${angleBracketErrors.length} angle bracket errors`
        );
        if (angleBracketErrors.length > 0) {
            hasErrors = true;
            for (const error of angleBracketErrors) {
                context.logger.error(chalk.red(error));
            }
        }

        // Validate semver format
        try {
            assertValidSemVerOrThrow(typedEntry.version);
            context.logger.debug(chalk.green(`${typedEntry.version} is valid`));
        } catch (e) {
            hasErrors = true;
            context.logger.error(`${typedEntry.version} is invalid semver`);
            context.logger.error((e as Error)?.message);
        }

        // Validate schema-specific requirements if parser provided
        if (schemaParser) {
            try {
                schemaParser(entry);
            } catch (e) {
                hasErrors = true;
                const maybeVersion = (entry as any)?.version;
                if (maybeVersion != null) {
                    context.logger.error(`${maybeVersion} failed schema validation`);
                } else {
                    context.logger.error(`Failed to parse: ${yaml.dump(entry)}`);
                }
                context.logger.error((e as Error)?.message);
            }
        }
    }

    // Validate semver changes between consecutive versions
    if (changelogs.length > 1) {
        const typedChangelogs = changelogs as VersionEntry[];

        for (let i = 0; i < typedChangelogs.length - 1; i++) {
            const currentEntry = typedChangelogs[i];
            const previousEntry = typedChangelogs[i + 1];

            if (!currentEntry?.version || !previousEntry?.version) {
                continue; // Skip if versions are missing (already reported above)
            }

            try {
                // Create minimal release objects for semver comparison
                // Cast to 'any' to work with different schema types (CLI vs Generator vs other)
                const currentRelease = {
                    version: currentEntry.version,
                    changelogEntry: currentEntry.changelogEntry ?? []
                } as any;
                const previousRelease = {
                    version: previousEntry.version,
                    changelogEntry: previousEntry.changelogEntry ?? []
                } as any;

                assertValidSemVerChangeOrThrow(currentRelease, previousRelease);
                context.logger.debug(
                    chalk.green(`Semver change valid: ${previousEntry.version} -> ${currentEntry.version}`)
                );
            } catch (e) {
                context.logger.error(`Invalid semver change: ${previousEntry.version} -> ${currentEntry.version}`);
                context.logger.error((e as Error)?.message);
                hasErrors = true;
            }
        }
    }

    if (!hasErrors) {
        context.logger.info(chalk.green("All changelogs are valid"));
    } else {
        context.failAndThrow();
    }
}
