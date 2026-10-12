import { Rule } from "../../Rule.js";

const PROJECT_STRUCTURE_DOCS_URL =
    "https://buildwithfern.com/learn/docs/getting-started/project-structure#api-definitions";

export const ApiSectionHasDefinitionRule: Rule = {
    name: "api-section-has-definition",
    create: () => ({
        unresolvedApiSection: ({ config, apiWorkspaces }) => {
            const available = apiWorkspaces
                .map((workspace) => workspace.workspaceName)
                .filter((name): name is string => name != null);
            const hint =
                config.apiName != null
                    ? `No API definition named '${config.apiName}' was found.` +
                      (available.length > 0
                          ? ` Available APIs: ${available.join(", ")}.`
                          : ` Named APIs live at fern/apis/<api-name>.`)
                    : apiWorkspaces.length === 0
                      ? "No API definition was found in this fern folder. Add one with `fern init --openapi <path-or-url>`, or remove the `api` navigation item."
                      : `Multiple API definitions were found (${available.join(", ")}); set 'api-name' to choose one.`;
            return [
                {
                    severity: "error",
                    message:
                        `API reference '${config.api}' does not resolve to an API definition, so the docs will fail to build. ${hint}\n` +
                        `Learn more: ${PROJECT_STRUCTURE_DOCS_URL}`
                }
            ];
        }
    })
};
