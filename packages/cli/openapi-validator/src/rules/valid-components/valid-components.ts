import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const ValidComponentsRule: Rule = {
    name: "valid-components",
    description: "Validates component names follow OpenAPI naming conventions",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document } = context;

        if (!document.components) {
            return violations;
        }

        const componentNameRegex = /^[a-zA-Z0-9._-]+$/;

        const validateComponentNames = (componentType: string, components: Record<string, unknown>) => {
            Object.keys(components).forEach((name) => {
                if (!componentNameRegex.test(name)) {
                    violations.push({
                        severity: "error",
                        message: `[valid-components] Component name '${name}' in ${componentType} contains invalid characters. Must match: ^[a-zA-Z0-9._-]+$`,
                        path: `/components/${componentType}/${name}`
                    });
                }
            });
        };

        if (document.components.schemas) {
            validateComponentNames("schemas", document.components.schemas);
        }
        if (document.components.responses) {
            validateComponentNames("responses", document.components.responses);
        }
        if (document.components.parameters) {
            validateComponentNames("parameters", document.components.parameters);
        }
        if (document.components.examples) {
            validateComponentNames("examples", document.components.examples);
        }
        if (document.components.requestBodies) {
            validateComponentNames("requestBodies", document.components.requestBodies);
        }
        if (document.components.headers) {
            validateComponentNames("headers", document.components.headers);
        }
        if (document.components.securitySchemes) {
            validateComponentNames("securitySchemes", document.components.securitySchemes);
        }
        if (document.components.links) {
            validateComponentNames("links", document.components.links);
        }
        if (document.components.callbacks) {
            validateComponentNames("callbacks", document.components.callbacks);
        }

        return violations;
    }
};
