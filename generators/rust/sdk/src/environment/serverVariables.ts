import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Builder method names already present on the generated client builder. A server URL
 * variable whose name collides with one of these is exposed under a `server_url`-prefixed
 * name so it does not shadow an existing builder method.
 */
const RESERVED_METHOD_NAMES = new Set<string>([
    "api_key",
    "base_url",
    "build",
    "client_id",
    "client_secret",
    "custom_header",
    "custom_headers",
    "environment",
    "max_retries",
    "new",
    "oauth_credentials",
    "oauth_token_endpoint",
    "oauth_token_exchange",
    "password",
    "timeout",
    "token",
    "user_agent",
    "username"
]);

export interface ServerVariableOption {
    variable: FernIr.ServerVariable;
    /** The builder method and field name exposed to the user. */
    name: string;
}

/**
 * Returns the server URL variables (e.g. region) declared on the API's environments, paired
 * with the builder method name each is exposed under. Variables are de-duplicated by id and
 * de-collided against the builder's existing method names.
 */
export function getServerVariableOptions(
    ir: FernIr.IntermediateRepresentation,
    caseConverter: CaseConverter
): ServerVariableOption[] {
    return collectServerVariables(ir).map((variable) => {
        const snake = caseConverter.snakeSafe(getOriginalName(variable.name));
        return {
            variable,
            name: RESERVED_METHOD_NAMES.has(snake)
                ? caseConverter.snakeSafe(`server url ${getOriginalName(variable.name)}`)
                : snake
        };
    });
}

/** Returns every URL template declared on the API's environments. */
export function collectUrlTemplates(ir: FernIr.IntermediateRepresentation): string[] {
    const environments = ir.environments?.environments;
    if (environments == null) {
        return [];
    }
    switch (environments.type) {
        case "singleBaseUrl":
            return environments.environments
                .map((environment) => environment.urlTemplate)
                .filter((template): template is string => template != null);
        case "multipleBaseUrls":
            return environments.environments.flatMap((environment) => Object.values(environment.urlTemplates ?? {}));
        default:
            assertNever(environments);
    }
}

/**
 * Returns the server URL variables that are referenced by at least one of the API's URL
 * templates. Variables that no template references are omitted so callers never expose an
 * option that cannot affect the resolved URL.
 */
export function getTemplatedServerVariableOptions(
    ir: FernIr.IntermediateRepresentation,
    caseConverter: CaseConverter
): ServerVariableOption[] {
    const templates = collectUrlTemplates(ir);
    return getServerVariableOptions(ir, caseConverter).filter((option) =>
        templates.some((template) => template.includes(`{${option.variable.id}}`))
    );
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
 * Renders a URL template as a Rust `format!` invocation, substituting each `{id}` placeholder
 * with a positional argument. Braces that do not correspond to a known variable are escaped so
 * they are emitted literally.
 */
export function urlTemplateToFormatExpression(template: string, options: ServerVariableOption[]): string {
    const byId = new Map(options.map((option) => [option.variable.id, option.name]));
    let formatString = "";
    const args: string[] = [];
    let index = 0;

    while (index < template.length) {
        const character = template[index];
        if (character === "{") {
            const end = template.indexOf("}", index);
            const id = end === -1 ? undefined : template.slice(index + 1, end);
            const argument = id != null ? byId.get(id) : undefined;
            if (argument != null && end !== -1) {
                formatString += "{}";
                args.push(argument);
                index = end + 1;
                continue;
            }
            formatString += "{{";
            index += 1;
            continue;
        }
        if (character === "}") {
            formatString += "}}";
            index += 1;
            continue;
        }
        formatString += character === '"' || character === "\\" ? `\\${character}` : character;
        index += 1;
    }

    if (args.length === 0) {
        // Braces were escaped for `format!`; a plain string literal must carry them unescaped.
        return `"${formatString.replaceAll("{{", "{").replaceAll("}}", "}")}".to_string()`;
    }
    return `format!("${formatString}", ${args.join(", ")})`;
}
