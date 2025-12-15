import { relative } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { Rule, RuleViolation } from "../../Rule";

interface OpenAPISpec {
    components?: {
        securitySchemes?: Record<string, unknown>;
    };
    security?: Array<Record<string, unknown>>;
}

function normalizeAuthName(auth: string | undefined): string | undefined {
    if (!auth) {
        return undefined;
    }
    return auth.toLowerCase().trim();
}

function extractSecuritySchemeNames(spec: OpenAPISpec): string[] {
    const schemes: string[] = [];

    if (spec.components?.securitySchemes) {
        schemes.push(...Object.keys(spec.components.securitySchemes));
    }

    if (spec.security && Array.isArray(spec.security)) {
        for (const securityItem of spec.security) {
            if (securityItem && typeof securityItem === "object") {
                schemes.push(...Object.keys(securityItem));
            }
        }
    }

    return schemes;
}

function getAuthFromGeneratorsConfig(workspace: {
    generatorsConfiguration?: { api?: { auth?: unknown } };
}): string | undefined {
    const auth = workspace.generatorsConfiguration?.api?.auth;

    if (typeof auth === "string") {
        return auth;
    }

    return undefined;
}

export const NoAuthConflictsRule: Rule = {
    name: "no-auth-conflicts",
    create: ({ ossWorkspaces, logger, workspace: docsWorkspace }) => {
        return {
            file: async () => {
                const violations: RuleViolation[] = [];
                const processedFiles = new Set<string>();

                for (const workspace of ossWorkspaces) {
                    const generatorsAuth = getAuthFromGeneratorsConfig(workspace);

                    if (!generatorsAuth) {
                        continue;
                    }

                    const normalizedGeneratorsAuth = normalizeAuthName(generatorsAuth);

                    for (const spec of workspace.specs) {
                        if (spec.type === "openapi" && !processedFiles.has(spec.absoluteFilepath)) {
                            processedFiles.add(spec.absoluteFilepath);
                            try {
                                const contents = (await readFile(spec.absoluteFilepath)).toString();
                                const relativePath = relative(docsWorkspace.absoluteFilePath, spec.absoluteFilepath);

                                const isOpenApiV2 =
                                    contents.includes("swagger:") &&
                                    (contents.includes('swagger: "2.0"') ||
                                        contents.includes("swagger: '2.0'") ||
                                        contents.includes("swagger: 2.0"));

                                if (isOpenApiV2) {
                                    continue;
                                }

                                let parsedSpec: unknown;
                                try {
                                    parsedSpec = yaml.load(contents);
                                } catch (parseError) {
                                    logger.debug(`Could not parse OpenAPI spec file: ${spec.absoluteFilepath}`);
                                    continue;
                                }

                                if (!parsedSpec || typeof parsedSpec !== "object") {
                                    continue;
                                }

                                const openApiSpec = parsedSpec as OpenAPISpec;
                                const securitySchemeNames = extractSecuritySchemeNames(openApiSpec);

                                if (securitySchemeNames.length === 0) {
                                    continue;
                                }

                                const normalizedSchemeNames = securitySchemeNames.map((name) =>
                                    normalizeAuthName(name)
                                );
                                const hasMatchingScheme = normalizedSchemeNames.some(
                                    (schemeName) => schemeName === normalizedGeneratorsAuth
                                );

                                if (!hasMatchingScheme) {
                                    violations.push({
                                        severity: "warning",
                                        name: "Auth configuration conflict",
                                        message: `The auth configuration in generators.yml specifies "${generatorsAuth}", but the OpenAPI spec defines security schemes: [${securitySchemeNames.join(", ")}]. Either the OpenAPI spec should include a security scheme named "${generatorsAuth}", or there should be no securitySchemes defined in the OpenAPI spec.`,
                                        relativeFilepath: relativePath
                                    });
                                }
                            } catch (error) {
                                logger.warn(`Could not read OpenAPI spec file: ${spec.absoluteFilepath}`);
                                continue;
                            }
                        }
                    }
                }

                return violations;
            }
        };
    }
};
