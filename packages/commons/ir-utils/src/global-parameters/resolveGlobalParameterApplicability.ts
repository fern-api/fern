import { assertNever } from "@fern-api/core-utils";
import {
    GlobalParameter,
    GlobalParameterId,
    HttpEndpoint,
    HttpRequestBody,
    IntermediateRepresentation,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeReference
} from "@fern-api/ir-sdk";

import { getOriginalName, getWireValue } from "../utils/namesUtils.js";

/**
 * A single object property reduced to the two things applicability resolution
 * cares about: its wire name and the type of its value (for descending into
 * nested dotted targets).
 */
interface PropertyEntry {
    wireValue: string;
    valueType: TypeReference;
}

export interface ResolveGlobalParameterApplicabilityOptions {
    /**
     * Invoked once per explicit opt-in that is dropped because the endpoint's
     * request-body schema does not contain the (body-location) target path.
     */
    onWarning?: (message: string) => void;
}

/**
 * Resolves, once at IR-generation time, which global parameters actually apply
 * to each endpoint, and rewrites `endpoint.globalParameters` to hold that
 * fully-resolved set. Before this pass `endpoint.globalParameters` holds only
 * the explicit opt-ins (from the per-operation `x-fern-global-parameter`
 * extension); after it, it is the resolved set that every generator can consume
 * with a simple membership check.
 *
 * Resolution rules, per parameter location:
 * - `body`: included iff the endpoint's request-body schema contains the dotted
 *   target path. This gate applies to both `auto` and `explicit` parameters. An
 *   `explicit` opt-in whose schema lacks the target is dropped with a warning.
 * - `header` / `query`: `auto` applies to every endpoint (these live outside the
 *   request body, mirroring global headers); `explicit` applies only where the
 *   endpoint opted in.
 * - `path`: `auto` applies to endpoints whose path declares the target parameter;
 *   `explicit` applies only where the endpoint opted in.
 */
export function resolveGlobalParameterApplicability(
    ir: Pick<IntermediateRepresentation, "globalParameters" | "services" | "types">,
    { onWarning }: ResolveGlobalParameterApplicabilityOptions = {}
): void {
    const globalParameters = ir.globalParameters;
    if (globalParameters == null || globalParameters.length === 0) {
        return;
    }

    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            endpoint.globalParameters = resolveForEndpoint({
                endpoint,
                globalParameters,
                types: ir.types,
                onWarning
            });
        }
    }
}

function resolveForEndpoint({
    endpoint,
    globalParameters,
    types,
    onWarning
}: {
    endpoint: HttpEndpoint;
    globalParameters: GlobalParameter[];
    types: Record<string, TypeDeclaration>;
    onWarning?: (message: string) => void;
}): GlobalParameterId[] | undefined {
    // Prior to resolution, `endpoint.globalParameters` holds the explicit opt-ins.
    const optIns = new Set(endpoint.globalParameters ?? []);
    const resolved: GlobalParameterId[] = [];

    for (const param of globalParameters) {
        const isAuto = param.apply === "auto";
        let applies: boolean;
        switch (param.location) {
            case "body": {
                const schemaHasTarget = requestBodyContainsPath({
                    requestBody: endpoint.requestBody,
                    dottedTarget: param.target,
                    types
                });
                if (isAuto) {
                    applies = schemaHasTarget;
                } else if (optIns.has(param.id)) {
                    applies = schemaHasTarget;
                    if (!schemaHasTarget) {
                        onWarning?.(
                            `Endpoint "${endpoint.id}" opts into global parameter "${param.id}" ` +
                                `(in: body, target: "${param.target}") via x-fern-global-parameter, but its ` +
                                `request body schema does not contain that path. The parameter will not be ` +
                                `injected for this endpoint.`
                        );
                    }
                } else {
                    applies = false;
                }
                break;
            }
            case "header":
            case "query":
                applies = isAuto || optIns.has(param.id);
                break;
            case "path":
                applies = isAuto ? endpointPathContainsParameter(endpoint, param.target) : optIns.has(param.id);
                break;
            default:
                assertNever(param.location);
        }
        if (applies) {
            resolved.push(param.id);
        }
    }

    return resolved.length > 0 ? resolved : undefined;
}

function endpointPathContainsParameter(endpoint: HttpEndpoint, target: string): boolean {
    return endpoint.allPathParameters.some((pathParameter) => getOriginalName(pathParameter.name) === target);
}

function requestBodyContainsPath({
    requestBody,
    dottedTarget,
    types
}: {
    requestBody: HttpRequestBody | undefined;
    dottedTarget: string;
    types: Record<string, TypeDeclaration>;
}): boolean {
    if (requestBody == null) {
        return false;
    }
    const segments = dottedTarget.split(".");
    if (segments.length === 0) {
        return false;
    }
    switch (requestBody.type) {
        case "inlinedRequestBody": {
            const seen = new Set<string>();
            const properties: PropertyEntry[] = [
                ...requestBody.properties.map((property) => ({
                    wireValue: getWireValue(property.name),
                    valueType: property.valueType
                })),
                ...(requestBody.extendedProperties ?? []).map((property) => ({
                    wireValue: getWireValue(property.name),
                    valueType: property.valueType
                }))
            ];
            // In the OpenAPI path, `extendedProperties` is not populated (that pass only runs
            // for the Fern definition), so inherited properties must be collected from `extends`.
            for (const extension of requestBody.extends) {
                properties.push(...collectPropertiesFromNamedType({ typeId: extension.typeId, types, seen }));
            }
            return propertiesContainPath({ properties, segments, types, seen });
        }
        case "reference":
            return typeReferenceContainsPath({
                typeReference: requestBody.requestBodyType,
                segments,
                types,
                seen: new Set()
            });
        case "fileUpload":
        case "bytes":
            // Non-JSON bodies have no object schema to inject a body global into.
            return false;
        default:
            assertNever(requestBody);
    }
}

function propertiesContainPath({
    properties,
    segments,
    types,
    seen
}: {
    properties: PropertyEntry[];
    segments: string[];
    types: Record<string, TypeDeclaration>;
    seen: Set<string>;
}): boolean {
    const [head, ...rest] = segments;
    const match = properties.find((property) => property.wireValue === head);
    if (match == null) {
        return false;
    }
    if (rest.length === 0) {
        return true;
    }
    return typeReferenceContainsPath({ typeReference: match.valueType, segments: rest, types, seen });
}

function typeReferenceContainsPath({
    typeReference,
    segments,
    types,
    seen
}: {
    typeReference: TypeReference;
    segments: string[];
    types: Record<string, TypeDeclaration>;
    seen: Set<string>;
}): boolean {
    const properties = resolveObjectProperties({ typeReference, types, seen });
    if (properties == null) {
        return false;
    }
    return propertiesContainPath({ properties, segments, types, seen });
}

/**
 * Resolves a type reference down to the object properties it exposes, unwrapping
 * optional/nullable containers and following named references and aliases.
 * Returns undefined when the reference does not resolve to an object (e.g. a
 * list, map, primitive, union, or enum), meaning a dotted path cannot descend
 * further.
 */
function resolveObjectProperties({
    typeReference,
    types,
    seen
}: {
    typeReference: TypeReference;
    types: Record<string, TypeDeclaration>;
    seen: Set<string>;
}): PropertyEntry[] | undefined {
    switch (typeReference.type) {
        case "container": {
            const container = typeReference.container;
            switch (container.type) {
                case "optional":
                    return resolveObjectProperties({ typeReference: container.optional, types, seen });
                case "nullable":
                    return resolveObjectProperties({ typeReference: container.nullable, types, seen });
                case "list":
                case "set":
                case "map":
                case "literal":
                    return undefined;
                default:
                    return assertNever(container);
            }
        }
        case "named": {
            if (seen.has(typeReference.typeId)) {
                return undefined;
            }
            seen.add(typeReference.typeId);
            const declaration = types[typeReference.typeId];
            if (declaration == null) {
                return undefined;
            }
            switch (declaration.shape.type) {
                case "object":
                    return collectObjectProperties({ object: declaration.shape, types, seen });
                case "alias":
                    return resolveObjectProperties({ typeReference: declaration.shape.aliasOf, types, seen });
                case "enum":
                case "union":
                case "undiscriminatedUnion":
                    return undefined;
                default:
                    return assertNever(declaration.shape);
            }
        }
        case "primitive":
        case "unknown":
            return undefined;
        default:
            return assertNever(typeReference);
    }
}

function collectPropertiesFromNamedType({
    typeId,
    types,
    seen
}: {
    typeId: string;
    types: Record<string, TypeDeclaration>;
    seen: Set<string>;
}): PropertyEntry[] {
    if (seen.has(typeId)) {
        return [];
    }
    seen.add(typeId);
    const declaration = types[typeId];
    if (declaration == null || declaration.shape.type !== "object") {
        return [];
    }
    return collectObjectProperties({ object: declaration.shape, types, seen });
}

function collectObjectProperties({
    object,
    types,
    seen
}: {
    object: ObjectTypeDeclaration;
    types: Record<string, TypeDeclaration>;
    seen: Set<string>;
}): PropertyEntry[] {
    const properties: PropertyEntry[] = object.properties.map((property) => ({
        wireValue: getWireValue(property.name),
        valueType: property.valueType
    }));
    for (const property of object.extendedProperties ?? []) {
        properties.push({ wireValue: getWireValue(property.name), valueType: property.valueType });
    }
    for (const extension of object.extends) {
        if (seen.has(extension.typeId)) {
            continue;
        }
        seen.add(extension.typeId);
        const declaration = types[extension.typeId];
        if (declaration != null && declaration.shape.type === "object") {
            properties.push(...collectObjectProperties({ object: declaration.shape, types, seen }));
        }
    }
    return properties;
}
