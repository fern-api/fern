import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidOauthRule } from "../valid-oauth";

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
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint getToken cannot reference nested $request properties like '$request.credentials.client_secret'; expected '$request.client-secret' instead.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
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
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint getTokenWithClientCredentials specifies 'expires-in' $response.expiresIn, which is not a valid 'expires-in' type.",
                nodePath: ["service", "endpoints", "getTokenWithClientCredentials"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'refresh-token' $request.refreshTokenDoesNotExist, which is not a valid 'refresh-token' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'access-token' $response.accessTokenDoesNotExist, which is not a valid 'access-token' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'expires-in' $response.expiresInDoesNotExist, which is not a valid 'expires-in' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'refresh-token' $response.refreshTokenDoesNotExist, which is not a valid 'refresh-token' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
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
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint getToken is missing a valid client-secret, such as '$request.client_secret'.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint getToken specifies 'scopes' $request.scopes, which is not a valid 'scopes' type.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            }
        ];
        expect(() =>
            validateOAuthRuleViolations({
                expected: expectedViolations,
                actual: violations
            })
        ).not.toThrow();
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
