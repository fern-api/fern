import { FernIr } from "@fern-api/ir-sdk";

const stableStatuses: FernIr.AvailabilityStatus[] = [FernIr.AvailabilityStatus.GeneralAvailability];

export function isMarkedUnstable(availability: FernIr.Availability | undefined): boolean {
    return availability !== undefined && !stableStatuses.includes(availability.status);
}

export function getStableTypeIdsFromIr(ir: FernIr.IntermediateRepresentation): Set<FernIr.TypeId> {
    let stableTypes = new Set<FernIr.TypeId>();
    if (ir.headers !== undefined) {
        ir.headers.forEach((header) => {
            stableTypes.union(getStableTypeIdsFromHeader(header));
        });
    }

    return stableTypes;
}

function getStableTypeIdsFromHeader(header: FernIr.HttpHeader): Set<FernIr.TypeId> {
    if (isMarkedUnstable(header.availability)) {
        return new Set<FernIr.TypeId>();
    }
    return header.valueType._visit({
        container: (container) => {
            return getTypeIdsFromContainer(container);
        },
        named: (named) => {
            return getTypeIdsFromNamed(named);
        },
        primitive: (primitive) => {
            return getTypeIdsFromPrimitive(primitive);
        },
        unknown: () => {
            return new Set<FernIr.TypeId>();
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getTypeIdsFromContainer(container: FernIr.ContainerType): Set<FernIr.TypeId> {
    return container._visit({
        list: (list) => {
            return getTypeIdsFromTypeReference(list);
        },
        map: (map) => {
            return getTypeIdsFromTypeReference(map.keyType).union(getTypeIdsFromTypeReference(map.valueType));
        },
        nullable: (nullable) => {
            return getTypeIdsFromTypeReference(nullable);
        },
        optional: (optional) => {
            return getTypeIdsFromTypeReference(optional);
        },
        set: (set) => {
            return getTypeIdsFromTypeReference(set);
        },
        literal: (literal) => {
            return new Set([literal.type]);
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getTypeIdsFromTypeReference(typeReference: FernIr.TypeReference): Set<FernIr.TypeId> {
    return typeReference._visit({
        container: (container) => {
            return getTypeIdsFromContainer(container);
        },
        named: (named) => {
            return getTypeIdsFromNamed(named);
        },
        primitive: (primitive) => {
            return getTypeIdsFromPrimitive(primitive);
        },
        unknown: () => {
            return new Set<FernIr.TypeId>();
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getTypeIdsFromNamed(named: FernIr.NamedType): Set<FernIr.TypeId> {
    return new Set([named.typeId]);
}

function getTypeIdsFromPrimitive(primitive: FernIr.PrimitiveType): Set<FernIr.TypeId> {
    if (primitive.v2 !== undefined) {
        return new Set([primitive.v2.type]);
    }
    return new Set([primitive.v1]);
}
