import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { detectAuthBindings } from "../detectAuth.js";

/**
 * Coverage for the IR → auth binding mapping. The IR SDK's
 * `AuthScheme` constructors install the `_visit` method `detectAuth`
 * relies on, so we always go through them — never hand-assemble raw
 * `{ type: "bearer", ... }` objects.
 *
 * Helpers below skip the noise fields (docs/placeholder/etc.) the
 * generator doesn't read so each test reads as the auth shape being
 * exercised.
 */

const bearer = (overrides: { key: string; tokenEnvVar?: string }): FernIr.AuthScheme =>
    FernIr.AuthScheme.bearer({
        key: overrides.key,
        token: "token",
        tokenEnvVar: overrides.tokenEnvVar,
        tokenPlaceholder: undefined,
        docs: undefined
    });

const header = (overrides: { key: string; headerName?: string; headerEnvVar?: string }): FernIr.AuthScheme =>
    FernIr.AuthScheme.header({
        key: overrides.key,
        name: overrides.headerName ?? "X-Api-Key",
        prefix: undefined,
        headerEnvVar: overrides.headerEnvVar,
        headerPlaceholder: undefined,
        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
        docs: undefined
    });

const basic = (overrides: {
    key: string;
    usernameEnvVar?: string;
    passwordEnvVar?: string;
    usernameOmit?: boolean;
    passwordOmit?: boolean;
}): FernIr.AuthScheme =>
    FernIr.AuthScheme.basic({
        key: overrides.key,
        username: "username",
        usernameEnvVar: overrides.usernameEnvVar,
        usernameOmit: overrides.usernameOmit,
        usernamePlaceholder: undefined,
        password: "password",
        passwordEnvVar: overrides.passwordEnvVar,
        passwordOmit: overrides.passwordOmit,
        passwordPlaceholder: undefined,
        docs: undefined
    });

const auth = (...schemes: FernIr.AuthScheme[]) => ({ schemes });

describe("detectAuthBindings", () => {
    it("no schemes → no bindings", () => {
        expect(detectAuthBindings({ auth: auth(), binaryName: "acme" })).toEqual([]);
    });

    it("bearer with tokenEnvVar uses the IR-supplied env var verbatim", () => {
        const bindings = detectAuthBindings({
            auth: auth(bearer({ key: "OAuth2", tokenEnvVar: "ACME_OAUTH_TOKEN" })),
            binaryName: "acme"
        });
        expect(bindings).toHaveLength(1);
        expect(bindings[0]?.rustCall).toBe('.auth(BearerAuth::new("OAuth2").env("ACME_OAUTH_TOKEN"))');
        expect(bindings[0]?.placement).toBe("root");
        expect(bindings[0]?.authTypeImport).toBe("BearerAuth");
    });

    it("bearer without tokenEnvVar falls back to <BIN>_TOKEN (clean, no scheme noise)", () => {
        const bindings = detectAuthBindings({
            auth: auth(bearer({ key: "OAuth2" })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe('.auth(BearerAuth::new("OAuth2").env("CLOSE_TOKEN"))');
    });

    it("header scheme with headerEnvVar uses the IR value", () => {
        const bindings = detectAuthBindings({
            auth: auth(header({ key: "ApiKey", headerEnvVar: "CLOSE_API_KEY" })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth(ApiKeyAuth::new("ApiKey").source(AuthCredentialSource::any(vec![AuthCredentialSource::cli("api-key"), AuthCredentialSource::from_env("CLOSE_API_KEY")])))'
        );
        expect(bindings[0]?.placement).toBe("root");
        expect(bindings[0]?.authTypeImport).toBe("ApiKeyAuth, AuthCredentialSource");
    });

    it("header scheme without headerEnvVar falls back to <BIN>_API_KEY", () => {
        const bindings = detectAuthBindings({
            auth: auth(header({ key: "ApiKey" })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth(ApiKeyAuth::new("ApiKey").source(AuthCredentialSource::any(vec![AuthCredentialSource::cli("api-key"), AuthCredentialSource::from_env("CLOSE_API_KEY")])))'
        );
    });

    it("basic auth: IR usernameEnvVar + passwordEnvVar drive both sources", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "BasicAuth", usernameEnvVar: "CLOSE_USER", passwordEnvVar: "CLOSE_PASS" })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth_basic_scheme("BasicAuth", ' +
                'AuthCredentialSource::from_env("CLOSE_USER"), ' +
                'AuthCredentialSource::from_env("CLOSE_PASS"))'
        );
        expect(bindings[0]?.placement).toBe("binding");
        expect(bindings[0]?.authTypeImport).toBe("AuthCredentialSource");
    });

    it("basic auth with passwordOmit (Close pattern): emits auth_provider with BasicAuthProvider::username_only", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "ApiKeyAuth", usernameEnvVar: "CLOSE_API_KEY", passwordOmit: true })),
            binaryName: "close"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth_provider("ApiKeyAuth", BasicAuthProvider::username_only("ApiKeyAuth", AuthCredentialSource::from_env("CLOSE_API_KEY")))'
        );
        expect(bindings[0]?.placement).toBe("binding");
        expect(bindings[0]?.authTypeImport).toBe("AuthCredentialSource, BasicAuthProvider");
    });

    it("basic auth with usernameOmit: emits auth_provider with BasicAuthProvider::password_only", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "BasicAuth", usernameOmit: true, passwordEnvVar: "ACME_PASS" })),
            binaryName: "acme"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth_provider("BasicAuth", BasicAuthProvider::password_only("BasicAuth", AuthCredentialSource::from_env("ACME_PASS")))'
        );
    });

    it("basic auth with both halves omitted: skipped — nothing left to bind", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "BasicAuth", usernameOmit: true, passwordOmit: true })),
            binaryName: "acme"
        });
        expect(bindings).toEqual([]);
    });

    it("basic auth with no env vars falls back to <BIN>_USERNAME / <BIN>_PASSWORD", () => {
        const bindings = detectAuthBindings({
            auth: auth(basic({ key: "BasicAuth" })),
            binaryName: "acme"
        });
        expect(bindings[0]?.rustCall).toBe(
            '.auth_basic_scheme("BasicAuth", ' +
                'AuthCredentialSource::from_env("ACME_USERNAME"), ' +
                'AuthCredentialSource::from_env("ACME_PASSWORD"))'
        );
    });

    it("multiple schemes all produce bindings, in declared order", () => {
        const bindings = detectAuthBindings({
            auth: auth(
                basic({ key: "ApiKeyAuth", usernameEnvVar: "CLOSE_API_KEY", passwordOmit: true }),
                bearer({ key: "OAuth2" })
            ),
            binaryName: "close"
        });
        expect(bindings).toHaveLength(2);
        expect(bindings[0]?.rustCall).toContain('.auth_provider("ApiKeyAuth", BasicAuthProvider::username_only(');
        expect(bindings[0]?.placement).toBe("binding");
        expect(bindings[1]?.rustCall).toBe('.auth(BearerAuth::new("OAuth2").env("CLOSE_TOKEN"))');
        expect(bindings[1]?.placement).toBe("root");
    });

    // `oauth: () => null` and `inferred: () => null` branches are
    // exhaustive by visitor — no need to build heavy OAuth fixtures
    // just to assert "we returned null". If we ever start binding
    // those variants, the visitor's type signature will force the
    // test to come back.
});
