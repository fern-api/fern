import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Client option names already present on the root client.
 */
const RESERVED_OPTION_NAMES = new Set<string>([
    "environment",
    "baseUrl",
    "options",
    "client",
    "headers",
    "maxRetries",
    "timeout"
]);

export interface ServerVariableOption {
    variable: FernIr.ServerVariable;
    /** The constructor parameter name exposed to the user (idiomatic PHP camelCase). */
    optionName: string;
}

export function getSingleBaseUrlTemplatedEnvironment(
    config: FernIr.EnvironmentsConfig
): FernIr.SingleBaseUrlEnvironment | undefined {
    const environments = config.environments;
    if (environments.type !== "singleBaseUrl") {
        return undefined;
    }
    return (
        environments.environments.find(
            (environment) => environment.id === config.defaultEnvironment && environment.urlTemplate != null
        ) ?? environments.environments.find((environment) => environment.urlTemplate != null)
    );
}

export function getMultipleBaseUrlsTemplatedEnvironment(
    config: FernIr.EnvironmentsConfig
): FernIr.MultipleBaseUrlsEnvironment | undefined {
    const environments = config.environments;
    if (environments.type !== "multipleBaseUrls") {
        return undefined;
    }
    return (
        environments.environments.find(
            (environment) => environment.id === config.defaultEnvironment && environment.urlTemplates != null
        ) ?? environments.environments.find((environment) => environment.urlTemplates != null)
    );
}

/**
 * Returns the server URL variables (e.g. region) declared on the API's environments,
 * paired with the client-option name each is exposed under. Variables are de-duplicated
 * by id and de-collided against existing and generated client option names.
 *
 * When `enabled` is false, returns an empty list so that no server-URL-variable client
 * options are emitted and no URL-template interpolation is generated (pre-feature base-URL
 * behavior).
 */
export function getServerVariableOptions(
    environmentsConfig: FernIr.EnvironmentsConfig | undefined,
    caseConverter: CaseConverter,
    existingOptionNames: Iterable<string> = [],
    enabled = true
): ServerVariableOption[] {
    if (!enabled) {
        return [];
    }
    const usedOptionNames = new Set([...RESERVED_OPTION_NAMES, ...existingOptionNames]);
    return collectServerVariables(environmentsConfig).map((variable) => {
        const camel = caseConverter.camelSafe(getOriginalName(variable.name));
        let optionName = camel;
        if (usedOptionNames.has(optionName)) {
            optionName = caseConverter.camelSafe(`server url ${getOriginalName(variable.name)}`);
        }
        const baseOptionName = optionName;
        let suffix = 2;
        while (usedOptionNames.has(optionName)) {
            optionName = `${baseOptionName}${suffix}`;
            suffix++;
        }
        usedOptionNames.add(optionName);
        return { variable, optionName };
    });
}

function collectServerVariables(config: FernIr.EnvironmentsConfig | undefined): FernIr.ServerVariable[] {
    if (config == null) {
        return [];
    }
    const seen = new Set<string>();
    const result: FernIr.ServerVariable[] = [];
    const add = (variables: FernIr.ServerVariable[]): void => {
        for (const variable of variables) {
            if (!seen.has(variable.id)) {
                seen.add(variable.id);
                result.push(variable);
            }
        }
    };

    const environments = config.environments;
    switch (environments.type) {
        case "singleBaseUrl": {
            const environment = getSingleBaseUrlTemplatedEnvironment(config);
            if (environment?.urlVariables != null) {
                add(environment.urlVariables);
            }
            break;
        }
        case "multipleBaseUrls": {
            const environment = getMultipleBaseUrlsTemplatedEnvironment(config);
            if (environment?.urlVariables != null) {
                for (const variables of Object.values(environment.urlVariables)) {
                    add(variables);
                }
            }
            break;
        }
        default:
            assertNever(environments);
    }

    return result;
}

function escapeSingleQuoted(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * Builds a PHP string expression for a URL template by concatenating single-quoted
 * literal segments with the interpolated option variables. The template text is emitted
 * as single-quoted literals (never a double-quoted interpolated string) so an
 * author-controlled template cannot inject PHP variable interpolation such as `{$foo}`.
 */
export function urlTemplateToPhpConcatenation(template: string, options: ServerVariableOption[]): string {
    const idToOptionName = new Map(options.map(({ variable, optionName }) => [variable.id, optionName]));
    const parts: string[] = [];
    let literal = "";
    let index = 0;
    while (index < template.length) {
        if (template[index] === "{") {
            const end = template.indexOf("}", index);
            if (end !== -1) {
                const optionName = idToOptionName.get(template.slice(index + 1, end));
                if (optionName != null) {
                    if (literal.length > 0) {
                        parts.push(`'${escapeSingleQuoted(literal)}'`);
                        literal = "";
                    }
                    parts.push(`$${optionName}`);
                    index = end + 1;
                    continue;
                }
            }
        }
        literal += template[index];
        index += 1;
    }
    if (literal.length > 0 || parts.length === 0) {
        parts.push(`'${escapeSingleQuoted(literal)}'`);
    }
    return parts.join(" . ");
}
