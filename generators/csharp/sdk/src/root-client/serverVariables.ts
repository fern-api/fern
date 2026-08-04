import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { escapeForCSharpString } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";

/**
 * ClientOptions property names that a server URL variable must not shadow. A
 * variable whose idiomatic option name collides with one of these is exposed
 * under a `ServerUrl`-prefixed name instead.
 */
const RESERVED_OPTION_NAMES = new Set<string>([
    "BaseUrl",
    "Environment",
    "HttpClient",
    "Headers",
    "AdditionalHeaders",
    "MaxRetries",
    "Timeout",
    "GrpcOptions",
    "ExceptionHandler",
    "IsBaseUrlExplicitlySet",
    "IsEnvironmentExplicitlySet",
    "SetBaseUrl",
    "SetEnvironment"
]);

export interface ServerVariableOption {
    variable: FernIr.ServerVariable;
    /** The PascalCase ClientOptions property name exposed to the user. */
    optionName: string;
    /** The local variable name used when interpolating the URL template. */
    localName: string;
}

export function getServerVariableValueExpression({ variable, optionName }: ServerVariableOption): string {
    if (variable.default != null) {
        return `clientOptions.${optionName} ?? "${escapeForCSharpString(variable.default)}"`;
    }
    return `clientOptions.${optionName} ?? throw new global::System.ArgumentException("The '${optionName}' server URL variable has no default value and must be set.", nameof(clientOptions.${optionName}))`;
}

/**
 * Returns the server URL variables (e.g. region) declared on the API's environments,
 * paired with the client-option name each is exposed under. Variables are de-duplicated
 * by id and de-collided against existing ClientOptions property names.
 *
 * When `enabled` is false, returns an empty list so that callers neither emit the
 * server-URL-variable client options nor the URL-template interpolation, falling back
 * to the pre-feature base-URL behavior. Defaults to enabled.
 */
export function getServerVariableOptions(
    environmentsConfig: FernIr.EnvironmentsConfig | undefined,
    caseConverter: CaseConverter,
    enabled = true
): ServerVariableOption[] {
    if (!enabled) {
        return [];
    }
    const usedOptionNames = new Set(RESERVED_OPTION_NAMES);
    return collectServerVariables(environmentsConfig).map((variable) => {
        const pascal = caseConverter.pascalSafe(getOriginalName(variable.name));
        let optionName = pascal;
        while (usedOptionNames.has(optionName)) {
            optionName = caseConverter.pascalSafe(`server url ${optionName}`);
        }
        usedOptionNames.add(optionName);
        return { variable, optionName, localName: `_${caseConverter.camelSafe(optionName)}` };
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
 * Substitutes `{id}` placeholders in a URL template with `{localName}` and returns
 * the result wrapped as a C# interpolated string (e.g. `$"https://api.{_region}.example.com"`).
 *
 * All braces in the template are first escaped to their doubled C# form (`{{`/`}}`) so
 * that any brace that is not a declared server-variable placeholder is emitted as a
 * literal rather than becoming a live interpolation expression; the known `{id}`
 * placeholders are then reintroduced as real interpolation holes.
 */
export function urlTemplateToInterpolatedString(template: string, options: ServerVariableOption[]): string {
    let result = escapeForCSharpString(template).split("{").join("{{").split("}").join("}}");
    for (const { variable, localName } of options) {
        result = result.split(`{{${variable.id}}}`).join(`{${localName}}`);
    }
    return `$"${result}"`;
}
