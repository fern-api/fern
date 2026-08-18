import { describe, expect, it } from "vitest";
import { resolveChannelAuth, validateCustomConfig } from "../customConfig.js";

describe("validateCustomConfig", () => {
    it("returns defaults (customCommands: true) for null/undefined", () => {
        expect(validateCustomConfig(null)).toEqual({ customCommands: true });
        expect(validateCustomConfig(undefined)).toEqual({ customCommands: true });
    });

    it("returns the empty result for an empty object (customCommands resolved at pipeline level)", () => {
        expect(validateCustomConfig({})).toEqual({});
    });

    it("accepts a string binaryName", () => {
        expect(validateCustomConfig({ binaryName: "acme-cli" })).toEqual({ binaryName: "acme-cli" });
    });

    it("ignores undefined binaryName explicitly set", () => {
        expect(validateCustomConfig({ binaryName: undefined })).toEqual({});
    });

    it("ignores unknown keys (forward-compatible)", () => {
        expect(validateCustomConfig({ binaryName: "x", futureField: 42 })).toEqual({ binaryName: "x" });
    });

    it("throws on non-string binaryName (number)", () => {
        expect(() => validateCustomConfig({ binaryName: 42 })).toThrow(/expected a string, got number/);
    });

    it("throws on non-string binaryName (object)", () => {
        expect(() => validateCustomConfig({ binaryName: {} })).toThrow(/expected a string, got object/);
    });

    it("throws on non-object input (string)", () => {
        expect(() => validateCustomConfig("acme")).toThrow(/expected an object, got string/);
    });

    it("throws on non-object input (array)", () => {
        expect(() => validateCustomConfig(["acme"])).toThrow(/expected an object, got array/);
    });

    it("accepts a boolean customCommands", () => {
        expect(validateCustomConfig({ customCommands: false })).toEqual({ customCommands: false });
    });

    it("throws on non-boolean customCommands", () => {
        expect(() => validateCustomConfig({ customCommands: "yes" })).toThrow(/expected a boolean, got string/);
    });

    it("accepts a string rootGroup", () => {
        expect(validateCustomConfig({ rootGroup: "api" })).toEqual({ rootGroup: "api" });
    });

    it("ignores undefined rootGroup explicitly set", () => {
        expect(validateCustomConfig({ rootGroup: undefined })).toEqual({});
    });

    it("throws on non-string rootGroup (number)", () => {
        expect(() => validateCustomConfig({ rootGroup: 42 })).toThrow(/expected a string, got number/);
    });

    it("throws on non-string rootGroup (boolean)", () => {
        expect(() => validateCustomConfig({ rootGroup: true })).toThrow(/expected a string, got boolean/);
    });

    it("accepts rootGroup with hyphens, underscores, and digits", () => {
        expect(validateCustomConfig({ rootGroup: "my-api_v2" })).toEqual({ rootGroup: "my-api_v2" });
    });

    it("throws on rootGroup with uppercase letters", () => {
        expect(() => validateCustomConfig({ rootGroup: "Api" })).toThrow(/contains invalid characters/);
    });

    it("throws on rootGroup starting with a digit", () => {
        expect(() => validateCustomConfig({ rootGroup: "2api" })).toThrow(/contains invalid characters/);
    });

    it("throws on rootGroup containing quotes (injection attempt)", () => {
        expect(() => validateCustomConfig({ rootGroup: 'api")); panic!("' })).toThrow(/contains invalid characters/);
    });

    it("throws on empty rootGroup", () => {
        expect(() => validateCustomConfig({ rootGroup: "" })).toThrow(/contains invalid characters/);
    });

    it("accepts a valid userAgentSuffixFlag", () => {
        expect(validateCustomConfig({ userAgentSuffixFlag: "via" })).toEqual({ userAgentSuffixFlag: "via" });
    });

    it("accepts a kebab userAgentSuffixFlag with digits", () => {
        expect(validateCustomConfig({ userAgentSuffixFlag: "user-agent-suffix" })).toEqual({
            userAgentSuffixFlag: "user-agent-suffix"
        });
        expect(validateCustomConfig({ userAgentSuffixFlag: "app-info2" })).toEqual({
            userAgentSuffixFlag: "app-info2"
        });
    });

    it("ignores undefined userAgentSuffixFlag explicitly set (default applied downstream)", () => {
        expect(validateCustomConfig({ userAgentSuffixFlag: undefined })).toEqual({});
    });

    it("throws on non-string userAgentSuffixFlag", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: 42 })).toThrow(/expected a string, got number/);
    });

    it("throws on userAgentSuffixFlag with a leading --", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "--via" })).toThrow(/is not a valid flag name/);
    });

    it("throws on userAgentSuffixFlag with uppercase letters", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "Via" })).toThrow(/is not a valid flag name/);
    });

    it("throws on userAgentSuffixFlag starting with a digit", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "1x" })).toThrow(/is not a valid flag name/);
    });

    it("throws on userAgentSuffixFlag with underscores", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "user_agent" })).toThrow(/is not a valid flag name/);
    });

    it("throws on empty userAgentSuffixFlag", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "" })).toThrow(/is not a valid flag name/);
    });

    it("throws on userAgentSuffixFlag that collides with a built-in flag", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "base-url" })).toThrow(/is a built-in flag name/);
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "format" })).toThrow(/is a built-in flag name/);
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "help" })).toThrow(/is a built-in flag name/);
    });

    it("still accepts the default suffix flag name (its own reserved slot)", () => {
        expect(validateCustomConfig({ userAgentSuffixFlag: "user-agent-suffix" })).toEqual({
            userAgentSuffixFlag: "user-agent-suffix"
        });
    });

    it("accepts generateWireTests true/false", () => {
        expect(validateCustomConfig({ generateWireTests: true })).toEqual({ generateWireTests: true });
        expect(validateCustomConfig({ generateWireTests: false })).toEqual({ generateWireTests: false });
    });

    it("ignores generateWireTests explicitly set to undefined", () => {
        expect(validateCustomConfig({ generateWireTests: undefined })).toEqual({});
    });

    it("throws on non-boolean generateWireTests", () => {
        expect(() => validateCustomConfig({ generateWireTests: "yes" })).toThrow(/expected a boolean, got string/);
    });

    it("accepts splitTypeCrates true/false", () => {
        expect(validateCustomConfig({ splitTypeCrates: true })).toEqual({ splitTypeCrates: true });
        expect(validateCustomConfig({ splitTypeCrates: false })).toEqual({ splitTypeCrates: false });
    });

    it("ignores splitTypeCrates explicitly set to undefined", () => {
        expect(validateCustomConfig({ splitTypeCrates: undefined })).toEqual({});
    });

    it("throws on non-boolean splitTypeCrates", () => {
        expect(() => validateCustomConfig({ splitTypeCrates: "yes" })).toThrow(/expected a boolean, got string/);
    });

    it("accepts a packageIdentity block", () => {
        const packageIdentity = {
            name: "agentmail-cli",
            repository: "https://github.com/agentmail-to/agentmail-cli-fern",
            authors: ["AgentMail <support@agentmail.cc>"],
            keywords: ["email", "agent"]
        };
        expect(validateCustomConfig({ packageIdentity })).toEqual({ packageIdentity });
    });

    it("throws on a packageIdentity name that cargo would reject", () => {
        expect(() => validateCustomConfig({ packageIdentity: { name: "agent mail!" } })).toThrow(
            /not a valid cargo crate name/
        );
    });

    it("throws on non-string packageIdentity fields", () => {
        expect(() => validateCustomConfig({ packageIdentity: { repository: 42 } })).toThrow(
            /packageIdentity.repository: expected a string, got number/
        );
        expect(() => validateCustomConfig({ packageIdentity: { authors: "me" } })).toThrow(
            /packageIdentity.authors: expected an array of strings/
        );
        expect(() => validateCustomConfig({ packageIdentity: [] })).toThrow(
            /packageIdentity: expected an object, got array/
        );
    });
});

describe("validateCustomConfig — distribution", () => {
    it("leaves distribution undefined when the block is absent", () => {
        expect(validateCustomConfig({ binaryName: "acme" }).distribution).toBeUndefined();
    });

    it("accepts a homebrew-only block", () => {
        expect(validateCustomConfig({ distribution: { homebrew: { tap: "acme/homebrew-tap" } } })).toEqual({
            distribution: { homebrew: { tap: "acme/homebrew-tap" } }
        });
    });

    it("accepts a scoop-only block", () => {
        expect(validateCustomConfig({ distribution: { scoop: { bucket: "acme/scoop-bucket" } } })).toEqual({
            distribution: { scoop: { bucket: "acme/scoop-bucket" } }
        });
    });

    it("accepts both channels with every optional field set", () => {
        const distribution = {
            homebrew: {
                tap: "acme/homebrew-tap",
                formula: "acme-cli",
                tokenEnvironmentVariable: "TAP_PAT"
            },
            scoop: { bucket: "acme/scoop-bucket", tokenEnvironmentVariable: "BUCKET_PAT" }
        };
        expect(validateCustomConfig({ distribution })).toEqual({ distribution });
    });

    it("requires tap and bucket to be <owner>/<repo>", () => {
        expect(() => validateCustomConfig({ distribution: { homebrew: {} } })).toThrow(
            /homebrew\.tap: undefined is not a GitHub repository/
        );
        expect(() => validateCustomConfig({ distribution: { homebrew: { tap: "homebrew-tap" } } })).toThrow(
            /homebrew\.tap: "homebrew-tap" is not a GitHub repository/
        );
        expect(() =>
            validateCustomConfig({ distribution: { homebrew: { tap: "https://github.com/acme/homebrew-tap" } } })
        ).toThrow(/is not a GitHub repository/);
        expect(() => validateCustomConfig({ distribution: { scoop: { bucket: 42 } } })).toThrow(
            /scoop\.bucket: 42 is not a GitHub repository/
        );
    });

    it("rejects a formula name Homebrew could not resolve to a .rb file", () => {
        expect(() =>
            validateCustomConfig({ distribution: { homebrew: { tap: "acme/homebrew-tap", formula: "Acme_CLI" } } })
        ).toThrow(/not a valid Homebrew formula name/);
    });

    it("rejects a token name that would emit broken `secrets.<NAME>` YAML", () => {
        expect(() =>
            validateCustomConfig({
                distribution: { homebrew: { tap: "acme/homebrew-tap", tokenEnvironmentVariable: "tap-token" } }
            })
        ).toThrow(/not a valid GitHub Actions secret name/);
    });

    // The built-in token is scoped to the CLI repo, so a pipeline configured
    // with it would only fail at release time — after the tag is cut.
    it("rejects GITHUB_TOKEN for both channels, pointing at a PAT", () => {
        expect(() =>
            validateCustomConfig({
                distribution: { homebrew: { tap: "acme/homebrew-tap", tokenEnvironmentVariable: "GITHUB_TOKEN" } }
            })
        ).toThrow(/GITHUB_TOKEN cannot be used here.*personal access/s);
        expect(() =>
            validateCustomConfig({
                distribution: { scoop: { bucket: "acme/scoop-bucket", tokenEnvironmentVariable: "GITHUB_TOKEN" } }
            })
        ).toThrow(/GITHUB_TOKEN cannot be used here/);
    });

    it("rejects non-object distribution values", () => {
        expect(() => validateCustomConfig({ distribution: [] })).toThrow(/distribution: expected an object, got array/);
        expect(() => validateCustomConfig({ distribution: { scoop: "acme/scoop-bucket" } })).toThrow(
            /distribution\.scoop: expected an object, got string/
        );
    });
});

describe("validateCustomConfig — distribution.githubApp", () => {
    const githubApp = { appIdSecret: "PUBLISH_APP_ID", privateKeySecret: "PUBLISH_APP_PRIVATE_KEY" };

    it("accepts a shared app alongside both channels", () => {
        const distribution = {
            githubApp,
            homebrew: { tap: "acme/homebrew-tap" },
            scoop: { bucket: "acme/scoop-bucket" }
        };
        expect(validateCustomConfig({ distribution })).toEqual({ distribution });
    });

    /**
     * `optionalSecretName` returns `undefined` rather than throwing, so
     * routing these through it would emit `private-key: ${{ secrets. }}`.
     * That is not a valid Actions expression, so GitHub refuses to load
     * `release.yml` at all — taking down archives, installers and
     * `curl | bash` too, not just the channel whose key was mistyped.
     */
    it("requires both halves", () => {
        expect(() => validateCustomConfig({ distribution: { githubApp: { appIdSecret: "PUBLISH_APP_ID" } } })).toThrow(
            /Missing customConfig\.distribution\.githubApp\.privateKeySecret/
        );
        expect(() =>
            validateCustomConfig({ distribution: { githubApp: { privateKeySecret: "PUBLISH_APP_PRIVATE_KEY" } } })
        ).toThrow(/Missing customConfig\.distribution\.githubApp\.appIdSecret/);
        expect(() => validateCustomConfig({ distribution: { githubApp: {} } })).toThrow(
            /both appIdSecret and privateKeySecret are required/
        );
    });

    it("rejects malformed secret names", () => {
        expect(() =>
            validateCustomConfig({ distribution: { githubApp: { ...githubApp, appIdSecret: "publish-app-id" } } })
        ).toThrow(/is not a valid GitHub Actions secret name/);
        expect(() =>
            validateCustomConfig({ distribution: { githubApp: { ...githubApp, privateKeySecret: 42 } } })
        ).toThrow(/privateKeySecret: 42 is not a valid GitHub Actions secret name/);
    });

    // The message must not tell someone already configuring a GitHub App to
    // go create a GitHub App, which is what the PAT-oriented copy does.
    it("rejects GITHUB_TOKEN with an app-appropriate message", () => {
        expect(() =>
            validateCustomConfig({ distribution: { githubApp: { ...githubApp, appIdSecret: "GITHUB_TOKEN" } } })
        ).toThrow(/not a GitHub App credential/);
        expect(() =>
            validateCustomConfig({ distribution: { githubApp: { ...githubApp, privateKeySecret: "GITHUB_TOKEN" } } })
        ).toThrow(/not a GitHub App credential/);
    });

    it("rejects a non-object githubApp", () => {
        expect(() => validateCustomConfig({ distribution: { githubApp: "PUBLISH_APP_ID" } })).toThrow(
            /distribution\.githubApp: expected an object, got string/
        );
    });
});

describe("resolveChannelAuth", () => {
    const githubApp = { appIdSecret: "PUBLISH_APP_ID", privateKeySecret: "PUBLISH_APP_PRIVATE_KEY" };

    it("falls back to the channel default when nothing is configured", () => {
        expect(
            resolveChannelAuth({
                tokenEnvironmentVariable: undefined,
                githubApp: undefined,
                defaultTokenSecret: "HOMEBREW_TAP_TOKEN"
            })
        ).toEqual({ type: "pat", tokenSecret: "HOMEBREW_TAP_TOKEN" });
    });

    it("uses a shared app when the channel pins no token", () => {
        expect(
            resolveChannelAuth({
                tokenEnvironmentVariable: undefined,
                githubApp,
                defaultTokenSecret: "SCOOP_BUCKET_TOKEN"
            })
        ).toEqual({ type: "githubApp", app: githubApp });
    });

    /**
     * The one mixing case with a real use: a shared App plus
     * `scoop.tokenEnvironmentVariable` reads as "App everywhere except
     * Scoop, which is not migrated yet". Because the channel-level PAT is
     * the more specific setting, this is intent rather than conflict —
     * which is why there is no mutual-exclusivity error to raise.
     */
    it("lets an explicit channel token override a shared app", () => {
        expect(
            resolveChannelAuth({
                tokenEnvironmentVariable: "BUCKET_PAT",
                githubApp,
                defaultTokenSecret: "SCOOP_BUCKET_TOKEN"
            })
        ).toEqual({ type: "pat", tokenSecret: "BUCKET_PAT" });
    });
});
