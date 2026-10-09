import { describe, expect, it } from "vitest";

import { carryOver } from "../carryOver.js";

function generatorsYml({
    config,
    authSchemes
}: {
    config?: Record<string, unknown>;
    authSchemes?: Record<string, unknown>;
}): Record<string, unknown> {
    return {
        ...(authSchemes != null ? { "auth-schemes": authSchemes } : {}),
        api: { specs: [{ openapi: "./openapi.yml" }] },
        groups: {
            cli: {
                generators: [
                    {
                        name: "fernapi/fern-cli-generator",
                        version: "0.49.0",
                        ...(config != null ? { config } : {})
                    }
                ]
            }
        }
    };
}

const LOGIN = {
    scheme: "oauth",
    type: "authorization-code",
    "authorization-url": "https://a.test/authorize",
    "token-url": "https://a.test/token"
};

describe("carryOver", () => {
    it("copies config.binaryName, customCommands, profiles and rootGroup from the previous rubicon output", () => {
        const previous = generatorsYml({
            config: {
                binaryName: "acme",
                customCommands: false,
                profiles: { enabled: true },
                rootGroup: "api",
                packageIdentity: { name: "old" }
            }
        });
        const next = generatorsYml({ config: { packageIdentity: { name: "new" } } });
        const result = carryOver(previous, next);
        expect(result.generatorsYml).toEqual(
            generatorsYml({
                config: {
                    packageIdentity: { name: "new" },
                    binaryName: "acme",
                    customCommands: false,
                    profiles: { enabled: true },
                    rootGroup: "api"
                }
            })
        );
        expect(result.carried).toEqual([
            "groups.cli.generators[0].config.binaryName",
            "groups.cli.generators[0].config.customCommands",
            "groups.cli.generators[0].config.profiles",
            "groups.cli.generators[0].config.rootGroup"
        ]);
    });

    it("adds a config block when the new output has none", () => {
        const result = carryOver(generatorsYml({ config: { binaryName: "acme" } }), generatorsYml({}));
        expect(result.generatorsYml).toEqual(generatorsYml({ config: { binaryName: "acme" } }));
    });

    it("copies client-id, success-redirect-url and error-redirect-url for an authorization-code scheme", () => {
        const previous = generatorsYml({
            authSchemes: {
                OAuth2: {
                    ...LOGIN,
                    "client-id": "public-id",
                    "success-redirect-url": "https://acme.test/ok",
                    "error-redirect-url": "https://acme.test/error"
                }
            }
        });
        const result = carryOver(previous, generatorsYml({ authSchemes: { OAuth2: LOGIN } }));
        expect(result.generatorsYml["auth-schemes"]).toEqual({
            OAuth2: {
                ...LOGIN,
                "client-id": "public-id",
                "success-redirect-url": "https://acme.test/ok",
                "error-redirect-url": "https://acme.test/error"
            }
        });
        expect(result.carried).toEqual([
            "auth-schemes.OAuth2.client-id",
            "auth-schemes.OAuth2.success-redirect-url",
            "auth-schemes.OAuth2.error-redirect-url"
        ]);
    });

    it("drops the browser-login keys when the scheme is no longer authorization-code", () => {
        const previous = generatorsYml({ authSchemes: { OAuth2: { ...LOGIN, "client-id": "public-id" } } });
        const next = generatorsYml({ authSchemes: { OAuth2: { scheme: "oauth", type: "client-credentials" } } });
        expect(carryOver(previous, next)).toEqual({ generatorsYml: next, carried: [] });
    });

    it('copies token-prefix "" for an OAuth scheme when sdk-config.yml sets no tokenPrefix', () => {
        const clientCredentials = { scheme: "oauth", type: "client-credentials" };
        const previous = generatorsYml({ authSchemes: { OAuth2: { ...clientCredentials, "token-prefix": "" } } });
        const result = carryOver(previous, generatorsYml({ authSchemes: { OAuth2: clientCredentials } }));
        expect(result.generatorsYml["auth-schemes"]).toEqual({ OAuth2: { ...clientCredentials, "token-prefix": "" } });
        expect(result.carried).toEqual(["auth-schemes.OAuth2.token-prefix"]);
    });

    it("keeps the sdk-config.yml tokenPrefix when it sets one", () => {
        const scheme = { scheme: "oauth", type: "client-credentials" };
        const previous = generatorsYml({ authSchemes: { OAuth2: { ...scheme, "token-prefix": "" } } });
        const next = generatorsYml({ authSchemes: { OAuth2: { ...scheme, "token-prefix": "Token" } } });
        expect(carryOver(previous, next)).toEqual({ generatorsYml: next, carried: [] });
    });

    it("copies nothing when there is no previous rubicon output (the --force case)", () => {
        const next = generatorsYml({});
        expect(carryOver(undefined, next)).toEqual({ generatorsYml: next, carried: [] });
    });

    it("copies no other key, for example a hand-edited environment", () => {
        const previous = {
            ...generatorsYml({}),
            api: { specs: [{ openapi: "./openapi.yml" }], environments: { prod: "https://hand.test" } }
        };
        const next = generatorsYml({});
        expect(carryOver(previous, next)).toEqual({ generatorsYml: next, carried: [] });
    });
});
