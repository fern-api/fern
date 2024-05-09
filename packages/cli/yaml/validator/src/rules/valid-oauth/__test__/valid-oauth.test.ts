import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
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
                    "OAuth configuration for endpoint getToken cannot reference nested $request properties like '$request.credentials.client_id'; expected '$request.client-id' instead. For details, see the docs.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint getToken cannot reference nested $request properties like '$request.credentials.client_secret'; expected '$request.client-secret' instead. For details, see the docs.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            }
        ];
        expect(violations).toEqual(expectedViolations);
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
                    "OAuth configuration for endpoint getTokenWithClientCredentials specifies 'access-token' $response.accessToken, which is not a valid 'access-token' type. For details, see the docs.",
                nodePath: ["service", "endpoints", "getTokenWithClientCredentials"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint getTokenWithClientCredentials specifies 'expires-in' $response.expiresIn, which is not a valid 'expires-in' type. For details, see the docs.",
                nodePath: ["service", "endpoints", "getTokenWithClientCredentials"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'refresh-token' $request.refreshTokenDoesNotExist, which is not a valid 'refresh-token' type. For details, see the docs.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'access-token' $response.accessTokenDoesNotExist, which is not a valid 'access-token' type. For details, see the docs.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'expires-in' $response.expiresInDoesNotExist, which is not a valid 'expires-in' type. For details, see the docs.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'refresh-token' $response.refreshTokenDoesNotExist, which is not a valid 'refresh-token' type. For details, see the docs.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            }
        ];
        expect(violations).toEqual(expectedViolations);
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
                    "OAuth configuration for endpoint getToken is missing a valid client-id, such as '$request.client_id'. For details, see the docs.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint getToken is missing a valid client-secret, such as '$request.client_secret'. For details, see the docs.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint getToken specifies 'scopes' $request.scopes, which is not a valid 'scopes' type. For details, see the docs.",
                nodePath: ["service", "endpoints", "getToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            }
        ];
        expect(violations).toEqual(expectedViolations);
    });
});
