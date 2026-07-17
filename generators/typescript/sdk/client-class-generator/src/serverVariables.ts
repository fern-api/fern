import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import type { FernIr } from "@fern-fern/ir-sdk";

/**
 * Option names already present on BaseClientOptions. A server URL variable whose
 * name collides with one of these is exposed under a `serverUrl`-prefixed name so
 * it does not shadow an existing client option.
 */
const RESERVED_OPTION_NAMES = new Set<string>([
    "environment",
    "baseUrl",
    "headers",
    "timeoutInSeconds",
    "maxRetries",
    "fetch",
    "fetcher",
    "logging",
    "stream",
    "auth"
]);

export interface ServerVariableOption {
    variable: FernIr.ServerVariable;
    /** The BaseClientOptions property name exposed to the user. */
    optionName: string;
    /** The local variable name used when interpolating the URL template. */
    localName: string;
}

/**
 * Returns the server URL variables (e.g. region) declared on the API's environments,
 * paired with the client-option name each is exposed under. Variables are de-duplicated
 * by id and de-collided against existing BaseClientOptions property names.
 *
 * When `serverUrlVariables` is `false`, server URL variables are opted out of entirely:
 * an empty list is returned so that neither the client-option properties nor the
 * construction-time URL-template interpolation are emitted, falling back to the
 * pre-feature base-URL behavior. Defaults to `true` (feature enabled) when unset.
 */
export function getServerVariableOptions(
    ir: FernIr.IntermediateRepresentation,
    caseConverter: CaseConverter,
    serverUrlVariables = true
): ServerVariableOption[] {
    if (!serverUrlVariables) {
        return [];
    }
    return collectServerVariables(ir).map((variable) => {
        const camel = caseConverter.camelSafe(getOriginalName(variable.name));
        const optionName = RESERVED_OPTION_NAMES.has(camel)
            ? caseConverter.camelSafe(`server url ${getOriginalName(variable.name)}`)
            : camel;
        return { variable, optionName, localName: `_${optionName}` };
    });
}

function collectServerVariables(ir: FernIr.IntermediateRepresentation): FernIr.ServerVariable[] {
    const config = ir.environments;
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
 * Substitutes `{id}` placeholders in a URL template with `${localName}` and returns
 * the result wrapped as a TypeScript template literal (including backticks).
 */
export function urlTemplateToTemplateLiteral(template: string, options: ServerVariableOption[]): string {
    let result = template;
    for (const { variable, localName } of options) {
        result = result.split(`{${variable.id}}`).join(`\${${localName}}`);
    }
    return `\`${result}\``;
}
