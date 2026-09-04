import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { computeDefaultSupport } from "../utils/primitiveTypeUtils.js";

/**
 * `computeDefaultSupport` only reads the parts of a declaration that decide Default
 * support -- the shape kind, property value types, `extends`, and alias targets -- so
 * these helpers build just those parts rather than whole valid IR declarations.
 */
function objectType(properties: FernIr.TypeReference[], extendsTypeIds: string[] = []): FernIr.TypeDeclaration {
    return {
        shape: {
            type: "object",
            properties: properties.map((valueType) => ({ valueType })),
            extends: extendsTypeIds.map((typeId) => ({ typeId }))
        }
    } as unknown as FernIr.TypeDeclaration;
}

function aliasType(aliasOf: FernIr.TypeReference): FernIr.TypeDeclaration {
    return { shape: { type: "alias", aliasOf } } as unknown as FernIr.TypeDeclaration;
}

function shapeOnlyType(type: "enum" | "union" | "undiscriminatedUnion"): FernIr.TypeDeclaration {
    return { shape: { type } } as unknown as FernIr.TypeDeclaration;
}

function named(typeId: string): FernIr.TypeReference {
    return FernIr.TypeReference.named({ typeId } as unknown as FernIr.NamedType);
}

function primitive(): FernIr.TypeReference {
    return FernIr.TypeReference.primitive({ v1: "STRING" } as unknown as FernIr.PrimitiveType);
}

function literal(): FernIr.TypeReference {
    return FernIr.TypeReference.container(
        FernIr.ContainerType.literal({ type: "string", string: "x" } as unknown as FernIr.Literal)
    );
}

/**
 * The depth-first walk this analysis replaced, kept as the oracle for its behavior:
 * a fresh `visited` set per query and no caching, so the answer it gives is by
 * definition independent of what any earlier caller asked about.
 */
function referenceNamedSupportsDefault(
    typeId: string,
    types: Record<string, FernIr.TypeDeclaration>,
    unknownHasDefault: boolean,
    visited: Set<string>
): boolean {
    if (visited.has(typeId)) {
        return false;
    }
    const typeDecl = types[typeId];
    if (typeDecl == null) {
        return false;
    }
    visited.add(typeId);
    let result = false;
    if (typeDecl.shape.type === "object") {
        const propsOk = typeDecl.shape.properties.every((property) =>
            referenceSupportsDefault(property.valueType, types, unknownHasDefault, visited)
        );
        const extendsOk = typeDecl.shape.extends.every((parentType) =>
            referenceNamedSupportsDefault(parentType.typeId, types, unknownHasDefault, visited)
        );
        result = propsOk && extendsOk;
    } else if (typeDecl.shape.type === "alias") {
        result = referenceSupportsDefault(typeDecl.shape.aliasOf, types, unknownHasDefault, visited);
    }
    visited.delete(typeId);
    return result;
}

function referenceSupportsDefault(
    typeRef: FernIr.TypeReference,
    types: Record<string, FernIr.TypeDeclaration>,
    unknownHasDefault: boolean,
    visited: Set<string>
): boolean {
    switch (typeRef.type) {
        case "primitive":
            return true;
        case "container":
            return typeRef.container.type !== "literal";
        case "named":
            return referenceNamedSupportsDefault(typeRef.typeId, types, unknownHasDefault, visited);
        case "unknown":
            return unknownHasDefault;
        default:
            return false;
    }
}

/** Deterministic PRNG so a failing case is reproducible from its seed alone. */
function seededRandom(seed: number): () => number {
    let state = seed + 0x6d2b79f5;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function randomTypeGraph(random: () => number): Record<string, FernIr.TypeDeclaration> {
    const count = 1 + Math.floor(random() * 12);
    const typeIds = Array.from({ length: count }, (_, index) => `t${index}`);
    const pickTypeId = () => typeIds[Math.floor(random() * typeIds.length)] as string;

    const randomTypeReference = (depth: number): FernIr.TypeReference => {
        const roll = random();
        if (roll < 0.4) {
            // Named references are the only edges the analysis follows, so weight them heavily.
            return named(pickTypeId());
        }
        if (roll < 0.5) {
            return FernIr.TypeReference.unknown();
        }
        if (roll < 0.55) {
            return literal();
        }
        if (roll < 0.75 && depth < 3) {
            // Containers short-circuit to "supports Default", whatever they wrap.
            const inner = randomTypeReference(depth + 1);
            return FernIr.TypeReference.container(
                random() < 0.5 ? FernIr.ContainerType.list(inner) : FernIr.ContainerType.optional(inner)
            );
        }
        return primitive();
    };

    const types: Record<string, FernIr.TypeDeclaration> = {};
    for (const typeId of typeIds) {
        const roll = random();
        if (roll < 0.6) {
            const properties = Array.from({ length: Math.floor(random() * 4) }, () => randomTypeReference(0));
            const extendsTypeIds = Array.from({ length: Math.floor(random() * 2.5) }, () => pickTypeId());
            types[typeId] = objectType(properties, extendsTypeIds);
        } else if (roll < 0.8) {
            types[typeId] = aliasType(randomTypeReference(0));
        } else if (roll < 0.9) {
            types[typeId] = shapeOnlyType("enum");
        } else {
            types[typeId] = shapeOnlyType("undiscriminatedUnion");
        }
    }
    return types;
}

describe("computeDefaultSupport", () => {
    it("matches a fresh depth-first walk on randomized type graphs", () => {
        for (let seed = 0; seed < 500; seed++) {
            const types = randomTypeGraph(seededRandom(seed));
            const support = computeDefaultSupport(types);

            for (const typeId of Object.keys(types)) {
                const actual = support.get(typeId);
                expect(actual, `seed ${seed}, ${typeId}`).toBeDefined();
                expect(actual?.withUnknown, `seed ${seed}, ${typeId} with unknown`).toBe(
                    referenceNamedSupportsDefault(typeId, types, true, new Set())
                );
                expect(actual?.withoutUnknown, `seed ${seed}, ${typeId} without unknown`).toBe(
                    referenceNamedSupportsDefault(typeId, types, false, new Set())
                );
            }
        }
    });

    it("refuses Default for types on a dependency cycle", () => {
        const types = {
            selfReferential: objectType([named("selfReferential")]),
            x: objectType([named("y")]),
            y: objectType([named("x")]),
            reachesCycle: objectType([named("x"), primitive()]),
            behindContainer: objectType([FernIr.TypeReference.container(FernIr.ContainerType.list(named("x")))]),
            inheritsCycle: objectType([], ["x"])
        };
        const support = computeDefaultSupport(types);

        expect(support.get("selfReferential")?.withUnknown).toBe(false);
        expect(support.get("x")?.withUnknown).toBe(false);
        expect(support.get("y")?.withUnknown).toBe(false);
        expect(support.get("reachesCycle")?.withUnknown).toBe(false);
        expect(support.get("inheritsCycle")?.withUnknown).toBe(false);
        // Vec<X> implements Default whether or not X does, so the walk stops here.
        expect(support.get("behindContainer")?.withUnknown).toBe(true);
    });

    it("tracks both readings of unknown through named types", () => {
        const types = {
            payload: objectType([FernIr.TypeReference.unknown()]),
            wrapper: objectType([named("payload")]),
            inheritsPayload: objectType([primitive()], ["payload"]),
            aliasOfWrapper: aliasType(named("wrapper"))
        };
        const support = computeDefaultSupport(types);

        for (const typeId of Object.keys(types)) {
            expect(support.get(typeId)?.withUnknown, `${typeId} with unknown`).toBe(true);
            expect(support.get(typeId)?.withoutUnknown, `${typeId} without unknown`).toBe(false);
        }
    });

    it("resolves deep dependency chains without recursing", () => {
        const depth = 5000;
        const types: Record<string, FernIr.TypeDeclaration> = {};
        for (let index = 0; index < depth; index++) {
            types[`t${index}`] = objectType([index === depth - 1 ? primitive() : named(`t${index + 1}`)]);
        }
        types.blocked = objectType([named("t0"), literal()]);

        const support = computeDefaultSupport(types);

        expect(support.get("t0")?.withUnknown).toBe(true);
        expect(support.get(`t${depth - 1}`)?.withUnknown).toBe(true);
        expect(support.get("blocked")?.withUnknown).toBe(false);
    });

    it("treats references to types missing from the IR as having no Default", () => {
        const support = computeDefaultSupport({ present: objectType([named("absent")]) });

        expect(support.get("present")?.withUnknown).toBe(false);
        expect(support.get("absent")).toBeUndefined();
    });
});
