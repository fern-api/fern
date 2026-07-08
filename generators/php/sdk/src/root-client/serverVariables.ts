import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Client option names already present on the root client. A server URL variable
 * whose name collides with one of these is exposed under a `serverUrl`-prefixed
 * name so it does not shadow an existing client option.
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

/**
 * Returns the server URL variables (e.g. region) declared on the API's environments,
 * paired with the client-option name each is exposed under. Variables are de-duplicated
 * by id and de-collided against existing client option names.
 */
export function getServerVariableOptions(
    environmentsConfig: FernIr.EnvironmentsConfig | undefined,
    caseConverter: CaseConverter
): ServerVariableOption[] {
    return collectServerVariables(environmentsConfig).map((variable) => {
        const camel = caseConverter.camelSafe(getOriginalName(variable.name));
        const optionName = RESERVED_OPTION_NAMES.has(camel)
            ? caseConverter.camelSafe(`server url ${getOriginalName(variable.name)}`)
            : camel;
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
        case "singleBaseUrl":
            for (const environment of environments.environments) {
                if (environment.urlVariables != null) {
                    add(environment.urlVariables);
                    break;
                }
            }
            break;
        case "multipleBaseUrls":
            for (const environment of environments.environments) {
                if (environment.urlVariables != null) {
                    for (const variables of Object.values(environment.urlVariables)) {
                        add(variables);
                    }
                    break;
                }
            }
            break;
        default:
            assertNever(environments);
    }

    return result;
}

/**
 * Substitutes `{id}` placeholders in a URL template with `{$optionName}` and returns
 * the result wrapped as a PHP double-quoted string (including the surrounding quotes).
 */
export function urlTemplateToPhpString(template: string, options: ServerVariableOption[]): string {
    let result = template.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    for (const { variable, optionName } of options) {
        result = result.split(`{${variable.id}}`).join(`{$${optionName}}`);
    }
    return `"${result}"`;
}
