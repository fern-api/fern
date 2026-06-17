import { describe, expect, it } from "vitest";
import { resolveClientTreeFromIr } from "../generateSdkGlue.js";
import type { SdkGlueIrInfo } from "../ir.js";

/**
 * Tests for the IR-based client tree resolution that replaced regex
 * parsing of generated Rust source files. Verifies that de-conflicted
 * client names (e.g. `SimpleClient2`, `PoolsClient3`) are resolved
 * correctly using the same SymbolRegistry + CaseConverter logic as
 * the Rust SDK generator.
 */
describe("resolveClientTreeFromIr", () => {
    it("produces correct client names for a flat API with no collisions", () => {
        const irInfo: SdkGlueIrInfo = {
            apiName: "petstore",
            rootPackage: {
                subpackages: ["sub_pets", "sub_owners"],
                service: undefined
            },
            subpackages: {
                sub_pets: {
                    name: "pets",
                    subpackages: [],
                    service: "svc_pets",
                    hasEndpointsInTree: true
                },
                sub_owners: {
                    name: "owners",
                    subpackages: [],
                    service: "svc_owners",
                    hasEndpointsInTree: true
                }
            },
            casingsConfig: undefined
        };

        const result = resolveClientTreeFromIr(irInfo);
        expect(result.name).toBe("PetstoreClient");
        expect(result.hasHttpClient).toBe(false);
        expect(result.subClients).toHaveLength(2);
        expect(result.subClients[0]?.typeName).toBe("PetsClient");
        expect(result.subClients[0]?.fieldName).toBe("pets");
        expect(result.subClients[1]?.typeName).toBe("OwnersClient");
        expect(result.subClients[1]?.fieldName).toBe("owners");
    });

    it("de-conflicts colliding client names with numbered suffixes", () => {
        // Two subpackages that both resolve to "SimpleClient" — the
        // second one should become "SimpleClient2".
        const irInfo: SdkGlueIrInfo = {
            apiName: "myapi",
            rootPackage: {
                subpackages: ["sub_a", "sub_b"],
                service: undefined
            },
            subpackages: {
                sub_a: {
                    name: "simple",
                    subpackages: [],
                    service: "svc_a",
                    hasEndpointsInTree: true
                },
                sub_b: {
                    name: "simple",
                    subpackages: [],
                    service: "svc_b",
                    hasEndpointsInTree: true
                }
            },
            casingsConfig: undefined
        };

        const result = resolveClientTreeFromIr(irInfo);
        expect(result.name).toBe("MyapiClient");
        expect(result.subClients).toHaveLength(2);
        expect(result.subClients[0]?.typeName).toBe("SimpleClient");
        expect(result.subClients[1]?.typeName).toBe("SimpleClient2");
    });

    it("de-conflicts three-way collisions with consecutive suffixes", () => {
        const irInfo: SdkGlueIrInfo = {
            apiName: "api",
            rootPackage: {
                subpackages: ["sub_1", "sub_2", "sub_3"],
                service: undefined
            },
            subpackages: {
                sub_1: {
                    name: "pools",
                    subpackages: [],
                    service: "svc_1",
                    hasEndpointsInTree: true
                },
                sub_2: {
                    name: "pools",
                    subpackages: [],
                    service: "svc_2",
                    hasEndpointsInTree: true
                },
                sub_3: {
                    name: "pools",
                    subpackages: [],
                    service: "svc_3",
                    hasEndpointsInTree: true
                }
            },
            casingsConfig: undefined
        };

        const result = resolveClientTreeFromIr(irInfo);
        expect(result.subClients.map((c) => c.typeName)).toEqual(["PoolsClient", "PoolsClient2", "PoolsClient3"]);
    });

    it("builds nested client trees from subpackage hierarchy", () => {
        const irInfo: SdkGlueIrInfo = {
            apiName: "myapi",
            rootPackage: {
                subpackages: ["sub_agents"],
                service: undefined
            },
            subpackages: {
                sub_agents: {
                    name: "agents",
                    subpackages: ["sub_drive"],
                    service: "svc_agents",
                    hasEndpointsInTree: true
                },
                sub_drive: {
                    name: "drive",
                    subpackages: [],
                    service: "svc_drive",
                    hasEndpointsInTree: true
                }
            },
            casingsConfig: undefined
        };

        const result = resolveClientTreeFromIr(irInfo);
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
        const irInfo: SdkGlueIrInfo = {
            apiName: "myapi",
            rootPackage: {
                subpackages: ["sub_active", "sub_empty"],
                service: undefined
            },
            subpackages: {
                sub_active: {
                    name: "active",
                    subpackages: [],
                    service: "svc_active",
                    hasEndpointsInTree: true
                },
                sub_empty: {
                    name: "empty",
                    subpackages: [],
                    service: undefined,
                    hasEndpointsInTree: false
                }
            },
            casingsConfig: undefined
        };

        const result = resolveClientTreeFromIr(irInfo);
        expect(result.subClients).toHaveLength(1);
        expect(result.subClients[0]?.typeName).toBe("ActiveClient");
    });

    it("registers all subpackages for de-confliction even if some are skipped", () => {
        // sub_empty has the same name "simple" but no service/endpoints.
        // It should still be registered for de-confliction so sub_active
        // gets "SimpleClient" and sub_last gets "SimpleClient3" (not "2").
        const irInfo: SdkGlueIrInfo = {
            apiName: "myapi",
            rootPackage: {
                subpackages: ["sub_active", "sub_empty", "sub_last"],
                service: undefined
            },
            subpackages: {
                sub_active: {
                    name: "simple",
                    subpackages: [],
                    service: "svc_a",
                    hasEndpointsInTree: true
                },
                sub_empty: {
                    name: "simple",
                    subpackages: [],
                    service: undefined,
                    hasEndpointsInTree: false
                },
                sub_last: {
                    name: "simple",
                    subpackages: [],
                    service: "svc_last",
                    hasEndpointsInTree: true
                }
            },
            casingsConfig: undefined
        };

        const result = resolveClientTreeFromIr(irInfo);
        expect(result.subClients).toHaveLength(2);
        expect(result.subClients[0]?.typeName).toBe("SimpleClient");
        // sub_empty registered "SimpleClient2", so sub_last gets "SimpleClient3"
        expect(result.subClients[1]?.typeName).toBe("SimpleClient3");
    });

    it("sets hasHttpClient when root package has a service", () => {
        const irInfo: SdkGlueIrInfo = {
            apiName: "myapi",
            rootPackage: {
                subpackages: [],
                service: "svc_root"
            },
            subpackages: {},
            casingsConfig: undefined
        };

        const result = resolveClientTreeFromIr(irInfo);
        expect(result.hasHttpClient).toBe(true);
    });

    it("handles root client name collision with subpackage", () => {
        // Root client is "MyapiClient", and there's a subpackage also
        // named "myapi" — the subpackage should get "MyapiClient2".
        const irInfo: SdkGlueIrInfo = {
            apiName: "myapi",
            rootPackage: {
                subpackages: ["sub_myapi"],
                service: undefined
            },
            subpackages: {
                sub_myapi: {
                    name: "myapi",
                    subpackages: [],
                    service: "svc_myapi",
                    hasEndpointsInTree: true
                }
            },
            casingsConfig: undefined
        };

        const result = resolveClientTreeFromIr(irInfo);
        expect(result.name).toBe("MyapiClient");
        expect(result.subClients[0]?.typeName).toBe("MyapiClient2");
    });

    it("uses pre-computed Name objects when available", () => {
        // When the IR provides a full Name object (not a compressed string),
        // CaseConverter uses its pre-computed casing directly.
        const irInfo: SdkGlueIrInfo = {
            apiName: {
                originalName: "CoinGecko",
                camelCase: { safeName: "coinGecko", unsafeName: "coinGecko" },
                pascalCase: { safeName: "CoinGecko", unsafeName: "CoinGecko" },
                snakeCase: { safeName: "coin_gecko", unsafeName: "coin_gecko" },
                screamingSnakeCase: { safeName: "COIN_GECKO", unsafeName: "COIN_GECKO" }
            },
            rootPackage: {
                subpackages: ["sub_coins"],
                service: undefined
            },
            subpackages: {
                sub_coins: {
                    name: {
                        originalName: "coins",
                        camelCase: { safeName: "coins", unsafeName: "coins" },
                        pascalCase: { safeName: "Coins", unsafeName: "Coins" },
                        snakeCase: { safeName: "coins", unsafeName: "coins" },
                        screamingSnakeCase: { safeName: "COINS", unsafeName: "COINS" }
                    },
                    subpackages: [],
                    service: "svc_coins",
                    hasEndpointsInTree: true
                }
            },
            casingsConfig: undefined
        };

        const result = resolveClientTreeFromIr(irInfo);
        expect(result.name).toBe("CoinGeckoClient");
        expect(result.subClients[0]?.typeName).toBe("CoinsClient");
        expect(result.subClients[0]?.fieldName).toBe("coins");
    });
});
