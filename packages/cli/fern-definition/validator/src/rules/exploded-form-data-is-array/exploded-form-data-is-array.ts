import { RawSchemas } from "@fern-api/fern-definition-schema"
import { ResolvedType, TypeResolverImpl, constructFernFileContext } from "@fern-api/ir-generator"

import { Rule, RuleViolation } from "../../Rule"
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator"

export const ExplodedFormDataIsArrayRule: Rule = {
    name: "exploded-form-data-is-array",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace)
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }, { relativeFilepath, contents: definitionFile }) => {
                    if (
                        endpoint.request == null ||
                        typeof endpoint.request === "string" ||
                        endpoint.request?.body == null ||
                        typeof endpoint.request.body === "string"
                    ) {
                        return []
                    }

                    if (!isHttpInlineRequestBodySchema(endpoint.request.body)) {
                        return []
                    }

                    const violations: RuleViolation[] = []

                    for (const [propertyKey, propertyShape] of Object.entries(endpoint.request.body.properties ?? {})) {
                        if (typeof propertyShape === "string") {
                            continue
                        }

                        if (propertyShape.style !== "exploded") {
                            continue
                        }

                        const file = constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                            rootApiFile: workspace.definition.rootApiFile.contents
                        })

                        const resolvedType = typeResolver.resolveType({
                            type: propertyShape.type,
                            file
                        })

                        if (resolvedType == null) {
                            // This error is caught by another rule.
                            return []
                        }

                        if (!isListType(resolvedType)) {
                            violations.push({
                                message: `${propertyKey} is exploded and must be a list. Did you mean list<${propertyShape.type}>?`,
                                severity: "error"
                            })
                        }
                    }

                    return violations
                }
            }
        }
    }
}

function isListType(type: ResolvedType): boolean {
    if (type._type !== "container") {
        return false
    }
    if (type.container._type === "list") {
        return true
    }
    if (type.container._type === "optional" || type.container._type === "nullable") {
        return isListType(type.container.itemType)
    }
    return false
}

function isHttpInlineRequestBodySchema(
    body: RawSchemas.HttpRequestBodySchema
): body is RawSchemas.HttpInlineRequestBodySchema {
    return (body as RawSchemas.HttpInlineRequestBodySchema)?.properties != null
}
