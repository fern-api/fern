import { Rule, RuleContext, RuleViolation } from "../../Rule";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

export const ValidReferencesRule: Rule = {
    name: "valid-references",
    description: "Validates that all $ref references point to existing components",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document } = context;

        const availableRefs = new Set<string>();

        if (document.components) {
            const addRefs = (componentType: string, components: Record<string, unknown>) => {
                Object.keys(components).forEach((name) => {
                    availableRefs.add(`#/components/${componentType}/${name}`);
                });
            };

            if (document.components.schemas) {
                addRefs("schemas", document.components.schemas);
            }
            if (document.components.responses) {
                addRefs("responses", document.components.responses);
            }
            if (document.components.parameters) {
                addRefs("parameters", document.components.parameters);
            }
            if (document.components.examples) {
                addRefs("examples", document.components.examples);
            }
            if (document.components.requestBodies) {
                addRefs("requestBodies", document.components.requestBodies);
            }
            if (document.components.headers) {
                addRefs("headers", document.components.headers);
            }
            if (document.components.securitySchemes) {
                addRefs("securitySchemes", document.components.securitySchemes);
            }
            if (document.components.links) {
                addRefs("links", document.components.links);
            }
            if (document.components.callbacks) {
                addRefs("callbacks", document.components.callbacks);
            }
        }

        const checkRef = (ref: string, path: string) => {
            if (ref.startsWith("#/components/")) {
                if (!availableRefs.has(ref)) {
                    violations.push({
                        severity: "error",
                        message: `[valid-references] Reference '${ref}' points to non-existent component`,
                        path
                    });
                }
            }
        };

        const checkRefsInObject = (obj: unknown, basePath: string) => {
            if (!obj || typeof obj !== "object") {
                return;
            }

            if ("$ref" in obj && typeof obj.$ref === "string") {
                checkRef(obj.$ref, basePath);
                return;
            }

            if (Array.isArray(obj)) {
                obj.forEach((item, index) => checkRefsInObject(item, `${basePath}/${index}`));
            } else {
                Object.entries(obj).forEach(([key, value]) => {
                    checkRefsInObject(value, `${basePath}/${key}`);
                });
            }
        };

        if (document.paths) {
            Object.entries(document.paths).forEach(([path, pathItem]) => {
                if (!pathItem) {
                    return;
                }
                checkRefsInObject(pathItem, `/paths/${path}`);
            });
        }

        if (document.components) {
            checkRefsInObject(document.components, "/components");
        }

        return violations;
    }
};
