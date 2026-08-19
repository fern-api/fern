import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidationViolation } from "../../../ValidationViolation.js";
import { ValidOauthRule } from "../valid-oauth.js";

describe("valid-oauth", () => {
    it("valid-default", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid"),
                RelativeFilePath.of("default")
            )
        });
        expect(violations).toEqual([]);
    });

    it("valid-simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid"),
                RelativeFilePath.of("simple")
            )
        });
        expect(violations).toEqual([]);
    });

    it("valid-query-parameters", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid"),
                RelativeFilePath.of("query-parameters")
            )
        });
        expect(violations).toEqual([]);
    });

    it("valid-alias", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid"),
                RelativeFilePath.of("alias")
            )
        });
        expect(violations).toEqual([]);
    });

    it("invalid-property-path", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("property-path")
            )
        });
        const expectedViolations: ValidationViolation[] = [
            {
                message:
                    "OAuth configuration for endpoint getToken cannot reference nested $request properties like '$request.credentials.client_id'; expected '$request.client-id' instead.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            },
            {
                message:
                    "OAuth configuration for endpoint getToken cannot reference nested $request properties like '$request.credentials.client_secret'; expected '$request.client-secret' instead.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            }
        ];
        expect(() =>
            validateOAuthRuleViolations({
                expected: expectedViolations,
                actual: violations
            })
        ).not.toThrow();
    });

    it("invalid-missing", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("missing")
            )
        });
        const expectedViolations: ValidationViolation[] = [
            {
                message:
                    "OAuth configuration for endpoint getTokenWithClientCredentials specifies 'access-token' $response.accessToken, which is not a valid 'access-token' type.",
                nodePath: ["service", "endpoints", "getTokenWithClientCredentials"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            },
            {
                message:
                    "OAuth configuration for endpoint getTokenWithClientCredentials specifies 'expires-in' $response.expiresIn, which is not a valid 'expires-in' type.",
                nodePath: ["service", "endpoints", "getTokenWithClientCredentials"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'refresh-token' $request.refreshTokenDoesNotExist, which is not a valid 'refresh-token' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'access-token' $response.accessTokenDoesNotExist, which is not a valid 'access-token' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'expires-in' $response.expiresInDoesNotExist, which is not a valid 'expires-in' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'refresh-token' $response.refreshTokenDoesNotExist, which is not a valid 'refresh-token' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            }
        ];
        expect(() =>
            validateOAuthRuleViolations({
                expected: expectedViolations,
                actual: violations
            })
        ).not.toThrow();
    });

    it("invalid-types", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("types")
            )
        });
        const expectedViolations: ValidationViolation[] = [
            {
                message:
                    "OAuth configuration for endpoint getToken is missing a valid client-id, such as '$request.client_id'.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            },
            {
                message:
                    "OAuth configuration for endpoint getToken is missing a valid client-secret, such as '$request.client_secret'.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            },
            {
                message:
                    "OAuth configuration for endpoint getToken specifies 'scopes' $request.scopes, which is not a valid 'scopes' type.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                name: "valid-oauth",
                severity: "fatal"
            }
        ];
        expect(() =>
            validateOAuthRuleViolations({
                expected: expectedViolations,
                actual: violations
            })
        ).not.toThrow();
    });

    it("valid-authorization-code", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid"),
                RelativeFilePath.of("authorization-code")
            )
        });
        expect(violations).toEqual([]);
    });

    it("invalid-redirect-uri-host", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("redirect-uri-host")
            )
        });
        expect(violations.length).toBeGreaterThan(0);
        expect(violations.some((violation) => violation.message.includes("must use a loopback host"))).toBe(true);
    });

    it("valid-redirect-uri-localhost", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid"),
                RelativeFilePath.of("redirect-uri-localhost")
            )
        });
        expect(violations).toEqual([]);
    });

    it("valid-device-code", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid"),
                RelativeFilePath.of("device-code")
            )
        });
        expect(violations).toEqual([]);
    });

    it("invalid-device-code-redirect-uri", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("device-code-redirect-uri")
            )
        });
        expect(violations.length).toBeGreaterThan(0);
        expect(violations.some((violation) => violation.message.includes("no browser callback"))).toBe(true);
    });

    it("invalid-device-code-pkce", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("device-code-pkce")
            )
        });
        expect(violations.length).toBeGreaterThan(0);
        expect(violations.some((violation) => violation.message.includes("does not use PKCE"))).toBe(true);
    });

    it("valid-callback-redirect-urls", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid"),
                RelativeFilePath.of("callback-redirect-urls")
            )
        });
        expect(violations).toEqual([]);
    });

    it("invalid-callback-redirect-url-scheme", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("callback-redirect-url-scheme")
            )
        });
        expect(violations.some((violation) => violation.message.includes("success-redirect-url"))).toBe(true);
        expect(
            violations.some((violation) => violation.message.includes("error-redirect-url 'ftp://acme.com/cli/error'"))
        ).toBe(true);
    });

    it("invalid-callback-redirect-url-control-character", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("callback-redirect-url-control-character")
            )
        });
        expect(violations.some((violation) => violation.message.includes("must not contain control characters"))).toBe(
            true
        );
    });

    it("invalid-device-code-callback-redirect-urls", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("device-code-callback-redirect-urls")
            )
        });
        expect(
            violations.filter(
                (violation) =>
                    violation.message.includes("device-code flow has no browser callback") &&
                    (violation.message.includes("success-redirect-url") ||
                        violation.message.includes("error-redirect-url"))
            )
        ).toHaveLength(2);
    });

    it("invalid-client-credentials-callback-redirect-urls", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("client-credentials-callback-redirect-urls")
            )
        });
        expect(
            violations.filter((violation) =>
                violation.message.includes("client-credentials flow has no browser callback")
            )
        ).toHaveLength(2);
    });

    it("invalid-client-id-env", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid"),
                RelativeFilePath.of("client-id-env")
            )
        });
        expect(violations.length).toBeGreaterThan(0);
        expect(violations.some((violation) => violation.message.includes("environment-variable client ID"))).toBe(true);
    });
});

// validateOAuthRuleViolations ensures all of the expected rule violations match,
// but only verifies the message prefix because the output differs in certain
// terminal environments.
function validateOAuthRuleViolations({
    expected,
    actual
}: {
    expected: ValidationViolation[];
    actual: ValidationViolation[];
}): void {
    expected.forEach((expected, index) => {
        const actualMessage = actual?.[index]?.message;
        expect(actualMessage).toBeDefined();
        expect(actualMessage?.startsWith(expected.message)).toBe(true);
    });
    expect(actual.map(({ message, ...rest }) => rest)).toEqual(actual.map(({ message, ...rest }) => rest));
}
