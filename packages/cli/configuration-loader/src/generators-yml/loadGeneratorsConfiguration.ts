import {
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
    generatorsYml
} from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";

import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { convertGeneratorsConfiguration } from "./convertGeneratorsConfiguration.js";

export async function loadRawGeneratorsConfiguration({
    absolutePathToWorkspace,
    context,
    lenient
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    /** If true, use lenient parsing that tolerates unrecognized keys/union members (useful for seed run against customer configs that may use a different CLI version) */
    lenient?: boolean;
}): Promise<generatorsYml.GeneratorsConfigurationSchema | undefined> {
    const filepath = await getPathToGeneratorsConfiguration({ absolutePathToWorkspace });
    if (filepath == null) {
        return undefined;
    }

    const contentsStr = await readFile(filepath);
    try {
        const contentsParsed = yaml.load(contentsStr.toString());
        const parsed = generatorsYml.serialization.GeneratorsConfigurationSchema.parse(contentsParsed, {
            allowUnrecognizedEnumValues: lenient === true,
            unrecognizedObjectKeys: lenient === true ? "passthrough" : "fail",
            allowUnrecognizedUnionMembers: lenient === true,
            skipValidation: false,
            breadcrumbsPrefix: undefined,
            omitUndefined: false
        });
        if (parsed.ok) {
            return parsed.value;
        }
        // TODO: improve error message
        throw new CliError({
            message: parsed.errors.map((e) => e.message).join("\n"),
            code: CliError.Code.ConfigError
        });
    } catch (e) {
        if (e instanceof yaml.YAMLException) {
            const relativePath = path.relative(process.cwd(), filepath);
            let errorMessage = `Failed to parse ${relativePath}: ${e.reason}`;

            if (e.mark != null) {
                errorMessage += `\n  at line ${e.mark.line + 1}, column ${e.mark.column + 1}`;

                if (e.mark.snippet) {
                    errorMessage += `\n\n${e.mark.snippet}`;
                }
            }

            // When the YAML error reason indicates a "bad indentation" or anchor issue and
            // the offending line contains a value starting with @, it is almost certainly an
            // unquoted scoped npm package name (e.g. @scope/package).  The @ character is a
            // reserved YAML anchor symbol, so the parser emits a confusing indentation error
            // instead of a clear "invalid character" message.
            if (
                e.mark != null &&
                (e.reason === "bad indentation of a mapping entry" ||
                    e.reason === "unexpected end of the stream within a flow collection")
            ) {
                const fileContent = contentsStr.toString();
                const lines = fileContent.split("\n");
                const errorLine = e.mark.line >= 0 && e.mark.line < lines.length ? lines[e.mark.line] : undefined;
                if (errorLine != null && /:\s+@/.test(errorLine)) {
                    errorMessage +=
                        '\n\nHint: Values starting with "@" (such as scoped npm packages) must be wrapped in quotes.' +
                        '\n  Example: package-name: "@scope/package"';
                }
            }

            context.failAndThrow(errorMessage, undefined, { code: CliError.Code.ConfigError });
        } else {
            throw e;
        }
    }
    return undefined;
}

export async function loadGeneratorsConfiguration({
    absolutePathToWorkspace,
    context,
    lenient
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    /** If true, use lenient parsing that tolerates unrecognized keys/union members */
    lenient?: boolean;
}): Promise<generatorsYml.GeneratorsConfiguration | undefined> {
    const rawGeneratorsConfiguration = await loadRawGeneratorsConfiguration({
        absolutePathToWorkspace,
        context,
        lenient
    });
    if (rawGeneratorsConfiguration == null) {
        return undefined;
    }
    const filepath = await getPathToGeneratorsConfiguration({ absolutePathToWorkspace });
    if (filepath == null) {
        return undefined;
    }
    return convertGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration: filepath,
        rawGeneratorsConfiguration,
        context
    });
}

export async function getPathToGeneratorsConfiguration({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<AbsoluteFilePath | undefined> {
    const ymlPath = join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME));
    const yamlPath = join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE));

    if (await doesPathExist(ymlPath)) {
        return ymlPath;
    }
    if (await doesPathExist(yamlPath)) {
        return yamlPath;
    }
    return undefined;
}
