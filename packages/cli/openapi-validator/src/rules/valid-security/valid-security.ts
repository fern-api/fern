import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const ValidSecurityRule: Rule = {
    name: "valid-security",
    description: "Validates security schemes and requirements",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document } = context;

        const securitySchemes = document.components?.securitySchemes || {};

        if (document.security) {
            document.security.forEach((requirement, index) => {
                Object.keys(requirement).forEach((schemeName) => {
                    if (!securitySchemes[schemeName]) {
                        violations.push({
                            severity: "error",
                            message: `[valid-security] Security requirement references undefined scheme '${schemeName}'`,
                            path: `/security/${index}`
                        });
                    }
                });
            });
        }

        Object.entries(securitySchemes).forEach(([schemeName, scheme]) => {
            if ("$ref" in scheme) {
                return;
            }

            const schemeObj = scheme as OpenAPIV3_1.SecuritySchemeObject;

            if (!schemeObj.type) {
                violations.push({
                    severity: "fatal",
                    message: `[valid-security] Security scheme '${schemeName}' must have a 'type' field`,
                    path: `/components/securitySchemes/${schemeName}`
                });
                return;
            }

            if (schemeObj.type === "http") {
                if (!schemeObj.scheme) {
                    violations.push({
                        severity: "error",
                        message: `[valid-security] HTTP security scheme '${schemeName}' must have a 'scheme' field`,
                        path: `/components/securitySchemes/${schemeName}`
                    });
                }
            } else if (schemeObj.type === "apiKey") {
                if (!schemeObj.name) {
                    violations.push({
                        severity: "error",
                        message: `[valid-security] API key security scheme '${schemeName}' must have a 'name' field`,
                        path: `/components/securitySchemes/${schemeName}`
                    });
                }
                if (!schemeObj.in) {
                    violations.push({
                        severity: "error",
                        message: `[valid-security] API key security scheme '${schemeName}' must have an 'in' field`,
                        path: `/components/securitySchemes/${schemeName}`
                    });
                }
            } else if (schemeObj.type === "oauth2") {
                if (!schemeObj.flows) {
                    violations.push({
                        severity: "error",
                        message: `[valid-security] OAuth2 security scheme '${schemeName}' must have a 'flows' field`,
                        path: `/components/securitySchemes/${schemeName}`
                    });
                }
            } else if (schemeObj.type === "openIdConnect") {
                if (!schemeObj.openIdConnectUrl) {
                    violations.push({
                        severity: "error",
                        message: `[valid-security] OpenID Connect security scheme '${schemeName}' must have an 'openIdConnectUrl' field`,
                        path: `/components/securitySchemes/${schemeName}`
                    });
                }
            }
        });

        return violations;
    }
};
