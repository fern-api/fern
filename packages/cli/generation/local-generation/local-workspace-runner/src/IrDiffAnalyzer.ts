import { ContainerType, IntermediateRepresentation, TypeReference } from "@fern-api/ir-sdk";
import { VersionBump } from "./VersionUtils.js";

export interface IrDiffResult {
    bump: VersionBump;
    reasons: IrDiffReason[];
    /** Ceiling for downstream AI tiers — the AI cannot return higher than this. */
    maxPossibleBump: VersionBump;
}

export interface IrDiffReason {
    /** Rule identifier, e.g. "endpoint_removed" */
    rule: string;
    /** Human-readable detail */
    description: string;
    bump: VersionBump;
}

/**
 * Languages where a response field becoming optional from required is a
 * breaking change (typed languages with non-nullable defaults).
 */
const RESPONSE_OPTIONAL_MAJOR_LANGUAGES = new Set(["typescript", "python", "java", "go", "csharp"]);

/**
 * Languages where adding a new enum value is a breaking change
 * (exhaustive switch/match breaks).
 */
const ENUM_VALUE_MAJOR_LANGUAGES = new Set(["typescript", "java"]);

/**
 * Bump ordering for comparison.
 */
const BUMP_ORDER: Record<VersionBump, number> = {
    [VersionBump.NO_CHANGE]: 0,
    [VersionBump.PATCH]: 1,
    [VersionBump.MINOR]: 2,
    [VersionBump.MAJOR]: 3
};

function maxBump(a: VersionBump, b: VersionBump): VersionBump {
    return BUMP_ORDER[a] >= BUMP_ORDER[b] ? a : b;
}

/**
 * Serializes an HttpPath to a comparable string.
 */
function serializePath(path: { head: string; parts: Array<{ pathParameter: string; tail: string }> }): string {
    let result = path.head;
    for (const part of path.parts) {
        result += `{${part.pathParameter}}${part.tail}`;
    }
    return result;
}

/**
 * Builds a unique key for an endpoint: "serviceId::METHOD /path"
 */
function endpointKey(
    serviceId: string,
    endpoint: { method: string; fullPath: { head: string; parts: Array<{ pathParameter: string; tail: string }> } }
): string {
    return `${serviceId}::${endpoint.method} ${serializePath(endpoint.fullPath)}`;
}

/**
 * Serializes a TypeReference to a comparable string for detecting type changes.
 * Uses proper discriminated union narrowing on the IR SDK types.
 */
function serializeTypeReference(typeRef: TypeReference): string {
    switch (typeRef.type) {
        case "primitive":
            return `primitive:${typeRef.primitive.v1}`;
        case "named":
            return `named:${typeRef.typeId}`;
        case "container":
            return serializeContainerType(typeRef.container);
        case "unknown":
            return "unknown";
        default:
            return `other:${(typeRef as { type: string }).type}`;
    }
}

/**
 * Serializes a ContainerType to a comparable string.
 */
function serializeContainerType(container: ContainerType): string {
    switch (container.type) {
        case "optional":
            return `optional<${serializeTypeReference(container.optional)}>`;
        case "nullable":
            return `nullable<${serializeTypeReference(container.nullable)}>`;
        case "list":
            return `list<${serializeTypeReference(container.list)}>`;
        case "set":
            return `set<${serializeTypeReference(container.set)}>`;
        case "map":
            return `map<${serializeTypeReference(container.keyType)},${serializeTypeReference(container.valueType)}>`;
        case "literal":
            return `literal:${JSON.stringify(container.literal)}`;
        default:
            return `container:${(container as { type: string }).type}`;
    }
}

/**
 * Checks if a type reference is optional or nullable at the top level.
 */
function isOptionalOrNullable(typeRef: TypeReference): boolean {
    if (typeRef.type === "container") {
        return typeRef.container.type === "optional" || typeRef.container.type === "nullable";
    }
    return false;
}

/**
 * Analyzes the diff between two IR snapshots and returns a deterministic
 * version bump classification.
 *
 * @param previousIr The IR from the previous generation (snapshot)
 * @param currentIr The IR from the current generation
 * @param language The target SDK language (e.g. "typescript", "python", "java", "go", "ruby", "csharp")
 * @returns IrDiffResult with bump level, reasons, and maxPossibleBump ceiling
 */
export function analyzeIrDiff(
    previousIr: IntermediateRepresentation,
    currentIr: IntermediateRepresentation,
    language: string
): IrDiffResult {
    const reasons: IrDiffReason[] = [];
    const normalizedLanguage = language.toLowerCase();

    // --- Endpoint analysis ---
    diffEndpoints(previousIr, currentIr, normalizedLanguage, reasons);

    // --- Type analysis (enum changes, object property changes) ---
    diffTypes(previousIr, currentIr, normalizedLanguage, reasons);

    // --- Error analysis ---
    diffErrors(previousIr, currentIr, reasons);

    // --- Auth analysis ---
    diffAuth(previousIr, currentIr, reasons);

    // Compute overall bump from reasons
    let bump = VersionBump.PATCH;
    for (const reason of reasons) {
        bump = maxBump(bump, reason.bump);
    }

    // If no reasons at all, the IR is identical -> PATCH (cosmetic changes only)
    // The caller uses maxPossibleBump as the ceiling for AI
    const maxPossibleBump = bump;

    return { bump, reasons, maxPossibleBump };
}

// ---------------------------------------------------------------------------
// Endpoint diffing
// ---------------------------------------------------------------------------

function diffEndpoints(
    previousIr: IntermediateRepresentation,
    currentIr: IntermediateRepresentation,
    language: string,
    reasons: IrDiffReason[]
): void {
    // Build maps of endpoint keys for quick lookup
    const previousEndpoints = new Map<
        string,
        {
            serviceId: string;
            endpoint: IntermediateRepresentation["services"][string]["endpoints"][number];
            service: IntermediateRepresentation["services"][string];
        }
    >();
    const currentEndpoints = new Map<
        string,
        {
            serviceId: string;
            endpoint: IntermediateRepresentation["services"][string]["endpoints"][number];
            service: IntermediateRepresentation["services"][string];
        }
    >();

    for (const [serviceId, service] of Object.entries(previousIr.services)) {
        for (const endpoint of service.endpoints) {
            const key = endpointKey(serviceId, endpoint);
            previousEndpoints.set(key, { serviceId, endpoint, service });
        }
    }

    for (const [serviceId, service] of Object.entries(currentIr.services)) {
        for (const endpoint of service.endpoints) {
            const key = endpointKey(serviceId, endpoint);
            currentEndpoints.set(key, { serviceId, endpoint, service });
        }
    }

    // Also build maps by endpoint ID to detect path/method changes
    const previousEndpointById = new Map<
        string,
        {
            serviceId: string;
            endpoint: IntermediateRepresentation["services"][string]["endpoints"][number];
        }
    >();
    const currentEndpointById = new Map<
        string,
        {
            serviceId: string;
            endpoint: IntermediateRepresentation["services"][string]["endpoints"][number];
        }
    >();

    for (const [serviceId, service] of Object.entries(previousIr.services)) {
        for (const endpoint of service.endpoints) {
            previousEndpointById.set(endpoint.id, { serviceId, endpoint });
        }
    }
    for (const [serviceId, service] of Object.entries(currentIr.services)) {
        for (const endpoint of service.endpoints) {
            currentEndpointById.set(endpoint.id, { serviceId, endpoint });
        }
    }

    // Detect removed endpoints
    for (const [key, prev] of previousEndpoints) {
        if (!currentEndpoints.has(key)) {
            // Check if the endpoint ID still exists with a different path/method
            const current = currentEndpointById.get(prev.endpoint.id);
            if (current != null) {
                // Path or method changed
                const prevPath = serializePath(prev.endpoint.fullPath);
                const curPath = serializePath(current.endpoint.fullPath);
                if (prev.endpoint.method !== current.endpoint.method) {
                    reasons.push({
                        rule: "endpoint_method_changed",
                        description: `Endpoint "${prev.endpoint.name.originalName}" HTTP method changed from ${prev.endpoint.method} to ${current.endpoint.method}`,
                        bump: VersionBump.MAJOR
                    });
                }
                if (prevPath !== curPath) {
                    reasons.push({
                        rule: "endpoint_path_changed",
                        description: `Endpoint "${prev.endpoint.name.originalName}" path changed from "${prevPath}" to "${curPath}"`,
                        bump: VersionBump.MAJOR
                    });
                }
            } else {
                reasons.push({
                    rule: "endpoint_removed",
                    description: `Endpoint "${prev.endpoint.name.originalName}" (${prev.endpoint.method} ${serializePath(prev.endpoint.fullPath)}) was removed`,
                    bump: VersionBump.MAJOR
                });
            }
        }
    }

    // Detect added endpoints
    for (const [key, cur] of currentEndpoints) {
        if (!previousEndpoints.has(key)) {
            // Only count as added if the endpoint ID is truly new
            if (!previousEndpointById.has(cur.endpoint.id)) {
                reasons.push({
                    rule: "endpoint_added",
                    description: `New endpoint "${cur.endpoint.name.originalName}" (${cur.endpoint.method} ${serializePath(cur.endpoint.fullPath)}) was added`,
                    bump: VersionBump.MINOR
                });
            }
        }
    }

    // Detect changes in shared endpoints
    for (const [key, prev] of previousEndpoints) {
        const cur = currentEndpoints.get(key);
        if (cur == null) {
            continue;
        }

        // Compare request bodies
        diffRequestBody(prev.endpoint, cur.endpoint, language, reasons);

        // Compare response
        diffResponse(prev.endpoint, cur.endpoint, language, reasons);
    }
}

// ---------------------------------------------------------------------------
// Request body diffing
// ---------------------------------------------------------------------------

function diffRequestBody(
    prevEndpoint: IntermediateRepresentation["services"][string]["endpoints"][number],
    curEndpoint: IntermediateRepresentation["services"][string]["endpoints"][number],
    language: string,
    reasons: IrDiffReason[]
): void {
    const prevBody = prevEndpoint.requestBody;
    const curBody = curEndpoint.requestBody;

    // Both inlined request bodies: compare properties
    if (prevBody?.type === "inlinedRequestBody" && curBody?.type === "inlinedRequestBody") {
        const prevProps = new Map<string, (typeof prevBody.properties)[number]>();
        for (const prop of prevBody.properties) {
            prevProps.set(prop.name.wireValue, prop);
        }

        const curProps = new Map<string, (typeof curBody.properties)[number]>();
        for (const prop of curBody.properties) {
            curProps.set(prop.name.wireValue, prop);
        }

        // Check for removed required fields
        for (const [wireValue, prevProp] of prevProps) {
            const curProp = curProps.get(wireValue);
            if (curProp == null) {
                if (!isOptionalOrNullable(prevProp.valueType)) {
                    reasons.push({
                        rule: "required_request_field_removed",
                        description: `Required request field "${wireValue}" was removed from endpoint "${prevEndpoint.name.originalName}"`,
                        bump: VersionBump.MAJOR
                    });
                }
            }
        }

        // Check for added fields
        for (const [wireValue, curProp] of curProps) {
            if (!prevProps.has(wireValue)) {
                if (isOptionalOrNullable(curProp.valueType)) {
                    reasons.push({
                        rule: "optional_request_field_added",
                        description: `New optional request field "${wireValue}" was added to endpoint "${prevEndpoint.name.originalName}"`,
                        bump: VersionBump.MINOR
                    });
                } else {
                    reasons.push({
                        rule: "required_request_field_added",
                        description: `New required request field "${wireValue}" was added to endpoint "${prevEndpoint.name.originalName}" (breaks existing callers)`,
                        bump: VersionBump.MAJOR
                    });
                }
            }
        }

        // Check for required fields becoming optional (MINOR)
        for (const [wireValue, prevProp] of prevProps) {
            const curProp = curProps.get(wireValue);
            if (curProp == null) {
                continue;
            }
            if (!isOptionalOrNullable(prevProp.valueType) && isOptionalOrNullable(curProp.valueType)) {
                reasons.push({
                    rule: "required_request_field_made_optional",
                    description: `Required request field "${wireValue}" was made optional on endpoint "${prevEndpoint.name.originalName}"`,
                    bump: VersionBump.MINOR
                });
            }
        }
    }

    // Also diff query parameters
    diffQueryParameters(prevEndpoint, curEndpoint, language, reasons);
}

function diffQueryParameters(
    prevEndpoint: IntermediateRepresentation["services"][string]["endpoints"][number],
    curEndpoint: IntermediateRepresentation["services"][string]["endpoints"][number],
    _language: string,
    reasons: IrDiffReason[]
): void {
    const prevParams = new Map<string, (typeof prevEndpoint.queryParameters)[number]>();
    for (const param of prevEndpoint.queryParameters) {
        prevParams.set(param.name.wireValue, param);
    }

    const curParams = new Map<string, (typeof curEndpoint.queryParameters)[number]>();
    for (const param of curEndpoint.queryParameters) {
        curParams.set(param.name.wireValue, param);
    }

    // Removed required query params
    for (const [wireValue, prevParam] of prevParams) {
        const curParam = curParams.get(wireValue);
        if (curParam == null && !isOptionalOrNullable(prevParam.valueType)) {
            reasons.push({
                rule: "required_request_field_removed",
                description: `Required query parameter "${wireValue}" was removed from endpoint "${prevEndpoint.name.originalName}"`,
                bump: VersionBump.MAJOR
            });
        }
    }

    // Added query params
    for (const [wireValue, curParam] of curParams) {
        if (!prevParams.has(wireValue)) {
            if (isOptionalOrNullable(curParam.valueType)) {
                reasons.push({
                    rule: "optional_request_field_added",
                    description: `New optional query parameter "${wireValue}" was added to endpoint "${prevEndpoint.name.originalName}"`,
                    bump: VersionBump.MINOR
                });
            } else {
                reasons.push({
                    rule: "required_request_field_added",
                    description: `New required query parameter "${wireValue}" was added to endpoint "${prevEndpoint.name.originalName}" (breaks existing callers)`,
                    bump: VersionBump.MAJOR
                });
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Response diffing
// ---------------------------------------------------------------------------

function diffResponse(
    prevEndpoint: IntermediateRepresentation["services"][string]["endpoints"][number],
    curEndpoint: IntermediateRepresentation["services"][string]["endpoints"][number],
    language: string,
    reasons: IrDiffReason[]
): void {
    const prevResponse = prevEndpoint.response;
    const curResponse = curEndpoint.response;

    if (prevResponse?.body == null || curResponse?.body == null) {
        // If response was added where there was none, that's additive (MINOR at most)
        if (prevResponse?.body == null && curResponse?.body != null) {
            reasons.push({
                rule: "response_body_added",
                description: `Response body was added to endpoint "${prevEndpoint.name.originalName}"`,
                bump: VersionBump.MINOR
            });
        }
        return;
    }

    // Compare JSON response types
    if (prevResponse.body.type === "json" && curResponse.body.type === "json") {
        const prevJson = prevResponse.body.value;
        const curJson = curResponse.body.value;

        if (prevJson.type === "response" && curJson.type === "response") {
            const prevType = serializeTypeReference(prevJson.responseBodyType);
            const curType = serializeTypeReference(curJson.responseBodyType);

            if (prevType !== curType) {
                reasons.push({
                    rule: "response_type_changed",
                    description: `Response type changed on endpoint "${prevEndpoint.name.originalName}" from ${prevType} to ${curType}`,
                    bump: VersionBump.MAJOR
                });
            }
        }
    }

    // Detect response type category change (json -> streaming, etc.)
    if (prevResponse.body.type !== curResponse.body.type) {
        reasons.push({
            rule: "response_type_changed",
            description: `Response body type changed on endpoint "${prevEndpoint.name.originalName}" from "${prevResponse.body.type}" to "${curResponse.body.type}"`,
            bump: VersionBump.MAJOR
        });
    }
}

// ---------------------------------------------------------------------------
// Type diffing (objects, enums)
// ---------------------------------------------------------------------------

function diffTypes(
    previousIr: IntermediateRepresentation,
    currentIr: IntermediateRepresentation,
    language: string,
    reasons: IrDiffReason[]
): void {
    const prevTypes = previousIr.types;
    const curTypes = currentIr.types;

    // Check for removed/renamed types
    for (const [typeId, prevDecl] of Object.entries(prevTypes)) {
        const curDecl = curTypes[typeId];

        if (curDecl == null) {
            // Type removed — check if it's used in any response
            reasons.push({
                rule: "type_removed",
                description: `Type "${prevDecl.name.name.originalName}" was removed`,
                bump: VersionBump.MAJOR
            });
            continue;
        }

        // Same type ID exists — compare shapes
        if (prevDecl.shape.type === "enum" && curDecl.shape.type === "enum") {
            diffEnumType(prevDecl, curDecl, language, reasons);
        }

        if (prevDecl.shape.type === "object" && curDecl.shape.type === "object") {
            diffObjectType(prevDecl, curDecl, language, reasons);
        }

        // Shape type changed entirely (e.g. object -> enum)
        if (prevDecl.shape.type !== curDecl.shape.type) {
            reasons.push({
                rule: "type_shape_changed",
                description: `Type "${prevDecl.name.name.originalName}" shape changed from "${prevDecl.shape.type}" to "${curDecl.shape.type}"`,
                bump: VersionBump.MAJOR
            });
        }
    }
}

function diffEnumType(
    prevDecl: IntermediateRepresentation["types"][string],
    curDecl: IntermediateRepresentation["types"][string],
    language: string,
    reasons: IrDiffReason[]
): void {
    if (prevDecl.shape.type !== "enum" || curDecl.shape.type !== "enum") {
        return;
    }

    const prevValues = new Set(prevDecl.shape.values.map((v) => v.name.wireValue));
    const curValues = new Set(curDecl.shape.values.map((v) => v.name.wireValue));

    // New enum values
    for (const val of curValues) {
        if (!prevValues.has(val)) {
            const bump = ENUM_VALUE_MAJOR_LANGUAGES.has(language) ? VersionBump.MAJOR : VersionBump.MINOR;
            reasons.push({
                rule: "enum_value_added",
                description: `New enum value "${val}" added to "${prevDecl.name.name.originalName}"`,
                bump
            });
        }
    }

    // Removed enum values are always MAJOR
    for (const val of prevValues) {
        if (!curValues.has(val)) {
            reasons.push({
                rule: "enum_value_removed",
                description: `Enum value "${val}" removed from "${prevDecl.name.name.originalName}"`,
                bump: VersionBump.MAJOR
            });
        }
    }
}

function diffObjectType(
    prevDecl: IntermediateRepresentation["types"][string],
    curDecl: IntermediateRepresentation["types"][string],
    language: string,
    reasons: IrDiffReason[]
): void {
    if (prevDecl.shape.type !== "object" || curDecl.shape.type !== "object") {
        return;
    }

    const prevProps = new Map(prevDecl.shape.properties.map((p) => [p.name.wireValue, p]));
    const curProps = new Map(curDecl.shape.properties.map((p) => [p.name.wireValue, p]));

    // Removed properties
    for (const [wireValue, prevProp] of prevProps) {
        const curProp = curProps.get(wireValue);
        if (curProp == null) {
            // Optional response field removed is still MAJOR
            reasons.push({
                rule: "object_property_removed",
                description: `Property "${wireValue}" removed from type "${prevDecl.name.name.originalName}"`,
                bump: VersionBump.MAJOR
            });
            continue;
        }

        // Type changed
        const prevType = serializeTypeReference(prevProp.valueType);
        const curType = serializeTypeReference(curProp.valueType);
        if (prevType !== curType) {
            // Check if this is a required -> optional transition
            if (!isOptionalOrNullable(prevProp.valueType) && isOptionalOrNullable(curProp.valueType)) {
                const bump = RESPONSE_OPTIONAL_MAJOR_LANGUAGES.has(language) ? VersionBump.MAJOR : VersionBump.MINOR;
                reasons.push({
                    rule: "property_required_to_optional",
                    description: `Property "${wireValue}" on type "${prevDecl.name.name.originalName}" changed from required to optional`,
                    bump
                });
            } else {
                reasons.push({
                    rule: "property_type_changed",
                    description: `Property "${wireValue}" on type "${prevDecl.name.name.originalName}" type changed from ${prevType} to ${curType}`,
                    bump: VersionBump.MAJOR
                });
            }
        }
    }

    // Added properties — new response field is MINOR
    for (const [wireValue] of curProps) {
        if (!prevProps.has(wireValue)) {
            reasons.push({
                rule: "object_property_added",
                description: `New property "${wireValue}" added to type "${prevDecl.name.name.originalName}"`,
                bump: VersionBump.MINOR
            });
        }
    }
}

// ---------------------------------------------------------------------------
// Error diffing
// ---------------------------------------------------------------------------

function diffErrors(
    previousIr: IntermediateRepresentation,
    currentIr: IntermediateRepresentation,
    reasons: IrDiffReason[]
): void {
    for (const [errorId, prevError] of Object.entries(previousIr.errors)) {
        const curError = currentIr.errors[errorId];
        if (curError == null) {
            reasons.push({
                rule: "error_removed",
                description: `Error "${prevError.name.name.originalName}" was removed`,
                bump: VersionBump.MAJOR
            });
            continue;
        }

        // Error name changed (renamed)
        if (prevError.name.name.originalName !== curError.name.name.originalName) {
            reasons.push({
                rule: "error_renamed",
                description: `Error renamed from "${prevError.name.name.originalName}" to "${curError.name.name.originalName}"`,
                bump: VersionBump.MAJOR
            });
        }
    }
}

// ---------------------------------------------------------------------------
// Auth diffing
// ---------------------------------------------------------------------------

function diffAuth(
    previousIr: IntermediateRepresentation,
    currentIr: IntermediateRepresentation,
    reasons: IrDiffReason[]
): void {
    const prevSchemes = previousIr.auth.schemes.map((s) => s.type).sort();
    const curSchemes = currentIr.auth.schemes.map((s) => s.type).sort();

    if (JSON.stringify(prevSchemes) !== JSON.stringify(curSchemes)) {
        reasons.push({
            rule: "auth_scheme_changed",
            description: `Auth schemes changed from [${prevSchemes.join(", ")}] to [${curSchemes.join(", ")}]`,
            bump: VersionBump.MAJOR
        });
    }
}
