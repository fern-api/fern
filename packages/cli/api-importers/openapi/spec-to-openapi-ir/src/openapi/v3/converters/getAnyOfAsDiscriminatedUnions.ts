import { OpenAPIV3 } from "openapi-types";

import { isReferenceObject } from "../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";

export interface CandidateDiscriminant {
    discriminant: string;
    values: string[];
}

export function getCandidateDiscriminant(
    schemas: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[],
    context: AbstractOpenAPIV3ParserContext
): CandidateDiscriminant | undefined {
    let init = false;
    let candidateDiscriminants: Record<string, string[]> = {};
    for (const schema of schemas) {
        const resolvedSchema = isReferenceObject(schema) ? context.resolveSchemaReference(schema) : schema;
        const literals = getLiteralProperties(resolvedSchema);
        if (!init) {
            // when not initialized set candidate discriminants
            candidateDiscriminants = {
                ...Object.fromEntries(Object.entries(literals).map(([key, val]) => [key, [val]]))
            };
            init = true;
        } else {
            const candidateKeys = Object.keys(candidateDiscriminants);
            const schemaKeys = Object.keys(literals);
            const overlappingKeys = candidateKeys.filter((key) => schemaKeys.includes(key));
            if (overlappingKeys.length === 0) {
                return;
            }

            const updatedCandidateDiscriminants: Record<string, string[]> = {};
            for (const overlappingKey of overlappingKeys) {
                updatedCandidateDiscriminants[overlappingKey] = [...(candidateDiscriminants[overlappingKey] ?? [])];
                const literal = literals[overlappingKey];
                if (literal != null) {
                    updatedCandidateDiscriminants[overlappingKey]?.push(literal);
                }
            }

            candidateDiscriminants = updatedCandidateDiscriminants;
        }
    }
    const candidate = Object.entries(candidateDiscriminants)[0];
    if (candidate == null) {
        return undefined;
    } else {
        return {
            discriminant: candidate[0],
            values: candidate[1]
        };
    }
}

function getLiteralProperties(schema: OpenAPIV3.SchemaObject): Record<string, string> {
    const literals: Record<string, string> = {};
    for (const [propertyName, propertySchema] of Object.entries(schema.properties ?? {})) {
        // TODO(dsinghvi): check reference objects as possible discriminants
        if (isReferenceObject(propertySchema)) {
            continue;
        }
        if (propertySchema.enum != null && propertySchema.enum.length === 1 && propertySchema.enum[0] != null) {
            literals[propertyName] = propertySchema.enum[0];
        }
    }
    return literals;
}
