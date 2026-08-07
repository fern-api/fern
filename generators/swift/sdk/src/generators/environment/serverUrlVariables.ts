import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { escapeSwiftStringLiteralContent } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

export interface ServerUrlVariable {
    variable: FernIr.ServerVariable;
    /** The parameter name and argument label the variable is exposed under. */
    name: string;
}

/**
 * Returns the server URL variables (e.g. region) that are referenced by at least one of the
 * API's URL templates, paired with the parameter name each is exposed under. Variables are
 * de-duplicated by id, and any name that collides with a reserved name is prefixed with
 * `serverUrl`.
 */
export function getServerUrlVariables({
    environments,
    caseConverter,
    reservedParameterNames
}: {
    environments: FernIr.SingleBaseUrlEnvironments;
    caseConverter: CaseConverter;
    reservedParameterNames: Set<string>;
}): ServerUrlVariable[] {
    const templates = environments.environments
        .map((environment) => environment.urlTemplate)
        .filter((template): template is string => template != null);
    if (templates.length === 0) {
        return [];
    }

    const seenIds = new Set<string>();
    const variables: FernIr.ServerVariable[] = [];
    for (const environment of environments.environments) {
        for (const variable of environment.urlVariables ?? []) {
            if (!seenIds.has(variable.id) && templates.some((template) => template.includes(`{${variable.id}}`))) {
                seenIds.add(variable.id);
                variables.push(variable);
            }
        }
    }

    return variables.map((variable) => {
        const originalName = getOriginalName(variable.name);
        const name = caseConverter.camelUnsafe(originalName);
        return {
            variable,
            name: reservedParameterNames.has(name) ? caseConverter.camelUnsafe(`server url ${originalName}`) : name
        };
    });
}

/**
 * Renders a URL template as a Swift string literal, interpolating each `{id}` placeholder with
 * the corresponding parameter, falling back to the variable's default. Placeholders without a
 * matching variable are emitted literally.
 */
export function urlTemplateToStringLiteral(template: string, variables: ServerUrlVariable[]): string {
    const interpolationsById = new Map(
        variables.map(({ variable, name }) => [
            variable.id,
            `\\(${name} ?? "${escapeSwiftStringLiteralContent(variable.default ?? "")}")`
        ])
    );
    let literal = "";
    let index = 0;

    while (index < template.length) {
        const character = template[index] ?? "";
        if (character === "{") {
            const end = template.indexOf("}", index);
            const interpolation = end === -1 ? undefined : interpolationsById.get(template.slice(index + 1, end));
            if (interpolation != null) {
                literal += interpolation;
                index = end + 1;
                continue;
            }
        }
        literal += escapeSwiftStringLiteralContent(character);
        index += 1;
    }

    return `"${literal}"`;
}
