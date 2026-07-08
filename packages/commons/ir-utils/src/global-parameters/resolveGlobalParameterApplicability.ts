import { assertNever } from "@fern-api/core-utils";
import {
    GlobalParameter,
    GlobalParameterId,
    GlobalParameterLocation,
    HttpEndpoint,
    HttpHeader,
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
     * Invoked once per explicit opt-in that is dropped because the endpoint does
     * not declare the surface the parameter targets (a body property at the
     * dotted path, or a query/header/path parameter with that name).
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
 * An endpoint "matches" a parameter when it declares the corresponding surface:
 * - `body`: its request-body schema contains the dotted target path.
 * - `query`: it declares a query parameter whose wire name equals the target
 *   (exact match).
 * - `header`: it (or its service) declares a header whose wire name equals the
 *   target (case-insensitive match).
 * - `path`: its path declares the target parameter.
 *
 * A parameter is injected into an endpoint when:
 * - `apply: always` (valid for `query`/`header` only): unconditionally, without
 *   requiring a match;
 * - `apply: auto`: the endpoint matches;
 * - `apply: explicit` (the default): the endpoint opted in via the per-operation
 *   `x-fern-global-parameter` extension AND matches. An opt-in that does not
 *   match is dropped with a warning.
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
                serviceHeaders: service.headers,
                globalParameters,
                types: ir.types,
                onWarning
            });
        }
    }
}

function resolveForEndpoint({
    endpoint,
    serviceHeaders,
    globalParameters,
    types,
    onWarning
}: {
    endpoint: HttpEndpoint;
    serviceHeaders: HttpHeader[];
    globalParameters: GlobalParameter[];
    types: Record<string, TypeDeclaration>;
    onWarning?: (message: string) => void;
}): GlobalParameterId[] | undefined {
    // Prior to resolution, `endpoint.globalParameters` holds the explicit opt-ins.
    const optIns = new Set(endpoint.globalParameters ?? []);
    const resolved: GlobalParameterId[] = [];

    for (const param of globalParameters) {
        const applyMode = param.apply ?? "explicit";
        let applies: boolean;
        if (applyMode === "always") {
            // `always` injects unconditionally. It is only valid for query/header
            // (enforced upstream at import/validation time); a body/path parameter
            // has no surface to inject into where the endpoint declares none.
            applies = true;
        } else {
            const matches = endpointMatchesParameter({ param, endpoint, serviceHeaders, types });
            if (applyMode === "auto") {
                applies = matches;
            } else {
                // explicit: opt-in required, and the opt-in must match
                if (optIns.has(param.id)) {
                    applies = matches;
                    if (!matches) {
                        onWarning?.(buildUnmatchedOptInWarning({ endpoint, param }));
                    }
                } else {
                    applies = false;
                }
            }
        }
        if (applies) {
            resolved.push(param.id);
        }
    }

    return resolved.length > 0 ? resolved : undefined;
}

/**
 * Whether the endpoint declares the surface the parameter targets (see the
 * per-location "matches" rules on {@link resolveGlobalParameterApplicability}).
 */
function endpointMatchesParameter({
    param,
    endpoint,
    serviceHeaders,
    types
}: {
    param: GlobalParameter;
    endpoint: HttpEndpoint;
    serviceHeaders: HttpHeader[];
    types: Record<string, TypeDeclaration>;
}): boolean {
    switch (param.location) {
        case "body":
            return requestBodyContainsPath({ requestBody: endpoint.requestBody, dottedTarget: param.target, types });
        case "query":
            return endpointDeclaresQueryParameter(endpoint, param.target);
        case "header":
            return endpointDeclaresHeader(endpoint, serviceHeaders, param.target);
        case "path":
            return endpointPathContainsParameter(endpoint, param.target);
        default:
            return assertNever(param.location);
    }
}

function buildUnmatchedOptInWarning({ endpoint, param }: { endpoint: HttpEndpoint; param: GlobalParameter }): string {
    return (
        `Endpoint "${endpoint.id}" opts into global parameter "${param.id}" ` +
        `(in: ${param.location}, target: "${param.target}") via x-fern-global-parameter, but the endpoint ` +
        `does not declare ${describeUnmatchedSurface(param.location)}. The parameter will not be injected ` +
        `for this endpoint.`
    );
}

function describeUnmatchedSurface(location: GlobalParameterLocation): string {
    switch (location) {
        case "body":
            return "a request body property at that path";
        case "query":
            return "a query parameter with that name";
        case "header":
            return "a header with that name";
        case "path":
            return "a path parameter with that name";
        default:
            return assertNever(location);
    }
}

function endpointDeclaresQueryParameter(endpoint: HttpEndpoint, target: string): boolean {
    return endpoint.queryParameters.some((queryParameter) => getWireValue(queryParameter.name) === target);
}

function endpointDeclaresHeader(endpoint: HttpEndpoint, serviceHeaders: HttpHeader[], target: string): boolean {
    const targetLower = target.toLowerCase();
    return [...serviceHeaders, ...endpoint.headers].some(
        (header) => getWireValue(header.name).toLowerCase() === targetLower
    );
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
    // Consuming a path segment starts a fresh traversal level: revisiting a type at a deeper
    // segment is a legitimate, finite descent (bounded by the remaining segments) through a
    // recursive schema, so `seen` is reset here. The guard only exists to stop segment-less
    // loops (alias chains, optional/nullable unwrapping, `extends`) within a single level.
    return typeReferenceContainsPath({ typeReference: match.valueType, segments: rest, types, seen: new Set() });
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
