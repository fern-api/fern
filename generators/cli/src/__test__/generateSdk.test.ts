import { describe, expect, it } from "vitest";
import type { SdkGeneratorContext } from "@fern-api/rust-sdk";
import { resolveClientTreeFromContext } from "../generateSdk.js";

/**
 * Tests for context-based client tree resolution. The CLI reads
 * de-conflicted names directly from the Rust SDK generator's
 * `SdkGeneratorContext` — no independent re-derivation.
 *
 * These tests verify the tree-traversal and filtering logic; the
 * actual de-confliction is the Rust SDK generator's responsibility
 * and is tested in its own package.
 */

interface MockSubpackage {
    id: string;
    name: string;
    snakeName: string;
    clientName: string;
    service: string | undefined;
    hasEndpointsInTree: boolean;
    subpackages: string[];
}

function createMockContext(opts: {
    rootClientName: string;
    rootSubpackages: string[];
    rootService?: string;
    subpackages: Record<string, MockSubpackage>;
}): SdkGeneratorContext {
    const subpackageMap = opts.subpackages;

    return {
        getClientName: () => opts.rootClientName,
        ir: {
            rootPackage: {
                subpackages: opts.rootSubpackages,
                service: opts.rootService ?? undefined
            }
        },
        getSubpackageOrThrow: (id: string) => {
            const sp = subpackageMap[id];
            if (sp == null) {
                throw new Error(`Subpackage ${id} not found in mock`);
            }
            return {
                name: sp.name,
                service: sp.service,
                hasEndpointsInTree: sp.hasEndpointsInTree,
                subpackages: sp.subpackages,
                fernFilepath: { allParts: [sp.snakeName] }
            };
        },
        getUniqueClientNameForSubpackage: (subpackage: { name: string }) => {
            // Look up by name match — in real code this uses the registry
            const entry = Object.values(subpackageMap).find((sp) => sp.name === subpackage.name);
            if (entry == null) {
                throw new Error(`No mock mapping for subpackage name: ${subpackage.name}`);
            }
            return entry.clientName;
        },
        case: {
            snakeSafe: (name: string) => {
                // Look up the pre-computed snake name from our mock data
                const entry = Object.values(subpackageMap).find((sp) => sp.name === name);
                return entry?.snakeName ?? name;
            }
        }
    } as unknown as SdkGeneratorContext;
}

/**
 * Creates a mock context that supports multiple subpackages with the
 * same name (for collision scenarios) by using ordered lookup.
 */
function createMockContextWithOrder(opts: {
    rootClientName: string;
    rootSubpackages: string[];
    rootService?: string;
    subpackages: MockSubpackage[];
}): SdkGeneratorContext {
    const subpackageMap = new Map<string, MockSubpackage>();
    for (const sp of opts.subpackages) {
        subpackageMap.set(sp.id, sp);
    }

    return {
        getClientName: () => opts.rootClientName,
        ir: {
            rootPackage: {
                subpackages: opts.rootSubpackages,
                service: opts.rootService ?? undefined
            }
        },
        getSubpackageOrThrow: (id: string) => {
            const sp = subpackageMap.get(id);
            if (sp == null) {
                throw new Error(`Subpackage ${id} not found in mock`);
            }
            return {
                name: sp.name,
                service: sp.service,
                hasEndpointsInTree: sp.hasEndpointsInTree,
                subpackages: sp.subpackages,
                fernFilepath: { allParts: [sp.snakeName] }
            };
        },
        getUniqueClientNameForSubpackage: (subpackage: {
            name: string;
            service: unknown;
            hasEndpointsInTree: boolean;
        }) => {
            // Find the matching entry by name + service + hasEndpointsInTree combo
            // This is a simplification — in real code the registry uses subpackage IDs
            for (const sp of opts.subpackages) {
                if (
                    sp.name === subpackage.name &&
                    sp.service === subpackage.service &&
                    sp.hasEndpointsInTree === subpackage.hasEndpointsInTree
                ) {
                    return sp.clientName;
                }
            }
            // Fallback: find first match by name
            const entry = opts.subpackages.find((sp) => sp.name === subpackage.name);
            return entry?.clientName ?? `${subpackage.name}Client`;
        },
        case: {
            snakeSafe: (name: string) => {
                const entry = opts.subpackages.find((sp) => sp.name === name);
                return entry?.snakeName ?? name;
            }
        }
    } as unknown as SdkGeneratorContext;
}

describe("resolveClientTreeFromContext", () => {
    it("produces correct client names for a flat API with no collisions", () => {
        const ctx = createMockContext({
            rootClientName: "PetstoreClient",
            rootSubpackages: ["sub_pets", "sub_owners"],
            subpackages: {
                sub_pets: {
                    id: "sub_pets",
                    name: "pets",
                    snakeName: "pets",
                    clientName: "PetsClient",
                    service: "svc_pets",
                    hasEndpointsInTree: true,
                    subpackages: []
                },
                sub_owners: {
                    id: "sub_owners",
                    name: "owners",
                    snakeName: "owners",
                    clientName: "OwnersClient",
                    service: "svc_owners",
                    hasEndpointsInTree: true,
                    subpackages: []
                }
            }
        });

        const result = resolveClientTreeFromContext(ctx);
        expect(result.name).toBe("PetstoreClient");
        expect(result.hasHttpClient).toBe(false);
        expect(result.subClients).toHaveLength(2);
        expect(result.subClients[0]?.typeName).toBe("PetsClient");
        expect(result.subClients[0]?.fieldName).toBe("pets");
        expect(result.subClients[1]?.typeName).toBe("OwnersClient");
        expect(result.subClients[1]?.fieldName).toBe("owners");
    });

    it("reads de-conflicted client names from the context (numbered suffixes)", () => {
        // The context already has de-conflicted names from the Rust SDK generator.
        // We just read them — no independent re-derivation.
        const ctx = createMockContextWithOrder({
            rootClientName: "MyapiClient",
            rootSubpackages: ["sub_a", "sub_b"],
            subpackages: [
                {
                    id: "sub_a",
                    name: "simple",
                    snakeName: "simple",
                    clientName: "SimpleClient",
                    service: "svc_a",
                    hasEndpointsInTree: true,
                    subpackages: []
                },
                {
                    id: "sub_b",
                    name: "simple_2",
                    snakeName: "simple",
                    clientName: "SimpleClient2",
                    service: "svc_b",
                    hasEndpointsInTree: true,
                    subpackages: []
                }
            ]
        });

        const result = resolveClientTreeFromContext(ctx);
        expect(result.name).toBe("MyapiClient");
        expect(result.subClients).toHaveLength(2);
        expect(result.subClients[0]?.typeName).toBe("SimpleClient");
        expect(result.subClients[1]?.typeName).toBe("SimpleClient2");
    });

    it("reads three-way de-conflicted names from context", () => {
        const ctx = createMockContextWithOrder({
            rootClientName: "ApiClient",
            rootSubpackages: ["sub_1", "sub_2", "sub_3"],
            subpackages: [
                {
                    id: "sub_1",
                    name: "pools",
                    snakeName: "pools",
                    clientName: "PoolsClient",
                    service: "svc_1",
                    hasEndpointsInTree: true,
                    subpackages: []
                },
                {
                    id: "sub_2",
                    name: "pools_2",
                    snakeName: "pools",
                    clientName: "PoolsClient2",
                    service: "svc_2",
                    hasEndpointsInTree: true,
                    subpackages: []
                },
                {
                    id: "sub_3",
                    name: "pools_3",
                    snakeName: "pools",
                    clientName: "PoolsClient3",
                    service: "svc_3",
                    hasEndpointsInTree: true,
                    subpackages: []
                }
            ]
        });

        const result = resolveClientTreeFromContext(ctx);
        expect(result.subClients.map((c) => c.typeName)).toEqual(["PoolsClient", "PoolsClient2", "PoolsClient3"]);
    });

    it("builds nested client trees from subpackage hierarchy", () => {
        const ctx = createMockContext({
            rootClientName: "MyapiClient",
            rootSubpackages: ["sub_agents"],
            subpackages: {
                sub_agents: {
                    id: "sub_agents",
                    name: "agents",
                    snakeName: "agents",
                    clientName: "AgentsClient",
                    service: "svc_agents",
                    hasEndpointsInTree: true,
                    subpackages: ["sub_drive"]
                },
                sub_drive: {
                    id: "sub_drive",
                    name: "drive",
                    snakeName: "drive",
                    clientName: "DriveClient",
                    service: "svc_drive",
                    hasEndpointsInTree: true,
                    subpackages: []
                }
            }
        });

        const result = resolveClientTreeFromContext(ctx);
        expect(result.subClients).toHaveLength(1);
        const agents = result.subClients[0];
        if (agents == null) {
            throw new Error("expected agents sub-client");
        }
        expect(agents.typeName).toBe("AgentsClient");
        expect(agents.fieldName).toBe("agents");
        expect(agents.modulePath).toEqual(["agents"]);
        expect(agents.children).toHaveLength(1);
        expect(agents.children[0]?.typeName).toBe("DriveClient");
        expect(agents.children[0]?.modulePath).toEqual(["agents", "drive"]);
    });

    it("skips subpackages without service or endpoints in tree", () => {
        const ctx = createMockContext({
            rootClientName: "MyapiClient",
            rootSubpackages: ["sub_active", "sub_empty"],
            subpackages: {
                sub_active: {
                    id: "sub_active",
                    name: "active",
                    snakeName: "active",
                    clientName: "ActiveClient",
                    service: "svc_active",
                    hasEndpointsInTree: true,
                    subpackages: []
                },
                sub_empty: {
                    id: "sub_empty",
                    name: "empty",
                    snakeName: "empty",
                    clientName: "EmptyClient",
                    service: undefined,
                    hasEndpointsInTree: false,
                    subpackages: []
                }
            }
        });

        const result = resolveClientTreeFromContext(ctx);
        expect(result.subClients).toHaveLength(1);
        expect(result.subClients[0]?.typeName).toBe("ActiveClient");
    });

    it("sets hasHttpClient when root package has a service", () => {
        const ctx = createMockContext({
            rootClientName: "MyapiClient",
            rootSubpackages: [],
            rootService: "svc_root",
            subpackages: {}
        });

        const result = resolveClientTreeFromContext(ctx);
        expect(result.hasHttpClient).toBe(true);
    });

    it("reads root client name collision from context", () => {
        // The Rust SDK generator already resolved the collision — root
        // is "MyapiClient" and the subpackage got "MyapiClient2".
        const ctx = createMockContext({
            rootClientName: "MyapiClient",
            rootSubpackages: ["sub_myapi"],
            subpackages: {
                sub_myapi: {
                    id: "sub_myapi",
                    name: "myapi",
                    snakeName: "myapi",
                    clientName: "MyapiClient2",
                    service: "svc_myapi",
                    hasEndpointsInTree: true,
                    subpackages: []
                }
            }
        });

        const result = resolveClientTreeFromContext(ctx);
        expect(result.name).toBe("MyapiClient");
        expect(result.subClients[0]?.typeName).toBe("MyapiClient2");
    });

    it("handles CoinGecko-style nested groups with pre-computed names", () => {
        // CoinGecko has deeply nested groups where the Rust SDK generator
        // resolves unique client names. We read them directly.
        const ctx = createMockContext({
            rootClientName: "CoinGeckoClient",
            rootSubpackages: ["sub_coins"],
            subpackages: {
                sub_coins: {
                    id: "sub_coins",
                    name: "coins",
                    snakeName: "coins",
                    clientName: "CoinsClient",
                    service: "svc_coins",
                    hasEndpointsInTree: true,
                    subpackages: ["sub_markets"]
                },
                sub_markets: {
                    id: "sub_markets",
                    name: "markets",
                    snakeName: "markets",
                    clientName: "MarketsClient",
                    service: "svc_markets",
                    hasEndpointsInTree: true,
                    subpackages: []
                }
            }
        });

        const result = resolveClientTreeFromContext(ctx);
        expect(result.name).toBe("CoinGeckoClient");
        expect(result.subClients[0]?.typeName).toBe("CoinsClient");
        expect(result.subClients[0]?.fieldName).toBe("coins");
        expect(result.subClients[0]?.children[0]?.typeName).toBe("MarketsClient");
        expect(result.subClients[0]?.children[0]?.modulePath).toEqual(["coins", "markets"]);
    });

    it("returns empty subClients for API with no subpackages", () => {
        const ctx = createMockContext({
            rootClientName: "FlatClient",
            rootSubpackages: [],
            rootService: "svc_root",
            subpackages: {}
        });

        const result = resolveClientTreeFromContext(ctx);
        expect(result.name).toBe("FlatClient");
        expect(result.subClients).toHaveLength(0);
        expect(result.hasHttpClient).toBe(true);
    });
});
