import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * The crate that owns types more than one partition can reach. Named separately
 * from the per-API partitions because it is the only crate they may depend on.
 */
export const CORE_PARTITION_KEY = "core";

export interface TypeCratePartition {
    /**
     * Snake-case suffix for the emitted crate, derived from the top-level
     * subpackage (e.g. `api_v2010`), or {@link CORE_PARTITION_KEY}.
     */
    key: string;
    typeIds: FernIr.TypeId[];
    /**
     * Endpoints whose generated request/query structs belong in this crate.
     * They live with their own service because they reference that service's
     * types; hoisting them to core would invert the dependency direction.
     */
    endpointIds: FernIr.EndpointId[];
}

/**
 * The slice of the IR partitioning reads. Declared as `Pick`s of the IR types so
 * a real {@link FernIr.IntermediateRepresentation} is assignable while tests stay
 * free of irrelevant boilerplate.
 */
export interface TypePartitionInput {
    types: Record<FernIr.TypeId, PartitionTypeDeclaration>;
    services: Record<string, PartitionService>;
    errors: Record<string, Pick<FernIr.ErrorDeclaration, "type">>;
}

export type PartitionTypeDeclaration = Pick<FernIr.TypeDeclaration, "name" | "shape">;

export type PartitionService = Pick<FernIr.HttpService, "name"> & { endpoints: PartitionEndpoint[] };

export type PartitionEndpoint = Pick<
    FernIr.HttpEndpoint,
    "id" | "requestBody" | "response" | "errors" | "pathParameters" | "queryParameters" | "headers"
>;

export interface TypeCratePartitionPlan {
    /** Shared types. Every other partition depends on this one, and it depends on none. */
    core: TypeCratePartition;
    /** Leaf partitions, ordered by key. Each depends only on {@link TypeCratePartitionPlan.core}. */
    leaves: TypeCratePartition[];
}

/**
 * Splits an API's types into one crate per top-level subpackage plus a shared
 * core crate, so that no single crate holds every generated type.
 *
 * A type is assigned to a leaf partition when exactly one partition can reach
 * it, and to core otherwise. Because assignment is reachability-based, core is
 * closed under references — anything a core type references is reachable from
 * the same partitions that reached the core type, so it is also core. That
 * guarantees the only cross-crate edges are leaf → core, which is what keeps
 * the emitted cargo dependency graph acyclic.
 */
export function planTypeCratePartitions(ir: TypePartitionInput): TypeCratePartitionPlan {
    const directReferences = buildDirectReferenceGraph(ir);
    const { typeSeeds, endpointsByPartition } = collectPartitionSeeds(ir);
    const seeds = typeSeeds;

    // Reachable partitions per type, saturating at two: once a type is shared it
    // belongs in core no matter how many other partitions also reach it.
    const reachedBy = new Map<FernIr.TypeId, Set<string>>();
    for (const [partitionKey, seedTypeIds] of seeds) {
        const stack = [...seedTypeIds];
        while (stack.length > 0) {
            const typeId = stack.pop();
            if (typeId == null || !(typeId in ir.types)) {
                continue;
            }
            let partitions = reachedBy.get(typeId);
            if (partitions == null) {
                partitions = new Set();
                reachedBy.set(typeId, partitions);
            }
            if (partitions.has(partitionKey) || partitions.size > 1) {
                continue;
            }
            partitions.add(partitionKey);
            stack.push(...(directReferences.get(typeId) ?? []));
        }
    }

    const byPartition = new Map<string, FernIr.TypeId[]>();
    for (const typeId of Object.keys(ir.types)) {
        const partitions = reachedBy.get(typeId);
        // Types no partition reaches are unreferenced, so core keeps them
        // exported without pinning them to an arbitrary leaf.
        const key = partitions?.size === 1 ? getOnlyMember(partitions) : CORE_PARTITION_KEY;
        const typeIds = byPartition.get(key);
        if (typeIds == null) {
            byPartition.set(key, [typeId]);
        } else {
            typeIds.push(typeId);
        }
    }

    // A partition exists if it owns types or endpoints; an API whose types all
    // got hoisted to core can still own request structs.
    const leafKeys = new Set<string>([...byPartition.keys(), ...endpointsByPartition.keys()]);
    leafKeys.delete(CORE_PARTITION_KEY);

    const leaves = [...leafKeys]
        .map((key) => ({
            key,
            typeIds: (byPartition.get(key) ?? []).sort(),
            endpointIds: (endpointsByPartition.get(key) ?? []).sort()
        }))
        .filter((partition) => partition.typeIds.length > 0 || partition.endpointIds.length > 0)
        .sort((a, b) => a.key.localeCompare(b.key));

    return {
        core: {
            key: CORE_PARTITION_KEY,
            typeIds: (byPartition.get(CORE_PARTITION_KEY) ?? []).sort(),
            // Endpoints always belong to their own service's partition, never core.
            endpointIds: endpointsByPartition.get(CORE_PARTITION_KEY)?.sort() ?? []
        },
        leaves
    };
}

/**
 * Assert the invariant the emitter depends on: the only cross-crate edge is
 * leaf -> core.
 *
 * {@link planTypeCratePartitions} is supposed to guarantee this by construction,
 * so a violation is a bug in the planner rather than something a consumer can
 * configure their way out of. It is checked anyway because the symptom otherwise
 * surfaces as unresolved-name errors from `cargo build` in the consumer's own
 * repo, against generated code they did not write — far from the cause. Failing
 * here names the offending type instead, and leaves the un-split crate as a
 * working fallback.
 *
 * Deliberately re-derives the reference graph rather than trusting the plan's
 * own bookkeeping: a check that shares the planner's intermediate state would
 * agree with it by construction and catch nothing.
 */
export function validateTypeCratePlan(ir: TypePartitionInput, plan: TypeCratePartitionPlan): void {
    const partitionByTypeId = new Map<FernIr.TypeId, string>();
    const partitionByEndpointId = new Map<FernIr.EndpointId, string>();
    for (const partition of [plan.core, ...plan.leaves]) {
        for (const typeId of partition.typeIds) {
            partitionByTypeId.set(typeId, partition.key);
        }
        for (const endpointId of partition.endpointIds) {
            partitionByEndpointId.set(endpointId, partition.key);
        }
    }

    const violations: string[] = [];
    const checkVisible = (owner: string, referenced: FernIr.TypeId, describeOwner: string): void => {
        const home = partitionByTypeId.get(referenced);
        // A reference to a type absent from `ir.types` is dangling; the
        // traversal skips those too, and no file is emitted for them.
        if (home == null || home === owner || home === CORE_PARTITION_KEY) {
            return;
        }
        violations.push(`${describeOwner} is in crate "${owner}" but references "${referenced}" in crate "${home}"`);
    };

    const directReferences = buildDirectReferenceGraph(ir);
    for (const [typeId, owner] of partitionByTypeId) {
        for (const referenced of directReferences.get(typeId) ?? []) {
            checkVisible(owner, referenced, `type "${typeId}"`);
        }
    }

    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            const owner = partitionByEndpointId.get(endpoint.id);
            if (owner == null) {
                // Unowned endpoints are not inert: the emitter falls back to
                // core for them, which is what makes an unseeded reference a
                // core -> leaf edge.
                violations.push(`endpoint "${endpoint.id}" was not assigned to any crate`);
                continue;
            }
            for (const referenced of collectEndpointReferences(endpoint, ir)) {
                checkVisible(owner, referenced, `endpoint "${endpoint.id}"`);
            }
        }
    }

    if (violations.length > 0) {
        throw new Error(
            "Cannot split the generated types crate: the partition plan would emit a cargo workspace " +
                "that does not compile, because a crate references a type another crate owns.\n" +
                violations.map((violation) => `  - ${violation}`).join("\n") +
                "\n\nThis is a bug in the CLI generator. Remove `splitTypeCrates` from your generator " +
                "config to fall back to a single types crate, and report the API shape above."
        );
    }
}

/**
 * Seeds each partition with the types declared under its subpackage *and* the
 * types its endpoints reference. Endpoint references matter because the request
 * and query structs generated for an endpoint live in that endpoint's crate: a
 * type referenced only by two different services' endpoints would otherwise be
 * assigned to whichever subpackage declared it, leaving a second crate
 * referencing across to it. Seeding from endpoints hoists it to core instead.
 *
 * Types reached transitively are picked up by the traversal, so only the
 * entry points need seeding.
 */
function collectPartitionSeeds(ir: TypePartitionInput): {
    typeSeeds: Map<string, FernIr.TypeId[]>;
    endpointsByPartition: Map<string, FernIr.EndpointId[]>;
} {
    const typeSeeds = new Map<string, FernIr.TypeId[]>();
    const endpointsByPartition = new Map<string, FernIr.EndpointId[]>();

    const addSeed = (key: string, typeId: FernIr.TypeId): void => {
        const typeIds = typeSeeds.get(key);
        if (typeIds == null) {
            typeSeeds.set(key, [typeId]);
        } else {
            typeIds.push(typeId);
        }
    };

    for (const [typeId, typeDeclaration] of Object.entries(ir.types)) {
        const key = getPartitionKey(typeDeclaration.name.fernFilepath);
        if (key != null) {
            addSeed(key, typeId);
        }
    }

    for (const service of Object.values(ir.services)) {
        // A root-level service has no subpackage of its own, so the request and
        // query structs generated for its endpoints can only be owned by core.
        // Its type references have to be seeded from core for the same reason: a
        // type this service is the only one to reach would otherwise be assigned
        // to whichever leaf declared it, leaving core — which depends on no leaf
        // — naming a type it cannot see.
        const key = getPartitionKey(service.name.fernFilepath) ?? CORE_PARTITION_KEY;
        for (const endpoint of service.endpoints) {
            const endpointIds = endpointsByPartition.get(key);
            if (endpointIds == null) {
                endpointsByPartition.set(key, [endpoint.id]);
            } else {
                endpointIds.push(endpoint.id);
            }
            for (const typeId of collectEndpointReferences(endpoint, ir)) {
                addSeed(key, typeId);
            }
        }
    }

    return { typeSeeds, endpointsByPartition };
}

/**
 * Every type an endpoint's generated code can name: request and response
 * bodies, error bodies, and path/query/header parameters.
 */
function collectEndpointReferences(endpoint: PartitionEndpoint, ir: TypePartitionInput): Set<FernIr.TypeId> {
    const references = new Set<FernIr.TypeId>();

    if (endpoint.requestBody != null) {
        visitDiscriminatedUnion(endpoint.requestBody)._visit<void>({
            reference: (reference) => collectTypeReferences(reference.requestBodyType, references),
            inlinedRequestBody: (inlined) => {
                for (const extended of inlined.extends) {
                    references.add(extended.typeId);
                }
                for (const property of inlined.properties) {
                    collectTypeReferences(property.valueType, references);
                }
            },
            fileUpload: (fileUpload) => {
                for (const fileUploadProperty of fileUpload.properties) {
                    visitDiscriminatedUnion(fileUploadProperty, "type")._visit<void>({
                        file: () => undefined,
                        bodyProperty: (property) => collectTypeReferences(property.valueType, references),
                        _other: () => undefined
                    });
                }
            },
            bytes: () => undefined,
            _other: () => undefined
        });
    }

    if (endpoint.response?.body != null) {
        visitDiscriminatedUnion(endpoint.response.body)._visit<void>({
            json: (json) => collectJsonResponseReferences(json.value, references),
            streaming: (streaming) => collectStreamingResponseReferences(streaming.value, references),
            streamParameter: (streamParameter) => {
                visitDiscriminatedUnion(streamParameter.nonStreamResponse)._visit<void>({
                    json: (json) => collectJsonResponseReferences(json.value, references),
                    fileDownload: () => undefined,
                    text: () => undefined,
                    bytes: () => undefined,
                    _other: () => undefined
                });
                collectStreamingResponseReferences(streamParameter.streamResponse, references);
            },
            fileDownload: () => undefined,
            text: () => undefined,
            bytes: () => undefined,
            _other: () => undefined
        });
    }

    for (const responseError of endpoint.errors) {
        const errorType = ir.errors[responseError.error.errorId]?.type;
        if (errorType != null) {
            collectTypeReferences(errorType, references);
        }
    }

    for (const parameter of [...endpoint.pathParameters, ...endpoint.queryParameters, ...endpoint.headers]) {
        collectTypeReferences(parameter.valueType, references);
    }

    return references;
}

/** Both json response variants carry a `responseBodyType`. */
function collectJsonResponseReferences(response: FernIr.JsonResponse, into: Set<FernIr.TypeId>): void {
    collectTypeReferences(response.responseBodyType, into);
}

function collectStreamingResponseReferences(response: FernIr.StreamingResponse, into: Set<FernIr.TypeId>): void {
    visitDiscriminatedUnion(response)._visit<void>({
        json: (chunk) => collectTypeReferences(chunk.payload, into),
        sse: (chunk) => collectTypeReferences(chunk.payload, into),
        text: () => undefined,
        _other: () => undefined
    });
}

/**
 * The top-level subpackage a declaration lives under, which for a multi-spec CLI
 * is the spec namespace. Types declared at the root have no partition of their
 * own and fall through to core.
 */
function getPartitionKey(fernFilepath: FernIr.FernFilepath): string | undefined {
    const [topLevelPart] = fernFilepath.allParts;
    if (topLevelPart == null) {
        return undefined;
    }
    const key = typeof topLevelPart === "string" ? topLevelPart : topLevelPart.snakeCase.safeName;
    return key.length > 0 ? key : undefined;
}

function buildDirectReferenceGraph(ir: TypePartitionInput): Map<FernIr.TypeId, ReadonlySet<FernIr.TypeId>> {
    const graph = new Map<FernIr.TypeId, ReadonlySet<FernIr.TypeId>>();
    for (const [typeId, typeDeclaration] of Object.entries(ir.types)) {
        const references = new Set<FernIr.TypeId>();
        collectShapeReferences(typeDeclaration.shape, references);
        references.delete(typeId);
        graph.set(typeId, references);
    }
    return graph;
}

function collectShapeReferences(shape: FernIr.Type, into: Set<FernIr.TypeId>): void {
    visitDiscriminatedUnion(shape)._visit<void>({
        alias: (alias) => collectTypeReferences(alias.aliasOf, into),
        enum: () => undefined,
        object: (object) => {
            for (const extended of object.extends) {
                into.add(extended.typeId);
            }
            for (const property of [...object.properties, ...(object.extendedProperties ?? [])]) {
                collectTypeReferences(property.valueType, into);
            }
        },
        union: (union) => {
            for (const extended of union.extends) {
                into.add(extended.typeId);
            }
            for (const property of union.baseProperties) {
                collectTypeReferences(property.valueType, into);
            }
            for (const variant of union.types) {
                visitDiscriminatedUnion(variant.shape, "propertiesType")._visit<void>({
                    samePropertiesAsObject: (declaredTypeName) => {
                        into.add(declaredTypeName.typeId);
                    },
                    singleProperty: (property) => collectTypeReferences(property.type, into),
                    noProperties: () => undefined,
                    _other: () => undefined
                });
            }
        },
        undiscriminatedUnion: (union) => {
            for (const member of union.members) {
                collectTypeReferences(member.type, into);
            }
            for (const property of union.baseProperties ?? []) {
                collectTypeReferences(property.valueType, into);
            }
        },
        _other: () => undefined
    });
}

function collectTypeReferences(typeReference: FernIr.TypeReference, into: Set<FernIr.TypeId>): void {
    visitDiscriminatedUnion(typeReference)._visit<void>({
        container: ({ container }) =>
            visitDiscriminatedUnion(container)._visit<void>({
                list: ({ list }) => collectTypeReferences(list, into),
                set: ({ set }) => collectTypeReferences(set, into),
                optional: ({ optional }) => collectTypeReferences(optional, into),
                nullable: ({ nullable }) => collectTypeReferences(nullable, into),
                map: (map) => {
                    collectTypeReferences(map.keyType, into);
                    collectTypeReferences(map.valueType, into);
                },
                literal: () => undefined,
                _other: () => undefined
            }),
        named: (named) => {
            into.add(named.typeId);
        },
        primitive: () => undefined,
        unknown: () => undefined,
        _other: () => undefined
    });
}

function getOnlyMember(values: ReadonlySet<string>): string {
    const [only] = values;
    if (only == null) {
        throw new Error("Expected exactly one partition");
    }
    return only;
}
